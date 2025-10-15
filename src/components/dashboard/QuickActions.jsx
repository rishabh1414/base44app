import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mail, 
  Users, 
  Calendar, 
  FileText, 
  Search, 
  Heart,
  DollarSign,
  Home,
  Briefcase,
  Palette,
  Shield,
  Zap
} from 'lucide-react';

const quickActions = [
  {
    title: 'Check All Messages',
    description: 'Review messages from all channels',
    icon: Mail,
    prompt: 'Please check all my messages across email, social media, and other channels, summarize them, and highlight anything urgent.',
    color: 'from-blue-500 to-cyan-500',
    category: 'communication'
  },
  {
    title: 'Daily Brief',
    description: 'Morning summary of everything',
    icon: Calendar,
    prompt: 'Give me my daily brief: calendar events, important tasks, messages, news relevant to my interests, and weather.',
    color: 'from-purple-500 to-pink-500',
    category: 'personal'
  },
  {
    title: 'Research & Analyze',
    description: 'Deep research on any topic',
    icon: Search,
    prompt: 'Research [topic] and provide comprehensive analysis with sources, key findings, and actionable insights.',
    color: 'from-green-500 to-emerald-500',
    category: 'research'
  },
  {
    title: 'Create Content',
    description: 'Generate social media posts',
    icon: Palette,
    prompt: 'Create engaging content for my social media about [topic] including captions, images, and hashtags.',
    color: 'from-orange-500 to-red-500',
    category: 'creative'
  },
  {
    title: 'Health Check-in',
    description: 'Review health and wellness',
    icon: Heart,
    prompt: 'Help me with a health check-in: review my fitness goals, suggest meals for today, and give me wellness tips.',
    color: 'from-pink-500 to-rose-500',
    category: 'health'
  },
  {
    title: 'Financial Overview',
    description: 'Review finances and budgets',
    icon: DollarSign,
    prompt: 'Give me a financial overview: recent spending, budget status, upcoming bills, and savings recommendations.',
    color: 'from-indigo-500 to-purple-500',
    category: 'financial'
  },
  {
    title: 'Plan My Day',
    description: 'Optimize your schedule',
    icon: Briefcase,
    prompt: 'Help me plan my day: organize my tasks by priority, schedule breaks, and suggest the best order to tackle everything.',
    color: 'from-yellow-500 to-amber-500',
    category: 'productivity'
  },
  {
    title: 'Home Management',
    description: 'Handle household tasks',
    icon: Home,
    prompt: 'Help me with home management: create shopping lists, schedule maintenance tasks, and organize family activities.',
    color: 'from-teal-500 to-cyan-500',
    category: 'home'
  },
  {
    title: 'Security Review',
    description: 'Check security status',
    icon: Shield,
    prompt: 'Review my security: check for any unusual activities, suggest password updates, and ensure all security features are enabled.',
    color: 'from-red-500 to-pink-500',
    category: 'security'
  },
  {
    title: 'Quick Task',
    description: 'Get something done fast',
    icon: Zap,
    prompt: 'I need help with: [describe your task]',
    color: 'from-violet-500 to-purple-500',
    category: 'general'
  }
];

export default function QuickActions({ onSelectAction }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 justify-start text-left hover:border-indigo-300 transition-all group"
            onClick={() => onSelectAction(action.prompt)}
          >
            <div className="flex items-start gap-3 w-full">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 mb-1">{action.title}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
        <p className="text-xs text-gray-700 text-center">
          💡 Tip: You can ask anything in plain language - your AI team understands!
        </p>
      </div>
    </Card>
  );
}