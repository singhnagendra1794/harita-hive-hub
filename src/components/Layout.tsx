
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from './ScrollToTop';
import ErrorBoundary from './ErrorBoundary';
import NotificationWrapper from './NotificationWrapper';
import MobileOptimizations from './mobile/MobileOptimizations';
import GoogleAnalytics from './analytics/GoogleAnalytics';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ErrorBoundary>
      <NotificationWrapper>
        <MobileOptimizations />
        <GoogleAnalytics trackingId={undefined} />
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
        <ScrollToTop />
      </NotificationWrapper>
    </ErrorBoundary>
  );
};

export default Layout;
