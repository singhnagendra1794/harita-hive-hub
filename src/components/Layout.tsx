
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from './ScrollToTop';
import ErrorBoundary from './ErrorBoundary';
import NotificationWrapper from './NotificationWrapper';
import MobileOptimizations from './mobile/MobileOptimizations';
import EnhancedAnalytics from './analytics/EnhancedAnalytics';
import FeedbackWidget from './FeedbackWidget';
import OnboardingTour from './OnboardingTour';
import HeaderTest from './layout/HeaderTest';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderTest />
      <MobileOptimizations />
      <EnhancedAnalytics />
      <Navbar />
      <main className="flex-1">
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
