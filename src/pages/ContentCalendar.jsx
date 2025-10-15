import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, PenTool, Linkedin, Twitter, FileText } from 'lucide-react';
import { format } from 'date-fns';

const platformIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  blog: FileText,
  email: FileText,
  youtube: FileText
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  published: 'bg-green-100 text-green-700 border-green-200'
};

export default function ContentCalendar() {
  const { data: content, isLoading } = useQuery({
    queryKey: ['content-calendar'],
    queryFn: () => base44.entities.ContentCalendar.list('-created_date'),
    initialData: []
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600">Your AI-generated content pipeline</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {content.map((item) => {
            const PlatformIcon = platformIcons[item.platform] || FileText;
            return (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <PlatformIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.platform}</p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[item.status]} border`}>
                    {item.status}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 line-clamp-4">{item.content}</p>
                </div>

                {item.topic && (
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs">
                      <PenTool className="w-3 h-3 mr-1" />
                      {item.topic}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created {format(new Date(item.created_date), 'MMM d, yyyy')}</span>
                  {item.scheduled_date && (
                    <span>
                      Scheduled for {format(new Date(item.scheduled_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {content.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No content scheduled</p>
            <p className="text-gray-500 text-sm mt-2">
              Ask your AI agent to create content for your channels
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}