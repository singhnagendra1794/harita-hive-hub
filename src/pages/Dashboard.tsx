
import UserDashboard from "../components/dashboard/UserDashboard";
import OnboardingTour from "../components/OnboardingTour";
import Layout from '../components/Layout';

const Dashboard = () => {
  // Session management now handled by AuthContext

  return (
    <Layout>
      <UserDashboard />
      <OnboardingTour />
    </Layout>
  );
};

export default Dashboard;
