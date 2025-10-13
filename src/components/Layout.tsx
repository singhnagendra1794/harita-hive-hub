
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from './ScrollToTop';
import ErrorBoundary from './ErrorBoundary';
import NotificationWrapper from './NotificationWrapper';
import MobileOptimizations from './mobile/MobileOptimizations';
import EnhancedAnalytics from './analytics/EnhancedAnalytics';
import GoogleAds from './analytics/GoogleAds';
import FeedbackWidget from './FeedbackWidget';
import OnboardingTour from './OnboardingTour';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background w-full max-w-full overflow-x-hidden">
      <MobileOptimizations />
      <EnhancedAnalytics />
      <GoogleAds />
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <FeedbackWidget />
      <OnboardingTour />
    </div>
  );
};

export default Layout;
