import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AccessManagementPanel from '@/components/admin/AccessManagementPanel';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AccessManagement = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: adminLoading } = useSuperAdminAccess();
  const navigate = useNavigate();

  // Check if user is super admin
  useEffect(() => {
    if (!adminLoading && user && !isSuperAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate, isSuperAdmin, adminLoading]);

  if (adminLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Verifying access...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <AccessManagementPanel />
      </div>
    </Layout>
  );
};

export default AccessManagement;