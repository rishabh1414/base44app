import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, ChevronDown, ChevronRight, Users, Briefcase, Palette, Shield, Heart,
  DollarSign, Home, Zap, Star, TrendingUp, MessageSquare, BarChart3, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IconRenderer from '../IconRenderer';

const directorIcons = {
  'Business Operations Director': Briefcase,
  'Creative & Content Director': Palette,
  'Technology & Security Director': Shield,
  'Personal Life Director': Home,
  'Financial & Legal Director': DollarSign,
  'Health & Wellness Director': Heart
};

const categoryIcons = {
  marketing: TrendingUp,
  sales: Star,
  content: Palette,
  design: Palette,
  analytics: BarChart3,
  automation: Zap,
  communication: MessageSquare,
  // Add more as needed to cover all 16
};

const powerUpCategories = [
  'marketing', 'sales', 'content', 'design', 'analytics', 'automation', 'communication',
  'seo', 'video', 'legal', 'finance', 'project_management', 'customer_support',
  'development', 'security', 'hr'
];

export default function DirectorHierarchy({ directors, managers, agents }) {
  const [expandedDirectors, setExpandedDirectors] = useState({});
  const [expandedManagers, setExpandedManagers] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const { data: powerUps } = useQuery({
    queryKey: ['power-ups'],
    queryFn: () => base44.entities.PowerUp.list(),
    initialData: []
  });

  const toggleDirector = (id) => setExpandedDirectors(p => ({ ...p, [id]: !p[id] }));
  const toggleManager = (id) => setExpandedManagers(p => ({ ...p, [id]: !p[id] }));
  const toggleCategory = (id) => setExpandedCategories(p => ({ ...p, [id]: !p[id] }));

  const teamData = useMemo(() => {
    return directors.map(director => ({
      ...director,
      managers: managers
        .filter(m => m.director_id === director.id)
        .map(manager => ({
          ...manager,
          agents: agents.filter(a => a.manager_id === manager.id)
        }))
    }));
  }, [directors, managers, agents]);

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold">Your AI Experts Team Structure</h3>
      </div>

      <div className="space-y-4">
        {teamData.map((director, index) => {
          const Icon = directorIcons[director.role] || Briefcase;
          const isExpanded = expandedDirectors[director.id];

          return (
            <motion.div key={director.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              <button onClick={() => toggleDirector(director.id)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{director.name}</p>
                    <p className="text-sm text-gray-600">{director.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">{director.managers.length} Managers</Badge>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100">
                    <div className="p-4 space-y-3 bg-gray-50">
                      {director.managers.map(manager => {
                        const isManagerExpanded = expandedManagers[manager.id];
                        return (
                          <div key={manager.id} className="bg-white rounded-lg border border-gray-200">
                            <button onClick={() => toggleManager(manager.id)} className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg">
                              <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-indigo-600" />
                                <div className="text-left">
                                  <p className="font-semibold text-gray-900 text-sm">{manager.name}</p>
                                  <p className="text-xs text-gray-600">{manager.specialization}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs">{manager.agents.length} Agents</Badge>
                                {isManagerExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                              </div>
                            </button>

                            <AnimatePresence>
                              {isManagerExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100">
                                  <div className="p-3 space-y-2 bg-gray-50">
                                    {powerUpCategories.map(category => {
                                      const categoryPowerUps = powerUps.filter(p => p.category === category);
                                      if (categoryPowerUps.length === 0) return null;
                                      
                                      const isCategoryExpanded = expandedCategories[`${manager.id}-${category}`];
                                      const CategoryIcon = categoryIcons[category] || Zap;

                                      return (
                                        <div key={category} className="bg-white rounded-md border">
                                          <button onClick={() => toggleCategory(`${manager.id}-${category}`)} className="w-full p-2 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                              <CategoryIcon className="w-4 h-4 text-purple-600" />
                                              <p className="text-sm font-medium capitalize">{category.replace(/_/g, ' ')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                               <Badge variant="outline">{categoryPowerUps.length} PowerUps</Badge>
                                               {isCategoryExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                            </div>
                                          </button>
                                          
                                          {isCategoryExpanded && (
                                            <div className="p-2 border-t space-y-2">
                                              {categoryPowerUps.map(pu => (
                                                <div key={pu.id} className="p-2 bg-gray-50 rounded-md">
                                                  <div className="flex items-center gap-2">
                                                     <IconRenderer iconName={pu.icon} className="w-4 h-4 text-yellow-600"/>
                                                     <p className="font-semibold text-sm">{pu.name}</p>
                                                  </div>
                                                  <p className="text-xs text-gray-600 pl-6">{pu.description}</p>
                                                  <div className="flex items-center gap-2 pl-6 mt-1">
                                                     <Bot className="w-3 h-3 text-gray-500"/>
                                                     <p className="text-xs text-gray-500 font-medium">Agents: {pu.required_agents?.join(', ') || 'N/A'}</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}