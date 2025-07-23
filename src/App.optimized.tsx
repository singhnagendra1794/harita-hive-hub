import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatbotProvider } from "@/components/ai/ChatbotProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionRoute from "@/components/SubscriptionRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import NotificationWrapper from "@/components/NotificationWrapper";
import AILearningAssistant from "@/components/ai/AILearningAssistant";
import GlobalAuthCheck from "@/components/auth/GlobalAuthCheck";
import { createLazyRoute } from "@/components/LazyRoute";

// Critical pages - load immediately
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Non-critical pages - lazy load
const Dashboard = createLazyRoute(() => import("./pages/Dashboard"), "Loading dashboard...");
const Learn = createLazyRoute(() => import("./pages/Learn"), "Loading learning content...");
const Projects = createLazyRoute(() => import("./pages/Projects"), "Loading projects...");
const Notes = createLazyRoute(() => import("./pages/Notes"), "Loading notes...");
const Community = createLazyRoute(() => import("./pages/Community"), "Loading community...");
const SpatialAnalysis = createLazyRoute(() => import("./pages/SpatialAnalysis"), "Loading spatial analysis...");
const CodeSnippets = createLazyRoute(() => import("./pages/CodeSnippets"), "Loading code snippets...");
const LiveClasses = createLazyRoute(() => import("./pages/LiveClasses"), "Loading live classes...");
const InstructorDashboard = createLazyRoute(() => import("./pages/InstructorDashboard"), "Loading instructor dashboard...");

// Heavy feature pages - lazy load
const GeoAILab = createLazyRoute(() => import("./pages/GeoAILab"), "Loading GeoAI Lab...");
const GeoProcessingLab = createLazyRoute(() => import("./pages/GeoProcessingLab"), "Loading Geo Processing Lab...");
const AIStudio = createLazyRoute(() => import("./pages/AIStudio"), "Loading AI Studio...");
const MapPlayground = createLazyRoute(() => import("./pages/MapPlayground"), "Loading Map Playground...");
const WebGISBuilder = createLazyRoute(() => import("./pages/WebGISBuilder"), "Loading WebGIS Builder...");

// Admin pages - lazy load
const AdminDashboard = createLazyRoute(() => import("./pages/AdminDashboard"), "Loading admin dashboard...");
const SuperAdminDashboard = createLazyRoute(() => import("./pages/SuperAdminDashboard"), "Loading super admin dashboard...");
const AdminUserManagement = createLazyRoute(() => import("./pages/AdminUserManagement"), "Loading user management...");

// Marketplace pages - lazy load
const EnhancedPluginMarketplace = createLazyRoute(() => import("./pages/EnhancedPluginMarketplace"), "Loading marketplace...");
const GISMarketplace = createLazyRoute(() => import("./pages/GISMarketplace"), "Loading GIS marketplace...");
const PluginMarketplace = createLazyRoute(() => import("./pages/PluginMarketplace"), "Loading plugin marketplace...");

// Course pages - lazy load
const GeospatialTechnologyUnlocked = createLazyRoute(() => import("./pages/courses/GeospatialTechnologyUnlocked"), "Loading course...");
const GeospatialFullstackDeveloper = createLazyRoute(() => import("./pages/courses/GeospatialFullstackDeveloper"), "Loading course...");

// Other pages - lazy load with grouped imports
const OtherPages = {
  Streaming: createLazyRoute(() => import("./pages/Streaming")),
  JobPosting: createLazyRoute(() => import("./pages/JobPosting")),
  ResumePosting: createLazyRoute(() => import("./pages/ResumePosting")),
  QgisProject: createLazyRoute(() => import("./pages/QgisProject")),
  GeoDashboard: createLazyRoute(() => import("./pages/GeoDashboard")),
  Search: createLazyRoute(() => import("./pages/Search")),
  Payment: createLazyRoute(() => import("./pages/Payment")),
  Checkout: createLazyRoute(() => import("./pages/Checkout")),
  PremiumUpgrade: createLazyRoute(() => import("./pages/PremiumUpgrade")),
  Pricing: createLazyRoute(() => import("./pages/Pricing")),
  Newsletter: createLazyRoute(() => import("./pages/Newsletter")),
  Blog: createLazyRoute(() => import("./pages/Blog")),
  Beta: createLazyRoute(() => import("./pages/Beta")),
  Investors: createLazyRoute(() => import("./pages/Investors")),
  ProjectTemplates: createLazyRoute(() => import("./pages/ProjectTemplates")),
  Privacy: createLazyRoute(() => import("./pages/Privacy")),
  Terms: createLazyRoute(() => import("./pages/Terms")),
  RefundPolicy: createLazyRoute(() => import("./pages/RefundPolicy")),
  Contact: createLazyRoute(() => import("./pages/Contact")),
  TalentPool: createLazyRoute(() => import("./pages/TalentPool")),
  CorporateTraining: createLazyRoute(() => import("./pages/CorporateTraining")),
  TaskBoard: createLazyRoute(() => import("./pages/TaskBoard")),
  CertificationHub: createLazyRoute(() => import("./pages/CertificationHub")),
  ChoosePlan: createLazyRoute(() => import("./pages/ChoosePlan")),
  // Enterprise pages
  EnterpriseDataIntegration: createLazyRoute(() => import("./pages/EnterpriseDataIntegration")),
  IoTDataProcessing: createLazyRoute(() => import("./pages/IoTDataProcessing")),
  GeoAIEngine: createLazyRoute(() => import("./pages/GeoAIEngine")),
  ComplianceToolkit: createLazyRoute(() => import("./pages/ComplianceToolkit")),
  SpatialRiskAnalysis: createLazyRoute(() => import("./pages/SpatialRiskAnalysis")),
  DeveloperPortal: createLazyRoute(() => import("./pages/DeveloperPortal")),
  EnterpriseDashboard: createLazyRoute(() => import("./pages/EnterpriseDashboard")),
  // Feature pages
  SkillCopilot: createLazyRoute(() => import("./pages/SkillCopilot")),
  Toolkits: createLazyRoute(() => import("./pages/Toolkits")),
  JobsAIDiscovery: createLazyRoute(() => import("./pages/JobsAIDiscovery")),
  ProjectStudio: createLazyRoute(() => import("./pages/ProjectStudio")),
  Labs: createLazyRoute(() => import("./pages/Labs")),
  Challenge: createLazyRoute(() => import("./pages/Challenge")),
  FreelanceProjects: createLazyRoute(() => import("./pages/FreelanceProjects")),
  Studio: createLazyRoute(() => import("./pages/Studio")),
  Portfolio: createLazyRoute(() => import("./pages/Portfolio")),
  Mentorship: createLazyRoute(() => import("./pages/Mentorship")),
  GoLive: createLazyRoute(() => import("./pages/GoLive")),
  WatchLive: createLazyRoute(() => import("./pages/WatchLive")),
  // Additional pages
  
  SkillRoadmap: createLazyRoute(() => import("./pages/SkillRoadmap")),
  ProjectsGallery: createLazyRoute(() => import("./pages/ProjectsGallery")),
  Leaderboard: createLazyRoute(() => import("./pages/Leaderboard")),
  JobBoard: createLazyRoute(() => import("./pages/JobBoard")),
  CompanyDashboard: createLazyRoute(() => import("./pages/CompanyDashboard")),
  FAQ: createLazyRoute(() => import("./pages/FAQ")),
  About: createLazyRoute(() => import("./pages/About")),
  BrowseCourses: createLazyRoute(() => import("./pages/BrowseCourses")),
};

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Reduce refetch frequency for better performance
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      },
    },
  });

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
                    {/* Critical routes - no lazy loading */}
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Lazy loaded routes */}
                    <Route path="/beta" element={<OtherPages.Beta />} />
                    <Route path="/investors" element={<OtherPages.Investors />} />
                    <Route path="/pricing" element={<OtherPages.Pricing />} />
                    <Route path="/newsletter" element={<OtherPages.Newsletter />} />
                    <Route path="/blog" element={<OtherPages.Blog />} />
                    <Route path="/challenge" element={<OtherPages.Challenge />} />
                    <Route path="/upcoming-course" element={<Navigate to="/browse-courses" replace />} />
                    <Route path="/skill-roadmap" element={<OtherPages.SkillRoadmap />} />
                    <Route path="/projects-gallery" element={<OtherPages.ProjectsGallery />} />
                    <Route path="/leaderboard" element={<OtherPages.Leaderboard />} />
                    <Route path="/job-board" element={<OtherPages.JobBoard />} />
                    <Route path="/freelance-projects" element={<OtherPages.FreelanceProjects />} />
                    <Route path="/studio" element={<OtherPages.Studio />} />
                    <Route path="/portfolio" element={<OtherPages.Portfolio />} />
                    <Route path="/mentorship" element={<OtherPages.Mentorship />} />
                    <Route path="/for-companies" element={<OtherPages.CompanyDashboard />} />
                    <Route path="/faq" element={<OtherPages.FAQ />} />
                    <Route path="/about" element={<OtherPages.About />} />
                    <Route path="/browse-courses" element={<OtherPages.BrowseCourses />} />
                    <Route path="/courses/geospatial-technology-unlocked" element={<GeospatialTechnologyUnlocked />} />
                    <Route path="/courses/geospatial-fullstack-developer" element={<GeospatialFullstackDeveloper />} />
                    <Route path="/privacy" element={<OtherPages.Privacy />} />
                    <Route path="/terms" element={<OtherPages.Terms />} />
                    <Route path="/refund-policy" element={<OtherPages.RefundPolicy />} />
                    <Route path="/contact" element={<OtherPages.Contact />} />
                    
                    {/* Plan selection */}
                    <Route path="/choose-plan" element={
                      <ProtectedRoute>
                        <OtherPages.ChoosePlan />
                      </ProtectedRoute>
                    } />
                    
                    {/* Public monetization pages */}
                    <Route path="/talent-pool" element={<OtherPages.TalentPool />} />
                    <Route path="/corporate-training" element={<OtherPages.CorporateTraining />} />
                    <Route path="/task-board" element={<OtherPages.TaskBoard />} />
                    <Route path="/certifications" element={<OtherPages.CertificationHub />} />
                    
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
                    <Route path="/enhanced-marketplace" element={<EnhancedPluginMarketplace />} />
                  
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
                      <SubscriptionRoute requiredTier="pro">
                        <OtherPages.ProjectTemplates />
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
                        <OtherPages.Streaming />
                      </ProtectedRoute>
                    } />
                    <Route path="/go-live" element={
                      <ProtectedRoute>
                        <OtherPages.GoLive />
                      </ProtectedRoute>
                    } />
                    <Route path="/watch-live" element={
                      <ProtectedRoute>
                        <OtherPages.WatchLive />
                      </ProtectedRoute>
                    } />
                    <Route path="/job-posting" element={
                      <ProtectedRoute>
                        <OtherPages.JobPosting />
                      </ProtectedRoute>
                    } />
                    <Route path="/resume-posting" element={
                      <ProtectedRoute>
                        <OtherPages.ResumePosting />
                      </ProtectedRoute>
                    } />
                    <Route path="/qgis-project" element={
                      <SubscriptionRoute requiredTier="pro">
                        <OtherPages.QgisProject />
                      </SubscriptionRoute>
                    } />
                    <Route path="/geo-dashboard" element={
                      <ProtectedRoute>
                        <OtherPages.GeoDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/ai-studio" element={
                      <SubscriptionRoute requiredTier="pro">
                        <AIStudio />
                      </SubscriptionRoute>
                    } />
                    <Route path="/search" element={
                      <ProtectedRoute>
                        <OtherPages.Search />
                      </ProtectedRoute>
                    } />
                    <Route path="/payment" element={
                      <ProtectedRoute>
                        <OtherPages.Payment />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <OtherPages.Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/premium-upgrade" element={
                      <ProtectedRoute>
                        <OtherPages.PremiumUpgrade />
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
                        <OtherPages.EnterpriseDataIntegration />
                      </SubscriptionRoute>
                    } />
                    <Route path="/iot-data-processing" element={
                      <SubscriptionRoute requiredTier="enterprise">
                        <OtherPages.IoTDataProcessing />
                      </SubscriptionRoute>
                    } />
                    <Route path="/geoai-engine" element={
                      <SubscriptionRoute requiredTier="enterprise">
                        <OtherPages.GeoAIEngine />
                      </SubscriptionRoute>
                    } />
                    <Route path="/compliance-toolkit" element={
                      <SubscriptionRoute requiredTier="enterprise">
                        <OtherPages.ComplianceToolkit />
                      </SubscriptionRoute>
                    } />
                    <Route path="/spatial-risk-analysis" element={
                      <SubscriptionRoute requiredTier="enterprise">
                        <OtherPages.SpatialRiskAnalysis />
                      </SubscriptionRoute>
                    } />
                    <Route path="/developer-portal" element={
                      <SubscriptionRoute requiredTier="enterprise">
                        <OtherPages.DeveloperPortal />
                      </SubscriptionRoute>
                    } />
                    <Route path="/enterprise-dashboard" element={
                      <SubscriptionRoute requiredTier="enterprise">
                        <OtherPages.EnterpriseDashboard />
                      </SubscriptionRoute>
                    } />
                      
                    {/* New Feature Routes */}
                    <Route path="/skill-copilot" element={
                      <ProtectedRoute>
                        <OtherPages.SkillCopilot />
                      </ProtectedRoute>
                    } />
                    <Route path="/toolkits" element={
                      <ProtectedRoute>
                        <OtherPages.Toolkits />
                      </ProtectedRoute>
                    } />
                    <Route path="/jobs-ai-discovery" element={
                      <ProtectedRoute>
                        <OtherPages.JobsAIDiscovery />
                      </ProtectedRoute>
                    } />
                    <Route path="/project-studio" element={
                      <SubscriptionRoute requiredTier="pro">
                        <OtherPages.ProjectStudio />
                      </SubscriptionRoute>
                    } />
                    <Route path="/labs" element={
                      <SubscriptionRoute requiredTier="pro">
                        <OtherPages.Labs />
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
