
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
import Layout from "@/components/Layout";
import GlobalAuthCheck from "@/components/auth/GlobalAuthCheck";
import RouteWrapper from "@/components/RouteWrapper";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// Lazy load pages for better performance
import { lazy, Suspense } from "react";

// Critical pages loaded immediately
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy load non-critical pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const Projects = lazy(() => import("./pages/Projects"));
const Notes = lazy(() => import("./pages/Notes"));
const Community = lazy(() => import("./pages/Community"));
const SpatialAnalysis = lazy(() => import("./pages/SpatialAnalysis"));
const CodeSnippets = lazy(() => import("./pages/CodeSnippets"));
const LiveClasses = lazy(() => import("./pages/LiveClasses"));
const InstructorDashboard = lazy(() => import("./pages/InstructorDashboard"));
const Streaming = lazy(() => import("./pages/Streaming"));
const JobPosting = lazy(() => import("./pages/JobPosting"));
const ResumePosting = lazy(() => import("./pages/ResumePosting"));
const QgisProject = lazy(() => import("./pages/QgisProject"));
const GeoDashboard = lazy(() => import("./pages/GeoDashboard"));
const AIStudio = lazy(() => import("./pages/AIStudio"));
const GeoAILab = lazy(() => import("./pages/GeoAILab"));
const GeoProcessingLab = lazy(() => import("./pages/GeoProcessingLab"));
const Search = lazy(() => import("./pages/Search"));
const Payment = lazy(() => import("./pages/Payment"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PremiumUpgrade = lazy(() => import("./pages/PremiumUpgrade"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const Blog = lazy(() => import("./pages/Blog"));
const EnhancedPluginMarketplace = lazy(() => import("./pages/EnhancedPluginMarketplace"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);
// More lazy loaded pages
const Investors = lazy(() => import("./pages/Investors"));
const Beta = lazy(() => import("./pages/Beta"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MapPlayground = lazy(() => import("./pages/MapPlayground"));
const ProjectTemplates = lazy(() => import("./pages/ProjectTemplates"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const TalentPool = lazy(() => import("./pages/TalentPool"));
const CorporateTraining = lazy(() => import("./pages/CorporateTraining"));
const GISMarketplace = lazy(() => import("./pages/GISMarketplace"));
const TaskBoard = lazy(() => import("./pages/TaskBoard"));
const CertificationHub = lazy(() => import("./pages/CertificationHub"));
const PluginMarketplace = lazy(() => import("./pages/PluginMarketplace"));
const WebGISBuilder = lazy(() => import("./pages/WebGISBuilder"));
const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));
const EnterpriseDataIntegration = lazy(() => import("./pages/EnterpriseDataIntegration"));
const IoTDataProcessing = lazy(() => import("./pages/IoTDataProcessing"));
const GeoAIEngine = lazy(() => import("./pages/GeoAIEngine"));
const ComplianceToolkit = lazy(() => import("./pages/ComplianceToolkit"));
const SpatialRiskAnalysis = lazy(() => import("./pages/SpatialRiskAnalysis"));
const DeveloperPortal = lazy(() => import("./pages/DeveloperPortal"));
const EnterpriseDashboard = lazy(() => import("./pages/EnterpriseDashboard"));
const UpcomingCourse = lazy(() => import("./pages/UpcomingCourse"));
const SkillRoadmap = lazy(() => import("./pages/SkillRoadmap"));
const ProjectsGallery = lazy(() => import("./pages/ProjectsGallery"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const JobBoard = lazy(() => import("./pages/JobBoard"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const BrowseCourses = lazy(() => import("./pages/BrowseCourses"));
const GeospatialTechnologyUnlocked = lazy(() => import("./pages/courses/GeospatialTechnologyUnlocked"));
const GeospatialFullstackDeveloper = lazy(() => import("./pages/courses/GeospatialFullstackDeveloper"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const SkillCopilot = lazy(() => import("./pages/SkillCopilot"));
const Toolkits = lazy(() => import("./pages/Toolkits"));
const JobsAIDiscovery = lazy(() => import("./pages/JobsAIDiscovery"));
const ProjectStudio = lazy(() => import("./pages/ProjectStudio"));
const Labs = lazy(() => import("./pages/Labs"));
const Challenge = lazy(() => import("./pages/Challenge"));
const FreelanceProjects = lazy(() => import("./pages/FreelanceProjects"));
const Studio = lazy(() => import("./pages/Studio"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const GoLive = lazy(() => import("./pages/GoLive"));
const WatchLive = lazy(() => import("./pages/WatchLive"));

function App() {
  const queryClient = new QueryClient();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GlobalAuthCheck />
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
                   <Route path="/beta" element={<RouteWrapper><Beta /></RouteWrapper>} />
                   <Route path="/investors" element={<RouteWrapper><Investors /></RouteWrapper>} />
                   <Route path="/pricing" element={<RouteWrapper><Pricing /></RouteWrapper>} />
            <Route path="/newsletter" element={<RouteWrapper><Newsletter /></RouteWrapper>} />
            <Route path="/blog" element={<RouteWrapper><Blog /></RouteWrapper>} />
                   <Route path="/challenge" element={<RouteWrapper><Challenge /></RouteWrapper>} />
           <Route path="/upcoming-course" element={<RouteWrapper><UpcomingCourse /></RouteWrapper>} />
           <Route path="/skill-roadmap" element={<RouteWrapper><SkillRoadmap /></RouteWrapper>} />
           <Route path="/projects-gallery" element={<RouteWrapper><ProjectsGallery /></RouteWrapper>} />
           <Route path="/leaderboard" element={<RouteWrapper><Leaderboard /></RouteWrapper>} />
          
          <Route path="/job-board" element={<JobBoard />} />
          <Route path="/freelance-projects" element={<FreelanceProjects />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/for-companies" element={<CompanyDashboard />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<About />} />
          <Route path="/browse-courses" element={<BrowseCourses />} />
                <Route path="/courses/geospatial-technology-unlocked" element={<GeospatialTechnologyUnlocked />} />
                <Route path="/courses/geospatial-fullstack-developer" element={<GeospatialFullstackDeveloper />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
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
                    <Route path="/enhanced-marketplace" element={
                      <EnhancedPluginMarketplace />
                    } />
                  
                  {/* Protected Routes */}
                   <Route path="/dashboard" element={
                     <ProtectedRoute>
                       <Suspense fallback={<PageLoader />}>
                         <Dashboard />
                       </Suspense>
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
                     <SubscriptionRoute requiredTier="pro">
                       <ProjectTemplates />
                     </SubscriptionRoute>
                   } />
                   <Route path="/map-playground" element={
                     <SubscriptionRoute requiredTier="pro">
                       <MapPlayground />
                     </SubscriptionRoute>
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
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/instructor-dashboard" element={
            <ProtectedRoute>
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/streaming" element={
            <ProtectedRoute>
              <Streaming />
            </ProtectedRoute>
          } />
          <Route path="/go-live" element={
            <ProtectedRoute>
              <GoLive />
            </ProtectedRoute>
          } />
          <Route path="/watch-live" element={
            <ProtectedRoute>
              <WatchLive />
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
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
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
                  <Route path="/admin/users" element={
                    <ProtectedRoute>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/bulk-users" element={
                    <ProtectedRoute>
                      <AdminUserManagement />
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
                     
                     {/* New Feature Routes */}
                     <Route path="/skill-copilot" element={
                       <ProtectedRoute>
                         <SkillCopilot />
                       </ProtectedRoute>
                     } />
                     <Route path="/toolkits" element={
                       <ProtectedRoute>
                         <Toolkits />
                       </ProtectedRoute>
                     } />
                       <Route path="/jobs-ai-discovery" element={
                         <ProtectedRoute>
                           <JobsAIDiscovery />
                         </ProtectedRoute>
                       } />
                     <Route path="/project-studio" element={
                       <SubscriptionRoute requiredTier="pro">
                         <ProjectStudio />
                       </SubscriptionRoute>
                     } />
                     <Route path="/labs" element={
                       <SubscriptionRoute requiredTier="pro">
                         <Labs />
                       </SubscriptionRoute>
                     } />
                     
                     <Route path="*" element={<NotFound />} />
                  </Routes>
                 
                   {/* Performance monitoring and AI Assistant */}
                   <PerformanceMonitor />
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
