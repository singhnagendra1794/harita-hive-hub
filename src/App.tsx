
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/spatial-analysis" element={<SpatialAnalysis />} />
          <Route path="/geo-dashboard" element={<GeoDashboard />} />
          <Route path="/job-posting" element={<JobPosting />} />
          <Route path="/resume-posting" element={<ResumePosting />} />
          <Route path="/qgis-project" element={<QgisProject />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
