import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DollarSign, TrendingUp, Users, CreditCard, 
  Calendar, ArrowUp, ArrowDown, BarChart3,
  PieChart, Target, Zap, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

export default function RevenueDashboard() {
  const [timeRange, setTimeRange] = useState('12months');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const isPartnerAdmin = user?.role === 'admin';

  const { data: subscriptions } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
    initialData: [],
    enabled: isPartnerAdmin
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const allContacts = await base44.entities.Contact.list('-created_date');
      return allContacts.filter(c => c.company);
    },
    initialData: [],
    enabled: isPartnerAdmin
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['all-payment-methods'],
    queryFn: () => base44.entities.PaymentMethod.list(),
    initialData: [],
    enabled: isPartnerAdmin
  });

  // Calculate revenue metrics
  const metrics = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const trialSubscriptions = subscriptions.filter(s => s.status === 'trialing');
    
    const mrr = activeSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const arr = mrr * 12;
    
    // Calculate growth (compare to last month)
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthSubs = activeSubscriptions.filter(s => 
      new Date(s.current_period_start) < lastMonthStart
    );
    const lastMonthMrr = lastMonthSubs.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const growth = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr * 100) : 0;
    
    // Calculate ARPU (Average Revenue Per User)
    const arpu = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;
    
    // Calculate churn rate
    const totalClients = clients.length;
    const churnedClients = clients.filter(c => c.lead_status === 'unqualified').length;
    const churnRate = totalClients > 0 ? (churnedClients / totalClients * 100) : 0;
    
    // Calculate LTV (simplified: ARPU * 1/churn_rate * 12 months)
    const ltv = churnRate > 0 ? (arpu / (churnRate / 100)) * 12 : arpu * 36;
    
    return {
      mrr,
      arr,
      growth,
      arpu,
      activeSubscriptions: activeSubscriptions.length,
      trialSubscriptions: trialSubscriptions.length,
      churnRate,
      ltv,
      totalClients: totalClients
    };
  }, [subscriptions, clients]);

  // Generate revenue over time data
  const revenueOverTime = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return months.map(month => {
      const monthSubs = subscriptions.filter(s => {
        const subStart = new Date(s.current_period_start);
        return subStart <= month && 
               (s.status === 'active' || s.status === 'trialing');
      });
      
      const revenue = monthSubs.reduce((sum, sub) => sum + (sub.amount || 0), 0);
      const activeCount = monthSubs.filter(s => s.status === 'active').length;
      const trialCount = monthSubs.filter(s => s.status === 'trialing').length;
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue,
        active: activeCount,
        trials: trialCount
      };
    });
  }, [subscriptions]);

  // Plan distribution
  const planDistribution = useMemo(() => {
    const plans = subscriptions.reduce((acc, sub) => {
      if (sub.status === 'active') {
        const planName = sub.plan_name || 'unknown';
        acc[planName] = (acc[planName] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(plans).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: count,
      revenue: subscriptions
        .filter(s => s.plan_name === name && s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0)
    }));
  }, [subscriptions]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  if (!isPartnerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <Card className="p-8 text-center">
          <DollarSign className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Partner Admin Only</h2>
          <p className="text-gray-600">Revenue dashboard is only available to partner admins</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
              <p className="text-gray-600">Track your revenue metrics and growth</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={timeRange === '6months' ? 'default' : 'outline'}
              onClick={() => setTimeRange('6months')}
            >
              6 Months
            </Button>
            <Button 
              variant={timeRange === '12months' ? 'default' : 'outline'}
              onClick={() => setTimeRange('12months')}
            >
              12 Months
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Monthly Recurring Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              ${metrics.mrr.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {metrics.growth >= 0 ? (
                <>
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">+{metrics.growth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 font-medium">{metrics.growth.toFixed(1)}%</span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Annual Recurring Revenue</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ${metrics.arr.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Projected annual revenue
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Active Subscriptions</p>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.activeSubscriptions}
            </p>
            <p className="text-sm text-gray-500">
              {metrics.trialSubscriptions} in trial
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Average Revenue Per User</p>
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ${metrics.arpu.toFixed(0)}
            </p>
            <p className="text-sm text-gray-500">
              Per customer/month
            </p>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Customer Lifetime Value</p>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ${metrics.ltv.toFixed(0)}
            </p>
            <p className="text-sm text-gray-500">
              Estimated LTV per customer
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Churn Rate</p>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.churnRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              Monthly churn rate
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Total Clients</p>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.totalClients}
            </p>
            <p className="text-sm text-gray-500">
              All-time clients
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Over Time */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Revenue Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueOverTime}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Subscription Growth */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Subscription Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Active"
                />
                <Line 
                  type="monotone" 
                  dataKey="trials" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Trials"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Plan Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Revenue by Plan
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} subscribers ($${props.payload.revenue.toLocaleString()}/mo)`,
                    props.payload.name
                  ]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Plan Breakdown
            </h3>
            <div className="space-y-4">
              {planDistribution.map((plan, index) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${plan.revenue.toLocaleString()}/mo</p>
                    <p className="text-sm text-gray-500">{plan.value} subscribers</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}