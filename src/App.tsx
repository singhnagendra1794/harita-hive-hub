
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
import PageErrorBoundary from "@/components/PageErrorBoundary";
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
import SimpleIndex from "./pages/SimpleIndex";
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
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
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
const WatchRecording = lazy(() => import("./pages/WatchRecording"));
const CourseRedirectHandler = lazy(() => import("./components/course-access/CourseRedirectHandler"));

function App() {
  console.log("App component rendering...");
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
                  <Route path="/" element={<Layout><Index /></Layout>} />
                  <Route path="/home" element={<Layout><Home /></Layout>} />
                  <Route path="/auth" element={<Layout><Auth /></Layout>} />
                  <Route path="/login" element={<Layout><Login /></Layout>} />
                  <Route path="/signup" element={<Layout><Signup /></Layout>} />
                   <Route path="/beta" element={<Layout><RouteWrapper><Beta /></RouteWrapper></Layout>} />
                   <Route path="/investors" element={<Layout><RouteWrapper><Investors /></RouteWrapper></Layout>} />
                   <Route path="/pricing" element={<Layout><RouteWrapper><Pricing /></RouteWrapper></Layout>} />
            <Route path="/newsletter" element={<Layout><RouteWrapper><Newsletter /></RouteWrapper></Layout>} />
            <Route path="/blog" element={<Layout><RouteWrapper><Blog /></RouteWrapper></Layout>} />
                   <Route path="/challenge" element={<Layout><RouteWrapper><Challenge /></RouteWrapper></Layout>} />
           <Route path="/upcoming-course" element={<Layout><RouteWrapper><UpcomingCourse /></RouteWrapper></Layout>} />
           <Route path="/skill-roadmap" element={<Layout><RouteWrapper><SkillRoadmap /></RouteWrapper></Layout>} />
           <Route path="/projects-gallery" element={<Layout><RouteWrapper><ProjectsGallery /></RouteWrapper></Layout>} />
           <Route path="/leaderboard" element={<Layout><RouteWrapper><Leaderboard /></RouteWrapper></Layout>} />
          
          <Route path="/job-board" element={<Layout><RouteWrapper><JobBoard /></RouteWrapper></Layout>} />
          <Route path="/freelance-projects" element={
            <Layout>
              <RouteWrapper>
                <Suspense fallback={<PageLoader />}>
                  <FreelanceProjects />
                </Suspense>
              </RouteWrapper>
            </Layout>
          } />
          <Route path="/studio" element={<Layout><RouteWrapper><Studio /></RouteWrapper></Layout>} />
          <Route path="/portfolio" element={<Layout><RouteWrapper><Portfolio /></RouteWrapper></Layout>} />
          <Route path="/mentorship" element={<Layout><RouteWrapper><Mentorship /></RouteWrapper></Layout>} />
          <Route path="/for-companies" element={<Layout><RouteWrapper><CompanyDashboard /></RouteWrapper></Layout>} />
                  <Route path="/faq" element={<Layout><RouteWrapper><FAQ /></RouteWrapper></Layout>} />
                  <Route path="/about" element={<Layout><RouteWrapper><About /></RouteWrapper></Layout>} />
          <Route path="/browse-courses" element={<Layout><RouteWrapper><BrowseCourses /></RouteWrapper></Layout>} />
                <Route path="/courses/geospatial-technology-unlocked" element={<Layout><RouteWrapper><GeospatialTechnologyUnlocked /></RouteWrapper></Layout>} />
                <Route path="/courses/geospatial-fullstack-developer" element={<Layout><RouteWrapper><GeospatialFullstackDeveloper /></RouteWrapper></Layout>} />
          <Route path="/privacy" element={<Layout><RouteWrapper><Privacy /></RouteWrapper></Layout>} />
          <Route path="/terms" element={<Layout><RouteWrapper><Terms /></RouteWrapper></Layout>} />
          <Route path="/refund-policy" element={<Layout><RouteWrapper><RefundPolicy /></RouteWrapper></Layout>} />
          <Route path="/contact" element={<Layout><RouteWrapper><Contact /></RouteWrapper></Layout>} />
                  
                  {/* Plan selection */}
                  <Route path="/choose-plan" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <ChoosePlan />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  
                     {/* Public monetization pages */}
                     <Route path="/talent-pool" element={
                       <Layout>
                         <RouteWrapper>
                           <Suspense fallback={<PageLoader />}>
                             <TalentPool />
                           </Suspense>
                         </RouteWrapper>
                       </Layout>
                     } />
                     <Route path="/corporate-training" element={
                       <Layout>
                         <RouteWrapper>
                           <Suspense fallback={<PageLoader />}>
                             <CorporateTraining />
                           </Suspense>
                         </RouteWrapper>
                       </Layout>
                     } />
                     <Route path="/task-board" element={
                       <Layout>
                         <RouteWrapper>
                           <Suspense fallback={<PageLoader />}>
                             <TaskBoard />
                           </Suspense>
                         </RouteWrapper>
                       </Layout>
                     } />
                     <Route path="/certifications" element={
                       <Layout>
                         <RouteWrapper>
                           <Suspense fallback={<PageLoader />}>
                             <CertificationHub />
                           </Suspense>
                         </RouteWrapper>
                       </Layout>
                     } />
                   
                     {/* Premium marketplace features */}
                     <Route path="/gis-marketplace" element={
                       <Layout>
                         <SubscriptionRoute requiredTier="pro">
                           <RouteWrapper>
                             <Suspense fallback={<PageLoader />}>
                               <GISMarketplace />
                             </Suspense>
                           </RouteWrapper>
                         </SubscriptionRoute>
                       </Layout>
                     } />
                      <Route path="/plugin-marketplace" element={
                        <Layout>
                          <SubscriptionRoute requiredTier="pro">
                            <RouteWrapper>
                              <Suspense fallback={<PageLoader />}>
                                <PluginMarketplace />
                              </Suspense>
                            </RouteWrapper>
                          </SubscriptionRoute>
                        </Layout>
                      } />
                     <Route path="/enhanced-marketplace" element={
                       <Layout>
                         <EnhancedPluginMarketplace />
                       </Layout>
                     } />
                  
                  {/* Protected Routes */}
                   <Route path="/dashboard" element={
                     <Layout>
                       <ProtectedRoute>
                         <RouteWrapper>
                           <Dashboard />
                         </RouteWrapper>
                       </ProtectedRoute>
                     </Layout>
                   } />
                   <Route path="/learn" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <Learn />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                  <Route path="/projects" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <Projects />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                   <Route path="/project-templates" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <ProjectTemplates />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                   <Route path="/map-playground" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <MapPlayground />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                  <Route path="/notes" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <Notes />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/community" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <Community />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/spatial-analysis" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <SpatialAnalysis />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                   <Route path="/geoai-lab" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <GeoAILab />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                   <Route path="/geo-processing-lab" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <GeoProcessingLab />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                  <Route path="/code-snippets" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <CodeSnippets />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
          <Route path="/live-classes" element={
            <Layout>
              <RouteWrapper>
                <LiveClasses />
              </RouteWrapper>
            </Layout>
          } />
          <Route path="/watch-recording" element={
            <Layout>
              <RouteWrapper>
                <WatchRecording />
              </RouteWrapper>
            </Layout>
          } />
          <Route path="/instructor-dashboard" element={
            <Layout>
              <ProtectedRoute>
                <RouteWrapper>
                  <InstructorDashboard />
                </RouteWrapper>
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/streaming" element={
            <Layout>
              <ProtectedRoute>
                <RouteWrapper>
                  <Streaming />
                </RouteWrapper>
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/go-live" element={
            <Layout>
              <ProtectedRoute>
                <RouteWrapper>
                  <GoLive />
                </RouteWrapper>
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/watch-live" element={
            <Layout>
              <ProtectedRoute>
                <RouteWrapper>
                  <WatchLive />
                </RouteWrapper>
              </ProtectedRoute>
            </Layout>
          } />
                   <Route path="/job-posting" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <JobPosting />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/resume-posting" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <ResumePosting />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                   <Route path="/qgis-project" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <QgisProject />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                  <Route path="/geo-dashboard" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <GeoDashboard />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                   <Route path="/ai-studio" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <AIStudio />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                  <Route path="/search" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <Search />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/payment" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <Payment />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/checkout" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <Checkout />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/premium-upgrade" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <PremiumUpgrade />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <AdminDashboard />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/users" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <SuperAdminDashboard />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/bulk-users" element={
                    <Layout>
                      <ProtectedRoute>
                        <RouteWrapper>
                          <AdminUserManagement />
                        </RouteWrapper>
                      </ProtectedRoute>
                    </Layout>
                  } />
                   <Route path="/webgis-builder" element={
                     <Layout>
                       <SubscriptionRoute requiredTier="pro">
                         <RouteWrapper>
                           <WebGISBuilder />
                         </RouteWrapper>
                       </SubscriptionRoute>
                     </Layout>
                   } />
                  
                   
                    {/* Enterprise-only routes */}
                    <Route path="/enterprise-data-integration" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <EnterpriseDataIntegration />
                        </SubscriptionRoute>
                      </Layout>
                    } />
                    <Route path="/iot-data-processing" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <IoTDataProcessing />
                        </SubscriptionRoute>
                      </Layout>
                    } />
                    <Route path="/geoai-engine" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <GeoAIEngine />
                        </SubscriptionRoute>
                      </Layout>
                    } />
                    <Route path="/compliance-toolkit" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <ComplianceToolkit />
                        </SubscriptionRoute>
                      </Layout>
                    } />
                    <Route path="/spatial-risk-analysis" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <SpatialRiskAnalysis />
                        </SubscriptionRoute>
                      </Layout>
                    } />
                    <Route path="/developer-portal" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <DeveloperPortal />
                        </SubscriptionRoute>
                      </Layout>
                    } />
                    <Route path="/enterprise-dashboard" element={
                      <Layout>
                        <SubscriptionRoute requiredTier="enterprise">
                          <EnterpriseDashboard />
                        </SubscriptionRoute>
                      </Layout>
                     } />
                     
                      {/* New Feature Routes */}
                      <Route path="/skill-copilot" element={
                        <Layout>
                          <ProtectedRoute>
                            <RouteWrapper>
                              <Suspense fallback={<PageLoader />}>
                                <SkillCopilot />
                              </Suspense>
                            </RouteWrapper>
                          </ProtectedRoute>
                        </Layout>
                      } />
                       <Route path="/toolkits" element={
                         <Layout>
                           <ProtectedRoute>
                             <RouteWrapper>
                               <Suspense fallback={<PageLoader />}>
                                 <Toolkits />
                               </Suspense>
                             </RouteWrapper>
                           </ProtectedRoute>
                         </Layout>
                       } />
                         <Route path="/jobs-ai-discovery" element={
                           <Layout>
                             <ProtectedRoute>
                               <RouteWrapper>
                                 <Suspense fallback={<PageLoader />}>
                                   <JobsAIDiscovery />
                                 </Suspense>
                               </RouteWrapper>
                             </ProtectedRoute>
                           </Layout>
                         } />
                      <Route path="/project-studio" element={
                        <Layout>
                          <SubscriptionRoute requiredTier="pro">
                            <ProjectStudio />
                          </SubscriptionRoute>
                        </Layout>
                      } />
                      <Route path="/labs" element={
                        <Layout>
                          <SubscriptionRoute requiredTier="pro">
                            <RouteWrapper>
                              <Suspense fallback={<PageLoader />}>
                                <Labs />
                              </Suspense>
                            </RouteWrapper>
                          </SubscriptionRoute>
                        </Layout>
                       } />
                      
                      {/* Course Access Routes */}
                      <Route path="/enrolled-courses" element={
                        <Layout>
                          <ProtectedRoute>
                            <CourseRedirectHandler />
                          </ProtectedRoute>
                        </Layout>
                      } />
                      <Route path="/course/:courseId" element={
                        <Layout>
                          <ProtectedRoute>
                            <CourseRedirectHandler />
                          </ProtectedRoute>
                        </Layout>
                      } />
                      
                      <Route path="*" element={<Layout><NotFound /></Layout>} />
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
