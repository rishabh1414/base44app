import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const agentStructure = {
  director: {
    name: 'Director Agent',
    role: 'Executive Coordinator',
    color: 'from-indigo-600 to-purple-600'
  },
  managers: [
    {
      name: 'Communication Manager',
      subAgents: ['Email Agent', 'Message Agent', 'Calendar Agent', 'Call Agent'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Project Manager',
      subAgents: ['CRM Agent', 'Document Agent', 'Task Agent'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Research Manager',
      subAgents: ['Web Research', 'LinkedIn Research', 'Competitive Analysis'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Content Manager',
      subAgents: ['Blog Writer', 'LinkedIn Writer', 'Email Writer', 'Video Script'],
      color: 'from-orange-500 to-red-500'
    }
  ]
};

export default function AgentHierarchy() {
  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold">Agent Hierarchy</h3>
      </div>

      <div className="space-y-6">
        {/* Director */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className={`bg-gradient-to-br ${agentStructure.director.color} text-white rounded-xl p-4 w-full max-w-xs text-center shadow-lg`}>
            <p className="font-bold">{agentStructure.director.name}</p>
            <p className="text-xs opacity-90">{agentStructure.director.role}</p>
          </div>
          <ArrowDown className="w-6 h-6 text-gray-400 my-2" />
        </motion.div>

        {/* Managers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentStructure.managers.map((manager, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-200"
            >
              <div className={`bg-gradient-to-br ${manager.color} text-white rounded-lg p-3 mb-3 text-center`}>
                <p className="font-semibold text-sm">{manager.name}</p>
              </div>
              <div className="space-y-2">
                {manager.subAgents.map((subAgent, subIndex) => (
                  <Badge
                    key={subIndex}
                    variant="outline"
                    className="w-full justify-center text-xs py-1 bg-gray-50"
                  >
                    {subAgent}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}