import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Sparkles, Users, Brain } from 'lucide-react';
import { format } from 'date-fns';

import ChatInterface from '../components/dashboard/ChatInterface';
import AgentActivity from '../components/dashboard/AgentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import DirectorHierarchy from '../components/dashboard/DirectorHierarchy';
import SecurityStatus from '../components/dashboard/SecurityStatus';
import { useDirectorOrchestrator } from '../components/directors/DirectorOrchestrator';
import { useSecurityManager } from '../components/security/SecurityManager';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orchestrator = useDirectorOrchestrator();
  const securityManager = useSecurityManager();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userSecurity } = useQuery({
    queryKey: ['user-security', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const security = await base44.entities.UserSecurity.filter({ created_by: user.email });
      return security[0] || null;
    },
    enabled: !!user
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date'),
    initialData: []
  });

  const { data: directors } = useQuery({
    queryKey: ['directors'],
    queryFn: () => base44.entities.Director.filter({ is_active: true }),
    initialData: []
  });

  const { data: managers } = useQuery({
    queryKey: ['managers'],
    queryFn: () => base44.entities.Manager.filter({ is_active: true }),
    initialData: []
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.filter({ is_active: true }),
    initialData: []
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, messages }) => 
      base44.entities.Conversation.update(id, { messages }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  useEffect(() => {
    const initConversation = async () => {
      if (conversations.length > 0) {
        const latest = conversations[0];
        setCurrentConversationId(latest.id);
        setMessages(latest.messages || []);
      } else {
        const newConv = await base44.entities.Conversation.create({
          messages: []
        });
        setCurrentConversationId(newConv.id);
      }
    };

    initConversation();
  }, [conversations]);

  const addActivity = useCallback((actor, action, status = 'completed') => {
    const activity = {
      actor,
      action,
      status,
      timestamp: format(new Date(), 'HH:mm:ss')
    };
    setActivities(prev => [activity, ...prev].slice(0, 20));
  }, []);

  const handleSendMessage = useCallback(async (userMessage) => {
    setIsProcessing(true);

    const userMsg = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMsg]);

    try {
      if (userSecurity?.compliance_level) {
        await securityManager.ensureCompliance(
          { type: 'message', details: userMessage },
          user,
          userSecurity.compliance_level
        );
      }

      const task = await createTaskMutation.mutateAsync({
        user_request: userMessage,
        status: 'processing',
        priority: 'medium',
        assigned_agents: ['Orchestrator'],
        execution_log: []
      });

      addActivity('Master Orchestrator', 'Analyzing request...', 'processing');
      const routing = await orchestrator.routeToDirector(userMessage);

      addActivity('Master Orchestrator', `Routing to ${routing.primary_director}`, 'completed');
      const results = await orchestrator.executeRequest(userMessage, routing);

      const responsePrompt = `You are the Master Orchestrator, a super-intelligent AI coordinating a team of specialist AIs. Your team has just executed a user's request.

USER REQUEST: "${userMessage}"

EXECUTION RESULTS & ANALYSIS:
${results.map(r => JSON.stringify(r, null, 2)).join('\n')}

Your task is to synthesize these results into a single, clear, and friendly response for the user.
- Be conversational and direct.
- Confirm what was accomplished.
- Provide the key results or outputs directly. Don't just say 'I did it', show the result.
- If actions were taken (e.g., 'sent an email'), state it clearly.
- If relevant, suggest a next step or ask a clarifying question.
- Format your response for readability using markdown (e.g., lists, bolding).`;

      const finalResponse = await base44.integrations.Core.InvokeLLM({ prompt: responsePrompt });

      const assistantMsg = {
        role: 'assistant',
        content: finalResponse,
        timestamp: new Date().toISOString(),
        agent_name: 'Master Orchestrator'
      };

      setMessages(prevMessages => [...prevMessages, assistantMsg]);

      // Use functional update for mutations to ensure latest state
      setMessages(prevFinalMessages => {
        if (currentConversationId) {
          updateConversationMutation.mutate({
            id: currentConversationId,
            messages: prevFinalMessages
          });
        }
        return prevFinalMessages;
      });

      await base44.entities.Task.update(task.id, {
        status: 'completed',
        result: finalResponse,
        execution_log: activities // Log final activities
      });

      if (user?.id) {
          await securityManager.auditAction(user.id, 
            { type: 'task_completion', details: userMessage },
            { success: true, task_id: task.id }
          );
      }

      addActivity('Master Orchestrator', 'Task completed successfully', 'completed');

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMsg = {
        role: 'assistant',
        content: `I encountered an issue processing your request: ${error.message}. The technical team has been notified. Please try rephrasing your request, or ask me to try a different approach.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      addActivity('Master Orchestrator', `Task failed: ${error.message}`, 'failed');
    }

    setIsProcessing(false);
  }, [
    addActivity,
    orchestrator,
    securityManager,
    createTaskMutation,
    updateConversationMutation,
    currentConversationId,
    user,
    userSecurity,
    // removed `messages` and `activities` dependencies
  ]);
  
  useEffect(() => {
    const promptFromNav = location.state?.prompt;
    if (promptFromNav) {
      handleSendMessage(promptFromNav);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, handleSendMessage, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Afro-Tech AI Command
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {directors.length} Directors • {managers.length} Managers • {agents.length} Agents Online
                </p>
              </div>
            </div>
            <SecurityStatus security={userSecurity} />
          </div>
        </div>

        <Tabs defaultValue="command" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4 bg-gray-200 dark:bg-gray-800 rounded-xl p-1">
            <TabsTrigger value="command">Command</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
                />
              </div>
              <div className="space-y-6">
                <QuickActions onSelectAction={handleSendMessage} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <DirectorHierarchy 
              directors={directors}
              managers={managers}
              agents={agents}
            />
          </TabsContent>

          <TabsContent value="activity">
            <AgentActivity activities={activities} />
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SecurityStatus security={userSecurity} detailed />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}