import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GISToolUploader } from '@/components/marketplace/GISToolUploader';
import { SuperAdminUploader } from '@/components/admin/SuperAdminUploader';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Loader2, Shield, Upload } from 'lucide-react';

const UploadCenter: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading: premiumLoading } = usePremiumAccess();
  const { hasRole, loading: rolesLoading } = useUserRoles();

  const isAdmin = hasRole('admin') || hasRole('super_admin');
  const isProfessional = subscription?.subscription_tier === 'pro' || subscription?.subscription_tier === 'enterprise';

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Please log in to access the upload center.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  if (premiumLoading || rolesLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Center</h1>
          <p className="text-muted-foreground">
            Share your tools and content with the community
          </p>
        </div>

        <Tabs defaultValue={isProfessional ? "marketplace" : "admin"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {isProfessional && (
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                GIS Marketplace
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Uploader
              </TabsTrigger>
            )}
          </TabsList>

          {isProfessional && (
            <TabsContent value="marketplace" className="mt-6">
              <GISToolUploader />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <SuperAdminUploader />
            </TabsContent>
          )}
        </Tabs>

        {!isProfessional && !isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Access</CardTitle>
              <CardDescription>
                You need special permissions to upload content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">GIS Marketplace Upload</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your GIS tools, plugins, and scripts to share with the community.
                  </p>
                  <p className="text-sm font-medium text-primary">
                    Requires: Professional Plan
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Admin Universal Uploader</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload content, tools, or resources to any page in the application.
                  </p>
                  <p className="text-sm font-medium text-primary">
                    Requires: Admin Role
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UploadCenter;