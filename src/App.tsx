
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Projects from "./pages/Projects";
import SpatialAnalysis from "./pages/SpatialAnalysis";
import GeoDashboard from "./pages/GeoDashboard";
import JobPosting from "./pages/JobPosting";
import ResumePosting from "./pages/ResumePosting";
import QgisProject from "./pages/QgisProject";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import Payment from "./pages/Payment";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
            <Route path="/spatial-analysis" element={
              <ProtectedRoute>
                <SpatialAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/geo-dashboard" element={
              <ProtectedRoute>
                <GeoDashboard />
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
            <Route path="/pricing" element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
