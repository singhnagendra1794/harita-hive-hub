
import Layout from "../components/Layout";
import { UserDashboard } from "../components/dashboard/UserDashboard";
import OnboardingTour from "../components/OnboardingTour";

const Dashboard = () => {
  return (
    <Layout>
      <UserDashboard />
      <OnboardingTour />
    </Layout>
  );
};

export default Dashboard;
