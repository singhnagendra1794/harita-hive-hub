
import React from 'react';
import Layout from '@/components/Layout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CreatorConsole } from '@/components/admin/CreatorConsole';
import { BetaAnalyticsDashboard } from '@/components/beta/BetaAnalyticsDashboard';
import { PaymentApprovalDashboard } from '@/components/admin/PaymentApprovalDashboard';
import YouTubeLiveManager from '@/components/admin/YouTubeLiveManager';

import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import SuperAdminPanel from '@/components/admin/SuperAdminPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart, Upload, Video } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isSuperAdmin, loading: rolesLoading } = useUserRoles();

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
  if (!user || (!hasRole('admin') && !hasRole('super_admin'))) {
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
            Manage platform operations, create content, and monitor performance
          </p>
        </div>

        <Tabs defaultValue={isSuperAdmin() ? "super-admin" : "creator"} className="space-y-4">
          <TabsList>
            {isSuperAdmin() && <TabsTrigger value="super-admin">Super Admin</TabsTrigger>}
            <TabsTrigger value="creator">Creator Console</TabsTrigger>
            <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
            <TabsTrigger value="general">General Admin</TabsTrigger>
            <TabsTrigger value="beta">Beta Analytics</TabsTrigger>
            <TabsTrigger value="payments">Payment Approvals</TabsTrigger>
          </TabsList>

          {isSuperAdmin() && (
            <TabsContent value="super-admin">
              <SuperAdminPanel />
            </TabsContent>
          )}

          <TabsContent value="creator">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Creator Console
                  </CardTitle>
                  <CardDescription>
                    Upload and manage your videos, notes, e-books, code snippets, and plugin tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreatorConsole />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="live-classes">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    YouTube Live Class Manager
                  </CardTitle>
                  <CardDescription>
                    Schedule and manage YouTube Live streaming sessions for professional students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <YouTubeLiveManager />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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

          <TabsContent value="payments">
            <PaymentApprovalDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
