import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  BarChart3,
  Users,
  Zap,
  Database,
  Settings,
  Shield,
  Key,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Crown,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  total_users: number;
  active_jobs: number;
  total_jobs_today: number;
  total_compute_minutes: number;
  data_processed_gb: number;
  api_calls_today: number;
  enterprise_users: number;
  pro_users: number;
  premium_users: number;
  free_users: number;
}

interface JobStats {
  job_id: string;
  user_id: string;
  user_email: string;
  job_name: string;
  status: string;
  created_at: string;
  completed_at: string;
  processing_time_minutes: number;
  plan_tier: string;
  models_used: string[];
}

interface UserManagement {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  created_at: string;
  last_login: string;
  total_jobs: number;
  api_access_approved: boolean;
}

interface APIRequest {
  id: string;
  user_id: string;
  user_email: string;
  company_name: string;
  use_case: string;
  expected_volume: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at: string;
  reviewed_by: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobStats, setJobStats] = useState<JobStats[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [apiRequests, setApiRequests] = useState<APIRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .in('role', ['admin', 'super_admin']);

      if (error || !roles || roles.length === 0) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        return;
      }

      loadAdminData();
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadJobStats(),
        loadUsers(),
        loadAPIRequests()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get user counts by subscription tier
      const { data: userStats, error: userError } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier, user_id');

      if (userError) throw userError;

      // Get job statistics for today
      const today = new Date().toISOString().split('T')[0];
      const { data: jobsToday, error: jobError } = await supabase
        .from('geoai_jobs')
        .select('status, processing_time')
        .gte('created_at', today);

      if (jobError) throw jobError;

      // Get usage statistics
      const { data: usageStats, error: usageError } = await supabase
        .from('geoai_usage_tracking')
        .select('jobs_executed, compute_minutes_used, data_processed_gb, api_calls_made')
        .gte('created_at', today);

      if (usageError) throw usageError;

      // Calculate stats
      const planCounts = userStats?.reduce((acc, user) => {
        acc[user.subscription_tier] = (acc[user.subscription_tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalJobs = jobsToday?.length || 0;
      const activeJobs = jobsToday?.filter(job => job.status === 'running').length || 0;
      
      const totalCompute = usageStats?.reduce((sum, usage) => sum + (usage.compute_minutes_used || 0), 0) || 0;
      const totalData = usageStats?.reduce((sum, usage) => sum + (usage.data_processed_gb || 0), 0) || 0;
      const totalAPICalls = usageStats?.reduce((sum, usage) => sum + (usage.api_calls_made || 0), 0) || 0;

      setStats({
        total_users: userStats?.length || 0,
        active_jobs: activeJobs,
        total_jobs_today: totalJobs,
        total_compute_minutes: totalCompute,
        data_processed_gb: totalData,
        api_calls_today: totalAPICalls,
        enterprise_users: planCounts.enterprise || 0,
        pro_users: planCounts.pro || 0,
        premium_users: planCounts.premium || 0,
        free_users: planCounts.free || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadJobStats = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('geoai_jobs')
        .select(`
          id,
          user_id,
          job_name,
          status,
          created_at,
          completed_at,
          processing_time,
          models_used
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user emails for jobs
      const userIds = jobs?.map(job => job.user_id) || [];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Get user subscription tiers
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('user_id, subscription_tier')
        .in('user_id', userIds);

      if (subError) throw subError;

      const emailMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile.email;
        return acc;
      }, {} as Record<string, string>) || {};

      const planMap = subscriptions?.reduce((acc, sub) => {
        acc[sub.user_id] = sub.subscription_tier;
        return acc;
      }, {} as Record<string, string>) || {};

      const jobsWithDetails = jobs?.map(job => ({
        job_id: job.id,
        user_id: job.user_id,
        user_email: emailMap[job.user_id] || 'Unknown',
        job_name: job.job_name || 'Unnamed Job',
        status: job.status,
        created_at: job.created_at,
        completed_at: job.completed_at,
        processing_time_minutes: job.processing_time || 0,
        plan_tier: planMap[job.user_id] || 'free',
        models_used: Array.isArray(job.models_used) ? job.models_used : []
      })) || [];

      setJobStats(jobsWithDetails);
    } catch (error) {
      console.error('Error loading job stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profileError) throw profileError;

      // Get subscription data
      const userIds = profiles?.map(profile => profile.id) || [];
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('user_id, subscription_tier')
        .in('user_id', userIds);

      if (subError) throw subError;

      // Get job counts
      const { data: jobCounts, error: jobError } = await supabase
        .from('geoai_jobs')
        .select('user_id')
        .in('user_id', userIds);

      if (jobError) throw jobError;

      const subMap = subscriptions?.reduce((acc, sub) => {
        acc[sub.user_id] = sub.subscription_tier;
        return acc;
      }, {} as Record<string, string>) || {};

      const jobCountMap = jobCounts?.reduce((acc, job) => {
        acc[job.user_id] = (acc[job.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const usersWithDetails = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || 'Unknown',
        full_name: profile.full_name || 'Unknown',
        subscription_tier: subMap[profile.id] || 'free',
        created_at: profile.created_at,
        last_login: new Date().toISOString(), // Placeholder
        total_jobs: jobCountMap[profile.id] || 0,
        api_access_approved: false // Placeholder
      })) || [];

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAPIRequests = async () => {
    // Simulate API requests for now
    const mockRequests: APIRequest[] = [
      {
        id: '1',
        user_id: 'user1',
        user_email: 'enterprise@company.com',
        company_name: 'TechCorp Inc.',
        use_case: 'Automated crop monitoring for 10,000 farms',
        expected_volume: '1000 jobs/month',
        status: 'pending',
        requested_at: new Date().toISOString(),
        reviewed_at: '',
        reviewed_by: ''
      },
      {
        id: '2',
        user_id: 'user2',
        user_email: 'gis@municipality.gov',
        company_name: 'City Planning Department',
        use_case: 'Urban heat island monitoring',
        expected_volume: '50 jobs/month',
        status: 'approved',
        requested_at: new Date(Date.now() - 86400000).toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.email || ''
      }
    ];
    setApiRequests(mockRequests);
  };

  const updateUserRole = async (userId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          subscription_tier: newTier,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "User Updated",
        description: `User subscription tier updated to ${newTier}`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  const handleAPIRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const updatedRequests = apiRequests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: action === 'approve' ? 'approved' as const : 'rejected' as const,
              reviewed_at: new Date().toISOString(),
              reviewed_by: user?.email || ''
            }
          : req
      );
      setApiRequests(updatedRequests);

      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `API access request has been ${action}d`,
      });
    } catch (error) {
      console.error(`Error ${action}ing API request:`, error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.subscription_tier === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#43AA8B] text-white';
      case 'running': return 'bg-[#F4D35E] text-[#0D1B2A]';
      case 'failed': return 'bg-[#EE964B] text-white';
      case 'queued': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-500 text-white';
      case 'pro': return 'bg-[#F4D35E] text-[#0D1B2A]';
      case 'premium': return 'bg-[#43AA8B] text-white';
      case 'free': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4D35E]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Header */}
      <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4D35E] rounded-lg">
              <Shield className="h-6 w-6 text-[#0D1B2A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-[#F9F9F9]/70">Platform management and analytics</p>
            </div>
          </div>
          
          <Button
            onClick={loadAdminData}
            variant="outline"
            className="border-[#43AA8B]/20 text-[#43AA8B] hover:bg-[#43AA8B]/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-[#1B263B] border-b border-[#43AA8B]/20 justify-start gap-0 rounded-none h-12">
            <TabsTrigger 
              value="overview" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Activity className="h-4 w-4 mr-2" />
              Job Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Key className="h-4 w-4 mr-2" />
              API Requests
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0 p-6">
              <OverviewTab stats={stats} />
            </TabsContent>
            
            <TabsContent value="jobs" className="h-full m-0 p-6">
              <JobAnalyticsTab jobStats={jobStats} getStatusColor={getStatusColor} getPlanColor={getPlanColor} />
            </TabsContent>
            
            <TabsContent value="users" className="h-full m-0 p-6">
              <UserManagementTab 
                users={filteredUsers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterPlan={filterPlan}
                setFilterPlan={setFilterPlan}
                onUpdateUser={updateUserRole}
                getPlanColor={getPlanColor}
              />
            </TabsContent>
            
            <TabsContent value="api" className="h-full m-0 p-6">
              <APIRequestsTab 
                apiRequests={apiRequests}
                onHandleRequest={handleAPIRequest}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ stats: AdminStats | null }> = ({ stats }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Platform Overview</h2>
    
    {stats && (
      <>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1B263B] border-[#43AA8B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F9F9F9]/70 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.total_users}</p>
                </div>
                <Users className="h-8 w-8 text-[#43AA8B]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1B263B] border-[#43AA8B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F9F9F9]/70 text-sm">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{stats.active_jobs}</p>
                </div>
                <Activity className="h-8 w-8 text-[#F4D35E]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1B263B] border-[#43AA8B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F9F9F9]/70 text-sm">Jobs Today</p>
                  <p className="text-2xl font-bold text-white">{stats.total_jobs_today}</p>
                </div>
                <Zap className="h-8 w-8 text-[#EE964B]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1B263B] border-[#43AA8B]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F9F9F9]/70 text-sm">Data Processed</p>
                  <p className="text-2xl font-bold text-white">{stats.data_processed_gb.toFixed(1)}GB</p>
                </div>
                <Database className="h-8 w-8 text-[#43AA8B]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <Card className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardHeader>
            <CardTitle className="text-white">User Distribution by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.free_users}</div>
                <div className="text-sm text-[#F9F9F9]/70">Free</div>
                <Badge className="mt-1 bg-gray-500 text-white">Basic</Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.premium_users}</div>
                <div className="text-sm text-[#F9F9F9]/70">Premium</div>
                <Badge className="mt-1 bg-[#43AA8B] text-white">Enhanced</Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.pro_users}</div>
                <div className="text-sm text-[#F9F9F9]/70">Pro</div>
                <Badge className="mt-1 bg-[#F4D35E] text-[#0D1B2A]">Advanced</Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.enterprise_users}</div>
                <div className="text-sm text-[#F9F9F9]/70">Enterprise</div>
                <Badge className="mt-1 bg-purple-500 text-white">Premium</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )}
  </div>
);

// Job Analytics Tab Component
interface JobAnalyticsTabProps {
  jobStats: JobStats[];
  getStatusColor: (status: string) => string;
  getPlanColor: (plan: string) => string;
}

const JobAnalyticsTab: React.FC<JobAnalyticsTabProps> = ({ jobStats, getStatusColor, getPlanColor }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Job Analytics</h2>
    
    <Card className="bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white">Recent Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {jobStats.map(job => (
              <div key={job.job_id} className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-medium">{job.job_name}</h4>
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                    <Badge className={getPlanColor(job.plan_tier)}>{job.plan_tier}</Badge>
                  </div>
                  <p className="text-[#F9F9F9]/70 text-sm">{job.user_email}</p>
                  <p className="text-[#F9F9F9]/50 text-xs">
                    Started: {new Date(job.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#F9F9F9]/70">
                    {job.processing_time_minutes}min
                  </div>
                  {job.models_used.length > 0 && (
                    <div className="text-xs text-[#F9F9F9]/50">
                      {job.models_used.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);

// User Management Tab Component
interface UserManagementTabProps {
  users: UserManagement[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPlan: string;
  setFilterPlan: (plan: string) => void;
  onUpdateUser: (userId: string, newTier: string) => void;
  getPlanColor: (plan: string) => string;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  searchQuery,
  setSearchQuery,
  filterPlan,
  setFilterPlan,
  onUpdateUser,
  getPlanColor
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">User Management</h2>
      <div className="flex gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F9F9F9]/50" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1B263B] border-[#43AA8B]/20 text-white"
          />
        </div>
        
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-32 bg-[#1B263B] border-[#43AA8B]/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <Card className="bg-[#1B263B] border-[#43AA8B]/20">
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-[#0D1B2A] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-medium">{user.full_name}</h4>
                    <Badge className={getPlanColor(user.subscription_tier)}>{user.subscription_tier}</Badge>
                  </div>
                  <p className="text-[#F9F9F9]/70 text-sm">{user.email}</p>
                  <p className="text-[#F9F9F9]/50 text-xs">
                    Joined: {new Date(user.created_at).toLocaleDateString()} • {user.total_jobs} jobs
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => onUpdateUser(user.id, value)}>
                    <SelectTrigger className="w-24 bg-[#0D1B2A] border-[#43AA8B]/20 text-white">
                      <SelectValue placeholder="Change" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);

// API Requests Tab Component
interface APIRequestsTabProps {
  apiRequests: APIRequest[];
  onHandleRequest: (requestId: string, action: 'approve' | 'reject') => void;
}

const APIRequestsTab: React.FC<APIRequestsTabProps> = ({ apiRequests, onHandleRequest }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Enterprise API Requests</h2>
    
    <div className="space-y-4">
      {apiRequests.map(request => (
        <Card key={request.id} className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-medium">{request.company_name}</h4>
                  <Badge className={
                    request.status === 'approved' ? 'bg-[#43AA8B] text-white' :
                    request.status === 'rejected' ? 'bg-[#EE964B] text-white' :
                    'bg-[#F4D35E] text-[#0D1B2A]'
                  }>
                    {request.status}
                  </Badge>
                </div>
                <p className="text-[#F9F9F9]/70 text-sm mb-1">{request.user_email}</p>
                <p className="text-[#F9F9F9]/90 mb-2">{request.use_case}</p>
                <p className="text-[#F9F9F9]/70 text-sm">Expected volume: {request.expected_volume}</p>
                <p className="text-[#F9F9F9]/50 text-xs mt-2">
                  Requested: {new Date(request.requested_at).toLocaleString()}
                </p>
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onHandleRequest(request.id, 'approve')}
                    size="sm"
                    className="bg-[#43AA8B] hover:bg-[#43AA8B]/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => onHandleRequest(request.id, 'reject')}
                    size="sm"
                    variant="outline"
                    className="border-[#EE964B] text-[#EE964B] hover:bg-[#EE964B]/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    {apiRequests.length === 0 && (
      <div className="text-center py-12">
        <Key className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No API requests</h3>
        <p className="text-[#F9F9F9]/70">Enterprise API access requests will appear here</p>
      </div>
    )}
  </div>
);

export default AdminDashboard;