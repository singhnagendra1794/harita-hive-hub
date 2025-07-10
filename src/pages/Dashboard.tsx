
import Layout from "../components/Layout";
import UserDashboard from "../components/dashboard/UserDashboard";
import OnboardingTour from "../components/OnboardingTour";
import { useSessionManagement } from "../hooks/useSessionManagement";

const Dashboard = () => {
  // Initialize session validation
  useSessionManagement();

  return (
    <Layout>
      <UserDashboard />
      <OnboardingTour />
    </Layout>
  );
};

export default Dashboard;
