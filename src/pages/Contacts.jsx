import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Search, Mail, Phone, Linkedin, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  qualified: 'bg-green-100 text-green-700 border-green-200',
  unqualified: 'bg-gray-100 text-gray-700 border-gray-200',
  converted: 'bg-purple-100 text-purple-700 border-purple-200'
};

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
    initialData: []
  });

  const filteredContacts = contacts.filter(contact =>
    contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="text-gray-600">Manage your network and leads</p>
            </div>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search contacts by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {contact.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{contact.full_name}</h3>
                    {contact.position && (
                      <p className="text-sm text-gray-600">{contact.position}</p>
                    )}
                  </div>
                </div>
                <Badge className={`${statusColors[contact.lead_status]} border`}>
                  {contact.lead_status}
                </Badge>
              </div>

              {contact.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Building2 className="w-4 h-4" />
                  {contact.company}
                </div>
              )}

              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  {contact.phone}
                </div>
              )}

              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
                >
                  <Linkedin className="w-4 h-4" />
                  View LinkedIn
                </a>
              )}

              {contact.lead_summary && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{contact.lead_summary}</p>
                </div>
              )}

              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                Added {format(new Date(contact.created_date), 'MMM d, yyyy')}
              </p>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No contacts found</p>
            <p className="text-gray-500 text-sm mt-2">
              Ask your AI agent to research and add contacts to your CRM
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}