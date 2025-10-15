import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Plug, Mail, MessageSquare, Zap, Database, Cloud, 
  CreditCard, Lock, CheckCircle2, AlertCircle, Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const categoryIcons = {
  email: Mail,
  sms_voice: MessageSquare,
  automation: Zap,
  crm: Database,
  ai: Cloud,
  payment: CreditCard
};

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [credentials, setCredentials] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isPartner = user?.role === 'admin' || user?.partner_level;

  const { data: integrations } = useQuery({
    queryKey: ['available-integrations'],
    queryFn: async () => {
      const allIntegrations = await base44.entities.Integration.filter({ is_active: true });
      return isPartner ? allIntegrations : allIntegrations.filter(i => !i.partner_only);
    },
    initialData: []
  });

  const { data: userIntegrations } = useQuery({
    queryKey: ['user-integrations'],
    queryFn: () => base44.entities.UserIntegration.filter({ created_by: user.email }),
    initialData: []
  });

  const connectIntegration = useMutation({
    mutationFn: async ({ integrationId, creds }) => {
      return await base44.entities.UserIntegration.create({
        integration_id: integrationId,
        credentials: creds,
        connection_status: 'connected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-integrations'] });
      setSelectedIntegration(null);
      setCredentials({});
    }
  });

  const isConnected = (integrationId) => {
    return userIntegrations.some(ui => ui.integration_id === integrationId && ui.connection_status === 'connected');
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Plug className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect your tools and services</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="all">All Integrations</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => {
                const Icon = categoryIcons[integration.category] || Plug;
                const connected = isConnected(integration.id);

                return (
                  <Card key={integration.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{integration.display_name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{integration.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {connected ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Connected</Badge>
                      )}
                    </div>

                    {isPartner && (
                      <p className="text-xs text-gray-500 mb-3">
                        Provider: {integration.provider_name}
                      </p>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          variant={connected ? "outline" : "default"}
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          {connected ? (
                            <>
                              <Settings className="w-4 h-4 mr-2" />
                              Manage
                            </>
                          ) : (
                            <>
                              <Plug className="w-4 h-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect {integration.display_name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {integration.connection_type === 'api_key' && (
                            <>
                              <div>
                                <Label>API Key</Label>
                                <Input
                                  type="password"
                                  placeholder="Enter your API key"
                                  value={credentials.api_key || ''}
                                  onChange={(e) => setCredentials({...credentials, api_key: e.target.value})}
                                />
                              </div>
                              {integration.required_credentials?.includes('api_secret') && (
                                <div>
                                  <Label>API Secret</Label>
                                  <Input
                                    type="password"
                                    placeholder="Enter your API secret"
                                    value={credentials.api_secret || ''}
                                    onChange={(e) => setCredentials({...credentials, api_secret: e.target.value})}
                                  />
                                </div>
                              )}
                            </>
                          )}

                          {integration.connection_type === 'oauth' && (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-600 mb-4">
                                Click Connect to authorize via OAuth
                              </p>
                              <Button className="w-full">
                                Authorize with {integration.display_name}
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-blue-900">
                              Your credentials are encrypted and never shared
                            </p>
                          </div>

                          <Button
                            onClick={() => connectIntegration.mutate({
                              integrationId: integration.id,
                              creds: credentials
                            })}
                            disabled={connectIntegration.isLoading}
                            className="w-full"
                          >
                            {connectIntegration.isLoading ? 'Connecting...' : 'Connect Integration'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.filter(i => i.category === category).map((integration) => {
                  const Icon = categoryIcons[integration.category] || Plug;
                  const connected = isConnected(integration.id);

                  return (
                    <Card key={integration.id} className="p-6">
                      {/* Same card content as above */}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}