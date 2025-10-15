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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, Search, Plus, Mail, Phone, Building2, 
  TrendingUp, DollarSign, Calendar, Edit, Trash2,
  CheckCircle2, Clock, AlertCircle, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ClientManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [newClient, setNewClient] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    status: 'active',
    subscription_tier: 'professional',
    monthly_value: 0,
    onboarding_status: 'pending',
    notes: ''
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isPartnerAdmin = user?.role === 'admin';

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const allContacts = await base44.entities.Contact.list('-created_date');
      return allContacts.filter(c => c.company); // Only business contacts
    },
    initialData: [],
    enabled: isPartnerAdmin
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
    enabled: isPartnerAdmin
  });

  const createClientMutation = useMutation({
    mutationFn: (clientData) => base44.entities.Contact.create({
      ...clientData,
      lead_status: 'converted',
      tags: ['client', 'partner_managed']
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully!');
      setShowAddDialog(false);
      setNewClient({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        status: 'active',
        subscription_tier: 'professional',
        monthly_value: 0,
        onboarding_status: 'pending',
        notes: ''
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully!');
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client removed');
    }
  });

  if (!isPartnerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Partner Admin Only</h2>
          <p className="text-gray-600">Client management is only available to partner admins</p>
        </Card>
      </div>
    );
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.lead_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.lead_status === 'converted').length,
    trial: clients.filter(c => c.lead_status === 'qualified').length,
    churned: clients.filter(c => c.lead_status === 'unqualified').length,
    mrr: clients.reduce((sum, c) => sum + (c.monthly_value || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-600">Manage your partner client accounts</p>
            </div>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={newClient.company_name}
                    onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                    placeholder="Acme Corporation"
                  />
                </div>
                
                <div>
                  <Label>Contact Person *</Label>
                  <Input
                    value={newClient.contact_person}
                    onChange={(e) => setNewClient({...newClient, contact_person: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="john@acme.com"
                  />
                </div>
                
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <Label>Subscription Tier</Label>
                  <Select
                    value={newClient.subscription_tier}
                    onValueChange={(value) => setNewClient({...newClient, subscription_tier: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Monthly Value ($)</Label>
                  <Input
                    type="number"
                    value={newClient.monthly_value}
                    onChange={(e) => setNewClient({...newClient, monthly_value: parseFloat(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder="Additional notes about this client..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createClientMutation.mutate(newClient)}
                  disabled={!newClient.company_name || !newClient.contact_person || !newClient.email}
                >
                  Add Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Clients</p>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active</p>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">In Trial</p>
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.trial}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Churned</p>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.churned}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">MRR</p>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${stats.mrr.toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search clients by company, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="converted">Active</SelectItem>
                <SelectItem value="qualified">Trial</SelectItem>
                <SelectItem value="unqualified">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Clients Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MRR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Since
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                          {client.company?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{client.company}</div>
                          <div className="text-sm text-gray-500">{client.position || 'Client'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.full_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={
                        client.lead_status === 'converted' ? 'bg-green-100 text-green-800' :
                        client.lead_status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {client.lead_status === 'converted' ? 'Active' :
                         client.lead_status === 'qualified' ? 'Trial' : 'Churned'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${client.monthly_value || 0}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(client.created_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this client?')) {
                              deleteClientMutation.mutate(client.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredClients.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Clients Found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first client</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Client
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}