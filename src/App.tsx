
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatbotProvider } from "@/components/ai/ChatbotProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionRoute from "@/components/SubscriptionRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import NotificationWrapper from "@/components/NotificationWrapper";
import AILearningAssistant from "@/components/ai/AILearningAssistant";

// Page imports
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Projects from "./pages/Projects";
import Notes from "./pages/Notes";
import Community from "./pages/Community";
import SpatialAnalysis from "./pages/SpatialAnalysis";
import CodeSnippets from "./pages/CodeSnippets";
import LiveClasses from "./pages/LiveClasses";
import LiveClassViewer from "./pages/LiveClassViewer";
import JobPosting from "./pages/JobPosting";
import ResumePosting from "./pages/ResumePosting";
import QgisProject from "./pages/QgisProject";
import GeoDashboard from "./pages/GeoDashboard";
import AIStudio from "./pages/AIStudio";
import GeoAILab from "./pages/GeoAILab";
import GeoProcessingLab from "./pages/GeoProcessingLab";
import Search from "./pages/Search";
import Payment from "./pages/Payment";
import PremiumUpgrade from "./pages/PremiumUpgrade";
import Pricing from "./pages/Pricing";
import Newsletter from "./pages/Newsletter";
import AdminDashboard from "./pages/AdminDashboard";
import Investors from "./pages/Investors";
import Beta from "./pages/Beta";
import NotFound from "./pages/NotFound";
import MapPlayground from "./pages/MapPlayground";
import ProjectTemplates from "./pages/ProjectTemplates";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import TalentPool from "./pages/TalentPool";
import CorporateTraining from "./pages/CorporateTraining";
import GISMarketplace from "./pages/GISMarketplace";
import TaskBoard from "./pages/TaskBoard";
import CertificationHub from "./pages/CertificationHub";
import PluginMarketplace from "./pages/PluginMarketplace";
import WebGISBuilder from "./pages/WebGISBuilder";
import ChoosePlan from "./pages/ChoosePlan";
import EnterpriseDataIntegration from "./pages/EnterpriseDataIntegration";
import IoTDataProcessing from "./pages/IoTDataProcessing";
import GeoAIEngine from "./pages/GeoAIEngine";
import ComplianceToolkit from "./pages/ComplianceToolkit";
import SpatialRiskAnalysis from "./pages/SpatialRiskAnalysis";
import DeveloperPortal from "./pages/DeveloperPortal";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import UpcomingCourse from "./pages/UpcomingCourse";
import SkillRoadmap from "./pages/SkillRoadmap";
import ProjectsGallery from "./pages/ProjectsGallery";
import Leaderboard from "./pages/Leaderboard";
import JobBoard from "./pages/JobBoard";
import CompanyDashboard from "./pages/CompanyDashboard";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import BrowseCourses from "./pages/BrowseCourses";
import GeospatialFullstackDeveloper from "./pages/courses/GeospatialFullstackDeveloper";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationWrapper>
            <ChatbotProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/beta" element={<Beta />} />
                  <Route path="/investors" element={<Investors />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/upcoming-course" element={<UpcomingCourse />} />
          <Route path="/skill-roadmap" element={<SkillRoadmap />} />
          <Route path="/projects-gallery" element={<ProjectsGallery />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/for-companies" element={<CompanyDashboard />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<About />} />
          <Route path="/browse-courses" element={<BrowseCourses />} />
          <Route path="/courses/geospatial-fullstack-developer" element={<GeospatialFullstackDeveloper />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
                  
                  {/* Plan selection */}
                  <Route path="/choose-plan" element={
                    <ProtectedRoute>
                      <ChoosePlan />
                    </ProtectedRoute>
                  } />
                  
                   {/* Public monetization pages */}
                   <Route path="/talent-pool" element={<TalentPool />} />
                   <Route path="/corporate-training" element={<CorporateTraining />} />
                   <Route path="/task-board" element={<TaskBoard />} />
                   <Route path="/certifications" element={<CertificationHub />} />
                   
                   {/* Premium marketplace features */}
                   <Route path="/gis-marketplace" element={
                     <SubscriptionRoute requiredTier="pro">
                       <GISMarketplace />
                     </SubscriptionRoute>
                   } />
                   <Route path="/plugin-marketplace" element={
                     <SubscriptionRoute requiredTier="pro">
                       <PluginMarketplace />
                     </SubscriptionRoute>
                   } />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                   <Route path="/learn" element={
                     <SubscriptionRoute requiredTier="pro">
                       <Learn />
                     </SubscriptionRoute>
                   } />
                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <Projects />
                    </ProtectedRoute>
                  } />
                  <Route path="/project-templates" element={
                    <ProtectedRoute>
                      <ProjectTemplates />
                    </ProtectedRoute>
                  } />
                  <Route path="/map-playground" element={
                    <ProtectedRoute>
                      <MapPlayground />
                    </ProtectedRoute>
                  } />
                  <Route path="/notes" element={
                    <ProtectedRoute>
                      <Notes />
                    </ProtectedRoute>
                  } />
                  <Route path="/community" element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  } />
                  <Route path="/spatial-analysis" element={
                    <ProtectedRoute>
                      <SpatialAnalysis />
                    </ProtectedRoute>
                  } />
                   <Route path="/geoai-lab" element={
                     <SubscriptionRoute requiredTier="pro">
                       <GeoAILab />
                     </SubscriptionRoute>
                   } />
                   <Route path="/geo-processing-lab" element={
                     <SubscriptionRoute requiredTier="pro">
                       <GeoProcessingLab />
                     </SubscriptionRoute>
                   } />
                  <Route path="/code-snippets" element={
                    <ProtectedRoute>
                      <CodeSnippets />
                    </ProtectedRoute>
                  } />
        <Route path="/live-classes" element={
          <ProtectedRoute>
            <LiveClasses />
          </ProtectedRoute>
        } />
        <Route path="/live-classes/:id" element={
          <ProtectedRoute>
            <LiveClassViewer />
          </ProtectedRoute>
        } />
                  <Route path="/job-posting" element={
                    <ProtectedRoute>
                      <JobPosting />
                    </ProtectedRoute>
                  } />
                  <Route path="/resume-posting" element={
                    <ProtectedRoute>
                      <ResumePosting />
                    </ProtectedRoute>
                  } />
                   <Route path="/qgis-project" element={
                     <SubscriptionRoute requiredTier="pro">
                       <QgisProject />
                     </SubscriptionRoute>
                   } />
                  <Route path="/geo-dashboard" element={
                    <ProtectedRoute>
                      <GeoDashboard />
                    </ProtectedRoute>
                  } />
                   <Route path="/ai-studio" element={
                     <SubscriptionRoute requiredTier="pro">
                       <AIStudio />
                     </SubscriptionRoute>
                   } />
                  <Route path="/search" element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  } />
                  <Route path="/premium-upgrade" element={
                    <ProtectedRoute>
                      <PremiumUpgrade />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                   <Route path="/webgis-builder" element={
                     <SubscriptionRoute requiredTier="pro">
                       <WebGISBuilder />
                     </SubscriptionRoute>
                   } />
                  
                   
                   {/* Enterprise-only routes */}
                   <Route path="/enterprise-data-integration" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <EnterpriseDataIntegration />
                     </SubscriptionRoute>
                   } />
                   <Route path="/iot-data-processing" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <IoTDataProcessing />
                     </SubscriptionRoute>
                   } />
                   <Route path="/geoai-engine" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <GeoAIEngine />
                     </SubscriptionRoute>
                   } />
                   <Route path="/compliance-toolkit" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <ComplianceToolkit />
                     </SubscriptionRoute>
                   } />
                   <Route path="/spatial-risk-analysis" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <SpatialRiskAnalysis />
                     </SubscriptionRoute>
                   } />
                   <Route path="/developer-portal" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <DeveloperPortal />
                     </SubscriptionRoute>
                   } />
                   <Route path="/enterprise-dashboard" element={
                     <SubscriptionRoute requiredTier="enterprise">
                       <EnterpriseDashboard />
                     </SubscriptionRoute>
                   } />
                    
                    <Route path="*" element={<NotFound />} />
                 </Routes>
                 
                 {/* AI Learning Assistant - Available on all pages */}
                 <AILearningAssistant />
               </BrowserRouter>
            </TooltipProvider>
          </ChatbotProvider>
          </NotificationWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
