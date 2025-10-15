import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  MessageSquare, 
  FolderOpen, 
  Search, 
  PenTool,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const agentIcons = {
  'Director': Network,
  'Communication Manager': MessageSquare,
  'Project Manager': FolderOpen,
  'Research Manager': Search,
  'Content Manager': PenTool
};

const statusColors = {
  'completed': 'bg-green-100 text-green-700 border-green-200',
  'processing': 'bg-blue-100 text-blue-700 border-blue-200',
  'pending': 'bg-gray-100 text-gray-700 border-gray-200',
  'failed': 'bg-red-100 text-red-700 border-red-200'
};

export default function AgentActivity({ activities = [] }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Network className="w-5 h-5 text-indigo-600" />
        Agent Activity
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start a conversation to see agents in action</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = agentIcons[activity.agent] || Network;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{activity.agent}</p>
                      <Badge className={`${statusColors[activity.status]} border text-xs`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}