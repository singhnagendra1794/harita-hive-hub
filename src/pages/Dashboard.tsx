

import UserDashboard from "../components/dashboard/UserDashboard";
import OnboardingTour from "../components/OnboardingTour";


const Dashboard = () => {
  // Session management now handled by AuthContext

  return (
    <>
      <UserDashboard />
      <OnboardingTour />
    </>
  );
};

export default Dashboard;
