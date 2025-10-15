import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function SecurityStatus({ security, detailed = false }) {
  if (!security) {
    return (
      <Card className="p-4 border-yellow-200 bg-yellow-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-900 text-sm">Security Setup Needed</p>
            <p className="text-xs text-yellow-700">Configure your security preferences</p>
          </div>
        </div>
      </Card>
    );
  }

  const complianceColors = {
    'HIPAA': 'bg-blue-100 text-blue-800 border-blue-200',
    'GDPR': 'bg-purple-100 text-purple-800 border-purple-200',
    'SOC2': 'bg-green-100 text-green-800 border-green-200',
    'FERPA': 'bg-orange-100 text-orange-800 border-orange-200',
    'FINRA': 'bg-red-100 text-red-800 border-red-200',
    'PCI-DSS': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'standard': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  if (!detailed) {
    return (
      <Card className="p-4 border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900 text-sm">Secure & Protected</p>
              <div className="flex items-center gap-2 mt-1">
                {security.mfa_enabled && (
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                    MFA Enabled
                  </Badge>
                )}
                <Badge className={`text-xs ${complianceColors[security.compliance_level]}`}>
                  {security.compliance_level}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-bold">Security Overview</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Multi-Factor Authentication</span>
            </div>
            {security.mfa_enabled ? (
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">Disabled</Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Data Encryption</span>
            </div>
            <Badge className="bg-green-100 text-green-800">AES-256</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Compliance Level</span>
            </div>
            <Badge className={complianceColors[security.compliance_level]}>
              {security.compliance_level}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Your Data is Protected</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              All your conversations and data are encrypted end-to-end. We comply with {security.compliance_level} standards and never share your information with third parties.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}