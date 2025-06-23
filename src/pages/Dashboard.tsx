
import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { useAnalytics } from '@/hooks/useAnalytics';

const Dashboard = () => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('dashboard');
  }, [trackPageView]);

  return (
    <Layout>
      <UserDashboard />
    </Layout>
  );
};

export default Dashboard;
