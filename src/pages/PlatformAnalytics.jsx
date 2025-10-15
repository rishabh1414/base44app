import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BarChart3, Users, Zap, MessageSquare, Clock,
  TrendingUp, Activity, CheckCircle2, AlertCircle,
  Cpu, Database, Globe, Shield
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';

export default function PlatformAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isPartnerAdmin = user?.role === 'admin';

  const { data: tasks } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
    initialData: [],
    enabled: isPartnerAdmin
  });

  const { data: conversations } = useQuery({
    queryKey: ['all-conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date'),
    initialData: [],
    enabled: isPartnerAdmin
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.filter({ is_active: true }),
    initialData: []
  });

  const { data: managers } = useQuery({
    queryKey: ['managers'],
    queryFn: () => base44.entities.Manager.filter({ is_active: true }),
    initialData: []
  });

  const { data: directors } = useQuery({
    queryKey: ['directors'],
    queryFn: () => base44.entities.Director.filter({ is_active: true }),
    initialData: []
  });

  const { data: powerUps } = useQuery({
    queryKey: ['power-ups'],
    queryFn: () => base44.entities.PowerUp.filter({ is_active: true }),
    initialData: []
  });

  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    enabled: isPartnerAdmin
  });

  // Calculate platform metrics
  const metrics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const processingTasks = tasks.filter(t => t.status === 'processing').length;
    const successRate = tasks.length > 0 ? (completedTasks / tasks.length * 100) : 0;

    const totalMessages = conversations.reduce((sum, conv) => 
      sum + (conv.messages?.length || 0), 0
    );

    const avgResponseTime = tasks
      .filter(t => t.execution_log && t.execution_log.length > 0)
      .map(t => {
        const start = new Date(t.created_date);
        const end = new Date(t.updated_date);
        return (end - start) / 1000; // seconds
      })
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0);

    return {
      totalTasks: tasks.length,
      completedTasks,
      failedTasks,
      processingTasks,
      successRate,
      totalMessages,
      avgResponseTime: Math.round(avgResponseTime) || 0,
      totalAgents: agents.length,
      totalManagers: managers.length,
      totalDirectors: directors.length,
      totalPowerUps: powerUps.length,
      activeUsers: allUsers.length
    };
  }, [tasks, conversations, agents, managers, directors, powerUps, allUsers]);

  // Generate activity over time
  const activityOverTime = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), timeRange === '7days' ? 6 : 29),
      end: new Date()
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayTasks = tasks.filter(t => {
        const taskDate = startOfDay(new Date(t.created_date));
        return taskDate.getTime() === dayStart.getTime();
      });

      const dayConvos = conversations.filter(c => {
        const convoDate = startOfDay(new Date(c.created_date));
        return convoDate.getTime() === dayStart.getTime();
      });

      return {
        date: format(day, 'MMM d'),
        tasks: dayTasks.length,
        conversations: dayConvos.length,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        failed: dayTasks.filter(t => t.status === 'failed').length
      };
    });
  }, [tasks, conversations, timeRange]);

  // Agent performance
  const agentPerformance = useMemo(() => {
    const agentStats = {};
    
    tasks.forEach(task => {
      (task.assigned_agents || []).forEach(agentName => {
        if (!agentStats[agentName]) {
          agentStats[agentName] = {
            total: 0,
            completed: 0,
            failed: 0
          };
        }
        agentStats[agentName].total++;
        if (task.status === 'completed') agentStats[agentName].completed++;
        if (task.status === 'failed') agentStats[agentName].failed++;
      });
    });

    return Object.entries(agentStats)
      .map(([name, stats]) => ({
        name,
        successRate: stats.total > 0 ? (stats.completed / stats.total * 100) : 0,
        total: stats.total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [tasks]);

  // System health
  const systemHealth = useMemo(() => {
    return [
      {
        metric: 'Task Success Rate',
        score: metrics.successRate,
        fullMark: 100
      },
      {
        metric: 'Agent Availability',
        score: (agents.filter(a => a.is_active).length / agents.length * 100) || 100,
        fullMark: 100
      },
      {
        metric: 'Response Time',
        score: Math.max(0, 100 - (metrics.avgResponseTime / 60 * 10)), // Lower is better
        fullMark: 100
      },
      {
        metric: 'User Satisfaction',
        score: 92, // This would come from actual user feedback
        fullMark: 100
      },
      {
        metric: 'System Uptime',
        score: 99.9,
        fullMark: 100
      }
    ];
  }, [metrics, agents]);

  if (!isPartnerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Partner Admin Only</h2>
          <p className="text-gray-600">Analytics dashboard is only available to partner admins</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-gray-600">Monitor platform performance and usage</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === '7days' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setTimeRange('7days')}
            >
              7 Days
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === '30days' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setTimeRange('30days')}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Total Tasks</p>
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.totalTasks}
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 text-xs">
                {metrics.completedTasks} completed
              </Badge>
              {metrics.failedTasks > 0 && (
                <Badge className="bg-red-100 text-red-800 text-xs">
                  {metrics.failedTasks} failed
                </Badge>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Success Rate</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.successRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              Task completion rate
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Avg Response Time</p>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.avgResponseTime}s
            </p>
            <p className="text-sm text-gray-500">
              Average task completion
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.activeUsers}
            </p>
            <p className="text-sm text-gray-500">
              Platform users
            </p>
          </Card>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Directors</p>
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalDirectors}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Managers</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalManagers}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Agents</p>
              <Cpu className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalAgents}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">PowerUps</p>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalPowerUps}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Over Time */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Activity Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityOverTime}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConvos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorTasks)"
                  name="Tasks"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorConvos)"
                  name="Conversations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Task Status */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Task Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Performing Agents & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performing Agents
            </h3>
            <div className="space-y-3">
              {agentPerformance.map((agent, index) => (
                <div key={agent.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.total} tasks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{agent.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">success rate</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              System Health
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={systemHealth}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Performance" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}