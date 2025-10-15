
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Zap, Search, TrendingUp, Star, Clock,
  Sparkles, Target, Palette, BarChart3, MessageSquare
} from 'lucide-react';
import IconRenderer from '../components/IconRenderer';
import ExecutePowerUpDialog from '../components/powerups/ExecutePowerUpDialog';

const categories = [
  { name: 'all', label: 'All PowerUps', icon: Zap },
  { name: 'marketing', label: 'Marketing & SEO', icon: TrendingUp },
  { name: 'sales', label: 'Sales & CRM', icon: Target },
  { name: 'content', label: 'Content Creation', icon: Sparkles },
  { name: 'design', label: 'Design & Creative', icon: Palette },
  { name: 'automation', label: 'Automation', icon: Zap },
  { name: 'analytics', label: 'Analytics', icon: BarChart3 },
  { name: 'communication', label: 'Communication', icon: MessageSquare }
];

export default function PowerUps() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPowerUp, setSelectedPowerUp] = useState(null); // New state to manage dialog visibility and selected PowerUp

  const { data: powerUps, isLoading } = useQuery({
    queryKey: ['power-ups'],
    queryFn: () => base44.entities.PowerUp.filter({ is_active: true }),
    initialData: []
  });

  const filteredPowerUps = powerUps.filter(pu => {
    const matchesSearch = pu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pu.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pu.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCount = (cat) => {
    if (cat === 'all') return powerUps.length;
    return powerUps.filter(pu => pu.category === cat).length;
  };
  
  // The executePowerUp function is no longer needed as the dialog handles this
  // by setting selectedPowerUp state.

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PowerUps</h1>
              <p className="text-gray-600">One-click AI-powered tools for any task</p>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            {powerUps.length} PowerUps
          </Badge>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search PowerUps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="bg-white flex-wrap h-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger key={cat.name} value={cat.name} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <Badge variant="secondary" className="ml-1">
                    {categoryCount(cat.name)}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPowerUps.map((powerUp) => {
              return (
                <Card key={powerUp.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                      <IconRenderer iconName={powerUp.icon} className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {powerUp.category}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{powerUp.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{powerUp.description}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{powerUp.estimated_time}</span>
                  </div>

                  <Button
                    onClick={() => setSelectedPowerUp(powerUp)} // Updated onClick handler
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Execute PowerUp
                  </Button>
                </Card>
              );
            })}
          </div>

          {filteredPowerUps.length === 0 && (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No PowerUps Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </Tabs>
      </div>

      {/* New ExecutePowerUpDialog component */}
      <ExecutePowerUpDialog
        powerUp={selectedPowerUp}
        isOpen={!!selectedPowerUp} // Dialog is open if a powerUp is selected (not null)
        onClose={() => setSelectedPowerUp(null)} // Close dialog by setting selectedPowerUp back to null
      />
    </div>
  );
}
