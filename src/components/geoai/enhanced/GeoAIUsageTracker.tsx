import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Zap, 
  Database, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Crown,
  Rocket,
  BarChart3
} from 'lucide-react';

interface UsageLimits {
  jobs_per_month: number;
  compute_minutes_per_month: number;
  data_gb_per_month: number;
  api_calls_per_month: number;
  storage_gb: number;
}

interface CurrentUsage {
  jobs_executed: number;
  compute_minutes_used: number;
  data_processed_gb: number;
  api_calls_made: number;
  storage_used_gb: number;
}

interface UsageContextType {
  usage: CurrentUsage;
  limits: UsageLimits;
  planTier: string;
  canExecuteJob: () => boolean;
  canProcessData: (sizeGb: number) => boolean;
  trackJobExecution: () => Promise<void>;
  trackDataProcessing: (sizeGb: number) => Promise<void>;
  trackApiCall: () => Promise<void>;
}

const UsageContext = createContext<UsageContextType | null>(null);

export const useGeoAIUsage = () => {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error('useGeoAIUsage must be used within a GeoAIUsageTracker');
  }
  return context;
};

interface GeoAIUsageTrackerProps {
  children: React.ReactNode;
}

const GeoAIUsageTracker: React.FC<GeoAIUsageTrackerProps> = ({ children }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<CurrentUsage>({
    jobs_executed: 0,
    compute_minutes_used: 0,
    data_processed_gb: 0,
    api_calls_made: 0,
    storage_used_gb: 0
  });
  const [limits, setLimits] = useState<UsageLimits>({
    jobs_per_month: 5,
    compute_minutes_per_month: 60,
    data_gb_per_month: 2,
    api_calls_per_month: 500,
    storage_gb: 1
  });
  const [planTier, setPlanTier] = useState('free');
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserUsage();
      loadUserSubscription();
    }
  }, [user]);

  const loadUserUsage = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data, error } = await supabase
        .from('geoai_usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error loading usage:', error);
        return;
      }

      if (data) {
        setUsage({
          jobs_executed: data.jobs_executed || 0,
          compute_minutes_used: data.compute_minutes_used || 0,
          data_processed_gb: data.data_processed_gb || 0,
          api_calls_made: data.api_calls_made || 0,
          storage_used_gb: data.storage_used_gb || 0
        });
        setPlanTier(data.plan_tier || 'free');
        
        if (data.limits && typeof data.limits === 'object') {
          setLimits(data.limits as any);
        }
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const loadUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (data) {
        const tier = data.subscription_tier;
        setPlanTier(tier);
        setLimits(getPlanLimits(tier));
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const getPlanLimits = (tier: string): UsageLimits => {
    switch (tier) {
      case 'free':
        return {
          jobs_per_month: 5,
          compute_minutes_per_month: 60,
          data_gb_per_month: 2,
          api_calls_per_month: 500,
          storage_gb: 1
        };
      case 'premium':
        return {
          jobs_per_month: 25,
          compute_minutes_per_month: 300,
          data_gb_per_month: 10,
          api_calls_per_month: 2500,
          storage_gb: 5
        };
      case 'pro':
        return {
          jobs_per_month: 100,
          compute_minutes_per_month: 1200,
          data_gb_per_month: 50,
          api_calls_per_month: 10000,
          storage_gb: 25
        };
      case 'enterprise':
        return {
          jobs_per_month: -1, // Unlimited
          compute_minutes_per_month: -1,
          data_gb_per_month: -1,
          api_calls_per_month: -1,
          storage_gb: -1
        };
      default:
        return getPlanLimits('free');
    }
  };

  const updateUsageTracking = async (updates: Partial<CurrentUsage>) => {
    if (!user) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { error } = await supabase
        .from('geoai_usage_tracking')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          ...usage,
          ...updates,
          plan_tier: planTier,
          limits: limits as any
        });

      if (error) throw error;

      setUsage(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating usage:', error);
    }
  };

  const canExecuteJob = (): boolean => {
    if (limits.jobs_per_month === -1) return true; // Unlimited
    return usage.jobs_executed < limits.jobs_per_month;
  };

  const canProcessData = (sizeGb: number): boolean => {
    if (limits.data_gb_per_month === -1) return true; // Unlimited
    return (usage.data_processed_gb + sizeGb) <= limits.data_gb_per_month;
  };

  const trackJobExecution = async () => {
    if (!canExecuteJob()) {
      setShowUpgradeDialog(true);
      throw new Error('Monthly job limit exceeded');
    }

    await updateUsageTracking({
      jobs_executed: usage.jobs_executed + 1,
      compute_minutes_used: usage.compute_minutes_used + Math.floor(Math.random() * 10) + 5
    });
  };

  const trackDataProcessing = async (sizeGb: number) => {
    if (!canProcessData(sizeGb)) {
      setShowUpgradeDialog(true);
      throw new Error('Monthly data processing limit exceeded');
    }

    await updateUsageTracking({
      data_processed_gb: usage.data_processed_gb + sizeGb
    });
  };

  const trackApiCall = async () => {
    if (limits.api_calls_per_month !== -1 && usage.api_calls_made >= limits.api_calls_per_month) {
      setShowUpgradeDialog(true);
      throw new Error('Monthly API call limit exceeded');
    }

    await updateUsageTracking({
      api_calls_made: usage.api_calls_made + 1
    });
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 70) return 'bg-[#43AA8B]';
    if (percentage < 90) return 'bg-[#F4D35E]';
    return 'bg-[#EE964B]';
  };

  const contextValue: UsageContextType = {
    usage,
    limits,
    planTier,
    canExecuteJob,
    canProcessData,
    trackJobExecution,
    trackDataProcessing,
    trackApiCall
  };

  return (
    <UsageContext.Provider value={contextValue}>
      {/* Usage Monitoring Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              GeoAI Usage Dashboard
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Plan Information */}
            <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Current Plan</span>
                  <Badge 
                    variant="outline" 
                    className={`${
                      planTier === 'enterprise' ? 'border-purple-500 text-purple-400' :
                      planTier === 'pro' ? 'border-[#F4D35E] text-[#F4D35E]' :
                      planTier === 'premium' ? 'border-[#43AA8B] text-[#43AA8B]' :
                      'border-gray-500 text-gray-400'
                    }`}
                  >
                    {planTier.charAt(0).toUpperCase() + planTier.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Usage Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-[#F4D35E]" />
                    <span className="text-sm text-white">Jobs Executed</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F9F9F9]/70">
                        {usage.jobs_executed} / {limits.jobs_per_month === -1 ? '∞' : limits.jobs_per_month}
                      </span>
                      <span className="text-[#F9F9F9]/70">
                        {limits.jobs_per_month === -1 ? '∞' : `${getUsagePercentage(usage.jobs_executed, limits.jobs_per_month).toFixed(0)}%`}
                      </span>
                    </div>
                    {limits.jobs_per_month !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.jobs_executed, limits.jobs_per_month)} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#43AA8B]" />
                    <span className="text-sm text-white">Compute Minutes</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F9F9F9]/70">
                        {usage.compute_minutes_used} / {limits.compute_minutes_per_month === -1 ? '∞' : limits.compute_minutes_per_month}
                      </span>
                      <span className="text-[#F9F9F9]/70">
                        {limits.compute_minutes_per_month === -1 ? '∞' : `${getUsagePercentage(usage.compute_minutes_used, limits.compute_minutes_per_month).toFixed(0)}%`}
                      </span>
                    </div>
                    {limits.compute_minutes_per_month !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.compute_minutes_used, limits.compute_minutes_per_month)} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-[#EE964B]" />
                    <span className="text-sm text-white">Data Processed</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F9F9F9]/70">
                        {usage.data_processed_gb.toFixed(1)} GB / {limits.data_gb_per_month === -1 ? '∞' : limits.data_gb_per_month} GB
                      </span>
                      <span className="text-[#F9F9F9]/70">
                        {limits.data_gb_per_month === -1 ? '∞' : `${getUsagePercentage(usage.data_processed_gb, limits.data_gb_per_month).toFixed(0)}%`}
                      </span>
                    </div>
                    {limits.data_gb_per_month !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.data_processed_gb, limits.data_gb_per_month)} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-[#43AA8B]" />
                    <span className="text-sm text-white">API Calls</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F9F9F9]/70">
                        {usage.api_calls_made} / {limits.api_calls_per_month === -1 ? '∞' : limits.api_calls_per_month}
                      </span>
                      <span className="text-[#F9F9F9]/70">
                        {limits.api_calls_per_month === -1 ? '∞' : `${getUsagePercentage(usage.api_calls_made, limits.api_calls_per_month).toFixed(0)}%`}
                      </span>
                    </div>
                    {limits.api_calls_per_month !== -1 && (
                      <Progress 
                        value={getUsagePercentage(usage.api_calls_made, limits.api_calls_per_month)} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {planTier === 'free' && (
              <Card className="bg-[#EE964B]/10 border-[#EE964B]/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-[#F4D35E]" />
                    <span className="text-sm text-white">Upgrade for More Power</span>
                  </div>
                  <p className="text-xs text-[#F9F9F9]/70 mb-3">
                    Get unlimited GeoAI workflows, higher processing limits, and premium data sources.
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-[#F4D35E] text-[#0D1B2A] hover:bg-[#F4D35E]/90"
                    onClick={() => setShowUpgradeDialog(true)}
                  >
                    <Rocket className="h-3 w-3 mr-1" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F4D35E]" />
              Usage Limit Reached
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-[#F9F9F9]/70">
              You've reached your monthly limit for this feature. Upgrade your plan to continue using GeoAI tools.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium">Pro Plan - $29/month</h4>
                  <ul className="text-sm text-[#F9F9F9]/70 mt-2 space-y-1">
                    <li>• 100 AI workflow jobs/month</li>
                    <li>• 1,200 compute minutes/month</li>
                    <li>• 50 GB data processing/month</li>
                    <li>• Priority support</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0D1B2A] border-[#F4D35E]/20">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium">Enterprise - Custom</h4>
                  <ul className="text-sm text-[#F9F9F9]/70 mt-2 space-y-1">
                    <li>• Unlimited everything</li>
                    <li>• Custom integrations</li>
                    <li>• Dedicated support</li>
                    <li>• On-premise deployment</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowUpgradeDialog(false)}
                variant="outline"
                className="flex-1 border-[#43AA8B]/20 text-[#F9F9F9]"
              >
                Maybe Later
              </Button>
              <Button 
                className="flex-1 bg-[#F4D35E] text-[#0D1B2A] hover:bg-[#F4D35E]/90"
                onClick={() => {
                  window.open('/pricing', '_blank');
                  setShowUpgradeDialog(false);
                }}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Usage Summary Bar */}
      <div className="fixed top-16 right-4 z-50">
        <Card className="bg-[#1B263B]/95 border-[#43AA8B]/20 backdrop-blur-sm">
          <CardContent className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUsageDialog(true)}
              className="text-white hover:bg-[#43AA8B]/10"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="text-xs">
                {usage.jobs_executed}/{limits.jobs_per_month === -1 ? '∞' : limits.jobs_per_month} jobs
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {children}
    </UsageContext.Provider>
  );
};

export default GeoAIUsageTracker;