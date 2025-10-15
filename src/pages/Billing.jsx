import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, DollarSign, Calendar, Users, 
  CheckCircle2, Star, Zap, Shield
} from 'lucide-react';
import { format } from 'date-fns';

const plans = [
  {
    name: 'starter',
    displayName: 'Starter',
    price: 49,
    seats: 1,
    features: [
      '1 User Seat',
      '10 Directors & Managers',
      '50 Specialized Agents',
      '100 PowerUps',
      'Basic Integrations',
      'Email Support',
      'Standard Security'
    ]
  },
  {
    name: 'professional',
    displayName: 'Professional',
    price: 149,
    seats: 5,
    features: [
      '5 User Seats',
      'All 6 Directors',
      'All 36 Managers',
      'All 106 Agents',
      '500 PowerUps',
      'All Integrations',
      'Priority Support',
      'Advanced Security',
      'White-Label Options'
    ],
    popular: true
  },
  {
    name: 'business',
    displayName: 'Business',
    price: 399,
    seats: 20,
    features: [
      '20 User Seats',
      'Everything in Professional',
      'All 1006 PowerUps',
      'Custom Workflows',
      'API Access',
      'Dedicated Support',
      'SOC2 Compliance',
      'Custom Integrations'
    ]
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 999,
    seats: -1,
    features: [
      'Unlimited Users',
      'Everything in Business',
      'Custom AI Training',
      'White Glove Onboarding',
      'SLA Guarantees',
      'HIPAA/FINRA Compliance',
      'Dedicated Account Manager',
      'Custom Development'
    ]
  },
  {
    name: 'partner',
    displayName: 'Agency Partner',
    price: 1999,
    seats: -1,
    features: [
      'Everything in Enterprise',
      'White-Label Platform',
      'Custom Branding',
      'Client Management',
      'Revenue Sharing',
      'Partner Portal',
      'Reseller Rights',
      'Partner Support Team'
    ],
    partner: true
  }
];

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ created_by: user.email });
      return subs[0] || null;
    },
    enabled: !!user
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => base44.entities.PaymentMethod.filter({ created_by: user.email }),
    initialData: []
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ planName, paymentProvider }) => {
      const plan = plans.find(p => p.name === planName);
      
      if (subscription) {
        return await base44.entities.Subscription.update(subscription.id, {
          plan_name: planName,
          amount: plan.price,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          seats: plan.seats
        });
      } else {
        return await base44.entities.Subscription.create({
          plan_name: planName,
          amount: plan.price,
          billing_cycle: 'monthly',
          status: 'trialing',
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          seats: plan.seats,
          features: plan.features
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      alert('Subscription updated successfully!');
      setSelectedPlan(null);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your plan and payment methods</p>
          </div>
        </div>

        {subscription && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plans.find(p => p.name === subscription.plan_name)?.displayName || 'Current Plan'}
                  </h3>
                  <Badge className="bg-indigo-100 text-indigo-700">
                    {subscription.status}
                  </Badge>
                </div>
                <p className="text-gray-700 mb-4">
                  ${subscription.amount}/month • {subscription.seats === -1 ? 'Unlimited' : subscription.seats} seat{subscription.seats !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Renews {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`p-6 relative ${
                plan.popular ? 'border-2 border-indigo-600 shadow-xl' : ''
              } ${plan.partner ? 'bg-gradient-to-br from-purple-50 to-indigo-50' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              {plan.partner && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Partner
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full ${
                  subscription?.plan_name === plan.name
                    ? 'bg-gray-400'
                    : plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : ''
                }`}
                disabled={subscription?.plan_name === plan.name}
              >
                {subscription?.plan_name === plan.name ? (
                  'Current Plan'
                ) : subscription && plans.findIndex(p => p.name === subscription.plan_name) > plans.findIndex(p => p.name === plan.name) ? (
                  'Downgrade'
                ) : (
                  'Upgrade'
                )}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['stripe', 'square', 'paypal', 'venmo', 'zelle'].map((provider) => (
              <Button
                key={provider}
                variant="outline"
                className="h-auto p-4 justify-start text-left"
                onClick={() => {/* Open payment setup */}}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold capitalize">{provider}</p>
                    <p className="text-xs text-gray-500">
                      {paymentMethods.some(pm => pm.payment_provider === provider) ? 'Connected' : 'Add payment method'}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}