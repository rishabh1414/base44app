import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Settings, Palette, Globe, Type, Users, 
  DollarSign, BarChart3, Shield, Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [branding, setBranding] = useState({
    agency_name: '',
    logo_url: '',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#ec4899',
    font_family: 'Inter',
    tagline: '',
    welcome_message: ''
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isPartnerAdmin = user?.role === 'admin';

  const { data: existingBranding } = useQuery({
    queryKey: ['agency-branding'],
    queryFn: async () => {
      const brands = await base44.entities.AgencyBranding.filter({ created_by: user.email });
      return brands[0] || null;
    },
    enabled: !!user && isPartnerAdmin,
    onSuccess: (data) => {
      if (data) setBranding(data);
    }
  });

  const saveBranding = useMutation({
    mutationFn: async (brandingData) => {
      if (existingBranding) {
        return await base44.entities.AgencyBranding.update(existingBranding.id, brandingData);
      } else {
        return await base44.entities.AgencyBranding.create(brandingData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-branding'] });
      toast.success('Branding updated successfully!');
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBranding({ ...branding, logo_url: file_url });
    }
  };

  if (!isPartnerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">Only Partner Admins can access this area</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Admin Dashboard</h1>
            <p className="text-gray-600">White-label configuration and client management</p>
          </div>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Identity
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Agency Name</Label>
                    <Input
                      value={branding.agency_name}
                      onChange={(e) => setBranding({...branding, agency_name: e.target.value})}
                      placeholder="Your Agency Name"
                    />
                  </div>

                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={branding.tagline}
                      onChange={(e) => setBranding({...branding, tagline: e.target.value})}
                      placeholder="Your agency tagline"
                    />
                  </div>

                  <div>
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      {branding.logo_url && (
                        <img src={branding.logo_url} alt="Logo" className="h-16 w-16 object-contain" />
                      )}
                      <div>
                        <input
                          type="file"
                          id="logo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload').click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Palette
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={branding.primary_color}
                        onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                        className="w-20 h-10"
                      />
                      <Input
                        value={branding.primary_color}
                        onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={branding.secondary_color}
                        onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                        className="w-20 h-10"
                      />
                      <Input
                        value={branding.secondary_color}
                        onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                        placeholder="#8b5cf6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={branding.accent_color}
                        onChange={(e) => setBranding({...branding, accent_color: e.target.value})}
                        className="w-20 h-10"
                      />
                      <Input
                        value={branding.accent_color}
                        onChange={(e) => setBranding({...branding, accent_color: e.target.value})}
                        placeholder="#ec4899"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: branding.primary_color }}>
                    <p className="text-white font-semibold">Primary Color Preview</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Typography
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Font Family</Label>
                    <select
                      value={branding.font_family}
                      onChange={(e) => setBranding({...branding, font_family: e.target.value})}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>

                  <div className="p-4 border rounded-lg" style={{ fontFamily: branding.font_family }}>
                    <h4 className="text-xl font-bold mb-2">Font Preview</h4>
                    <p>The quick brown fox jumps over the lazy dog</p>
                    <p className="text-sm text-gray-600">1234567890</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Domain & Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>Custom Domain</Label>
                    <Input
                      value={branding.custom_domain}
                      onChange={(e) => setBranding({...branding, custom_domain: e.target.value})}
                      placeholder="app.youragency.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Configure DNS to point to our platform
                    </p>
                  </div>

                  <div>
                    <Label>Support Email</Label>
                    <Input
                      value={branding.support_email}
                      onChange={(e) => setBranding({...branding, support_email: e.target.value})}
                      placeholder="support@youragency.com"
                    />
                  </div>

                  <div>
                    <Label>Website URL</Label>
                    <Input
                      value={branding.website_url}
                      onChange={(e) => setBranding({...branding, website_url: e.target.value})}
                      placeholder="https://youragency.com"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline">Preview Changes</Button>
              <Button
                onClick={() => saveBranding.mutate(branding)}
                disabled={saveBranding.isLoading}
                style={{ backgroundColor: branding.primary_color }}
              >
                {saveBranding.isLoading ? 'Saving...' : 'Save Branding'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Client Management</h3>
              <p className="text-gray-600">Client management features coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Revenue Dashboard</h3>
              <p className="text-gray-600">Revenue analytics coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Platform Analytics</h3>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}