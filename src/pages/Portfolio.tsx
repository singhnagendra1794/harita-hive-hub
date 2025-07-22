import { useState, useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PersonalInfoForm } from "@/components/portfolio/PersonalInfoForm";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { ExportSection } from "@/components/portfolio/ExportSection";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  careerObjective: string;
  professionalSummary: string;
  yearsOfExperience: string;
  preferredJobRoles: string[];
  github: string;
  website: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  type: "web-map" | "analysis" | "tool" | "research" | "challenge" | "custom";
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  completedDate: string;
  duration?: string;
  source: "harita-hive" | "custom";
}

interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "programming" | "gis" | "analysis" | "tools" | "cloud" | "remote-sensing";
  source: "auto" | "custom";
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  verificationUrl?: string;
}

const Portfolio = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("portfolio");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Portfolio data state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    linkedin: "",
    location: "",
    careerObjective: "",
    professionalSummary: "",
    yearsOfExperience: "0-1",
    preferredJobRoles: [],
    github: "",
    website: ""
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [autoDetectedProjects, setAutoDetectedProjects] = useState<Project[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [autoDetectedSkills, setAutoDetectedSkills] = useState<Skill[]>([]);

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "1",
      name: "Google Earth Engine Certified Developer",
      issuer: "Google",
      date: "2023-08-15",
      verificationUrl: "https://verify.google.com/cert123"
    },
    {
      id: "2",
      name: "Esri Technical Certification",
      issuer: "Esri",
      date: "2023-06-20"
    },
    {
      id: "3",
      name: "Geospatial Full Stack Developer",
      issuer: "Harita Hive",
      date: "2024-01-10",
      verificationUrl: "https://haritahive.com/verify/cert456"
    }
  ]);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
    setIsLoading(false);
  }, [user]);

  const loadUserData = async () => {
    // Auto-populate with user data
    setPersonalInfo(prev => ({
      ...prev,
      name: user?.user_metadata?.full_name || prev.name,
      email: user?.email || prev.email
    }));

    // TODO: Load actual user data from database
    // This would fetch challenges completed, courses taken, etc.
    
    // Mock auto-detected skills from user activity
    setAutoDetectedSkills([
      { name: "Python", level: "advanced", category: "programming", source: "auto" },
      { name: "QGIS", level: "intermediate", category: "gis", source: "auto" },
      { name: "Google Earth Engine", level: "beginner", category: "analysis", source: "auto" }
    ]);
  };

  const handleSavePersonalInfo = async (data: PersonalInfo) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your portfolio.",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Save to database
      setPersonalInfo(data);
      toast({
        title: "Profile Saved",
        description: "Your personal information has been updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveProjects = async (updatedProjects: Project[]) => {
    try {
      setProjects(updatedProjects);
      toast({
        title: "Projects Updated",
        description: "Your projects have been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your projects.",
        variant: "destructive"
      });
    }
  };

  const handleSaveSkills = async (updatedSkills: Skill[]) => {
    try {
      setSkills(updatedSkills);
      toast({
        title: "Skills Updated",
        description: "Your skills have been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your skills.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateResume = async (format: "pdf" | "linkedin") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export your resume.",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Call resume generation API
      const resumeData = {
        personalInfo,
        projects: [...autoDetectedProjects, ...projects],
        skills: [...autoDetectedSkills, ...skills],
        certificates
      };

      if (format === "pdf") {
        // Generate PDF using edge function
        const { data, error } = await supabase.functions.invoke('generate-resume-pdf', {
          body: resumeData
        });
        
        if (error) throw error;
        
        // Create download link
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Resume generation error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading portfolio...</div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Portfolio & Resume Builder</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Showcase your geospatial expertise and build your professional presence
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <PersonalInfoForm 
              data={personalInfo}
              onSave={handleSavePersonalInfo}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <ProjectsSection 
              projects={projects}
              onSave={handleSaveProjects}
              haritaHiveProjects={autoDetectedProjects}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillsSection 
              skills={skills}
              onSave={handleSaveSkills}
              autoDetectedSkills={autoDetectedSkills}
            />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportSection 
              data={{
                personalInfo,
                projects: [...autoDetectedProjects, ...projects],
                skills: [...autoDetectedSkills, ...skills],
                certificates
              }}
              onGenerateResume={handleGenerateResume}
            />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Portfolio;