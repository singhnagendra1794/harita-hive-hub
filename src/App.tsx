import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

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
import JobPosting from "./pages/JobPosting";
import ResumePosting from "./pages/ResumePosting";
import QgisProject from "./pages/QgisProject";
import GeoDashboard from "./pages/GeoDashboard";
import AIStudio from "./pages/AIStudio";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/learn" element={
                <ProtectedRoute>
                  <Learn />
                </ProtectedRoute>
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
                <ProtectedRoute>
                  <QgisProject />
                </ProtectedRoute>
              } />
              <Route path="/geo-dashboard" element={
                <ProtectedRoute>
                  <GeoDashboard />
                </ProtectedRoute>
              } />
              <Route path="/ai-studio" element={
                <ProtectedRoute>
                  <AIStudio />
                </ProtectedRoute>
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
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
