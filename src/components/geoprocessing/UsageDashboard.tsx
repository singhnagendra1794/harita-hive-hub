import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  HardDrive,
  Crown,
  ArrowRight
} from "lucide-react";

interface UsageDashboardProps {
  usageStats: {
    monthlyJobs: number;
    monthlyLimit: number;
    totalProcessingTime: number;
  };
  subscription: any;
}

interface UsageData {
  job_type: string;
  count: number;
  total_size_mb: number;
  avg_processing_time: number;
}

const UsageDashboard = ({ usageStats, subscription }: UsageDashboardProps) => {
  const { user } = useAuth();
  const [detailedUsage, setDetailedUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedUsage();
  }, [user?.id]);

  const fetchDetailedUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('geo_processing_usage')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (error) throw error;

      // Aggregate usage data by job type
      const aggregated = data?.reduce((acc: { [key: string]: UsageData }, item) => {
        const key = item.job_type;
        if (!acc[key]) {
          acc[key] = {
            job_type: key,
            count: 0,
            total_size_mb: 0,
            avg_processing_time: 0
          };
        }
        
        acc[key].count += 1;
        acc[key].total_size_mb += item.file_size_mb || 0;
        acc[key].avg_processing_time = (acc[key].avg_processing_time * (acc[key].count - 1) + (item.processing_time_seconds || 0)) / acc[key].count;
        
        return acc;
      }, {});

      setDetailedUsage(Object.values(aggregated || {}));
    } catch (error) {
      console.error('Error fetching detailed usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatJobType = (jobType: string) => {
    return jobType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatSize = (mb: number) => {
    if (mb < 1024) return `${Math.round(mb)}MB`;
    return `${(mb / 1024).toFixed(1)}GB`;
  };

  const getUsagePercentage = () => {
    if (usageStats.monthlyLimit === -1) return 0; // Unlimited
    return (usageStats.monthlyJobs / usageStats.monthlyLimit) * 100;
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free',
          color: 'secondary',
          limits: '2 jobs/month',
          features: ['Basic processing', 'Standard queue', 'Email notifications']
        };
      case 'premium':
        return {
          name: 'Premium',
          color: 'default',
          limits: '10 jobs/month',
          features: ['All processing tools', 'Priority queue', 'Email notifications', 'Longer file retention']
        };
      case 'pro':
        return {
          name: 'Professional',
          color: 'default',
          limits: '50 jobs/month',
          features: ['All features', 'High priority queue', 'Batch processing', 'API access', 'Custom workflows']
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          color: 'default',
          limits: 'Unlimited',
          features: ['All features', 'Highest priority', 'Dedicated support', 'Custom integrations', 'SLA guarantees']
        };
      default:
        return {
          name: 'Unknown',
          color: 'secondary',
          limits: '',
          features: []
        };
    }
  };

  const tierInfo = getTierInfo(subscription?.subscription_tier || 'free');

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan: {tierInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Plan Features</h4>
              <ul className="space-y-1 text-sm">
                {tierInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Usage Limits</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Jobs</span>
                    <span>
                      {usageStats.monthlyJobs} / {usageStats.monthlyLimit === -1 ? '∞' : usageStats.monthlyLimit}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage()} className="w-full" />
                </div>
                
                {subscription?.subscription_tier === 'free' && getUsagePercentage() > 80 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800 mb-2">
                      You're approaching your monthly limit!
                    </p>
                    <Link to="/pricing">
                      <Button size="sm" variant="outline">
                        Upgrade Plan
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{usageStats.monthlyJobs}</div>
                <div className="text-xs text-muted-foreground">Jobs This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{formatTime(usageStats.totalProcessingTime)}</div>
                <div className="text-xs text-muted-foreground">Processing Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {usageStats.monthlyLimit === -1 ? '∞' : usageStats.monthlyLimit - usageStats.monthlyJobs}
                </div>
                <div className="text-xs text-muted-foreground">Jobs Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage by Tool Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage by Tool Type (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading usage details...
            </div>
          ) : detailedUsage.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No usage data for this month</p>
              <p className="text-sm">Start processing some data to see detailed statistics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {detailedUsage.map((usage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">{formatJobType(usage.job_type)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {usage.count} jobs • {formatSize(usage.total_size_mb)} processed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Avg: {formatTime(usage.avg_processing_time)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per job
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Prompt for Free Users */}
      {subscription?.subscription_tier === 'free' && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Crown className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Unlock More Processing Power</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to Premium for 10x more jobs, priority processing, and advanced tools.
                </p>
                <Link to="/pricing">
                  <Button>
                    View Plans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsageDashboard;