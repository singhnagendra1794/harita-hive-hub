
import React from 'react';
import Layout from '@/components/Layout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { BetaAnalyticsDashboard } from '@/components/beta/BetaAnalyticsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: rolesLoading } = useUserRoles();

  if (authLoading || rolesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Check if user has admin privileges
  if (!user || !hasRole('admin')) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Restricted
              </CardTitle>
              <CardDescription>
                Admin access required to view this dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please contact an administrator for access.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage platform operations and monitor beta launch performance
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General Admin</TabsTrigger>
            <TabsTrigger value="beta">Beta Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="beta">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Beta Launch Analytics
                  </CardTitle>
                  <CardDescription>
                    Real-time insights into beta program performance and user engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BetaAnalyticsDashboard />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
