import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Download, 
  Share, 
  Eye, 
  Settings, 
  Plus,
  Palette,
  Layout,
  BarChart3,
  Github,
  FileText,
  Linkedin
} from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";
import { ExportSection } from "./ExportSection";
import { PortfolioTemplateSelector } from "./PortfolioTemplateSelector";
import { PortfolioPreview } from "./PortfolioPreview";
import { PortfolioAnalytics } from "./PortfolioAnalytics";
import { AIEnhancementPanel } from "./AIEnhancementPanel";

interface EnhancedPortfolioBuilderProps {
  personalInfo: any;
  projects: any[];
  skills: any[];
  certificates: any[];
  onSavePersonalInfo: (data: any) => void;
  onSaveProjects: (projects: any[]) => void;
  onSaveSkills: (skills: any[]) => void;
}

export const EnhancedPortfolioBuilder = ({
  personalInfo,
  projects,
  skills,
  certificates,
  onSavePersonalInfo,
  onSaveProjects,
  onSaveSkills
}: EnhancedPortfolioBuilderProps) => {
  const {
    portfolio,
    sections,
    templates,
    loading,
    updatePortfolio,
    generatePublicUrl,
    generateResume,
    enhanceWithAI
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState("builder");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading portfolio...</div>
      </div>
    );
  }

  const handleAIEnhancement = async (type: string, content: string) => {
    const enhanced = await enhanceWithAI(type, content, {
      userProfile: personalInfo,
      skills,
      projects
    });
    return enhanced;
  };

  const handleGeneratePublicLink = async () => {
    const url = await generatePublicUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      // Toast will be shown by the hook
    }
  };

  const exportData = {
    personalInfo,
    projects,
    skills,
    certificates
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Portfolio & Resume Builder
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Build your professional geospatial portfolio with AI assistance
        </p>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Button onClick={() => setShowAIPanel(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Enhance with GEOVA AI
          </Button>
          
          <Button variant="outline" onClick={() => setShowTemplateSelector(true)} className="gap-2">
            <Palette className="h-4 w-4" />
            Change Template
          </Button>
          
          <Button variant="outline" onClick={handleGeneratePublicLink} className="gap-2">
            <Share className="h-4 w-4" />
            Get Public Link
          </Button>
          
          {portfolio?.public_url && (
            <Button variant="outline" asChild className="gap-2">
              <a href={`/portfolio/${portfolio.public_url}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
                View Public
              </a>
            </Button>
          )}
        </div>

        {/* Portfolio Stats */}
        {portfolio && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{portfolio.view_count}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{portfolio.download_count}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{skills.length}</div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <PersonalInfoForm 
            data={personalInfo}
            onSave={onSavePersonalInfo}
            onAISuggestion={() => setShowAIPanel(true)}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsSection 
            projects={projects}
            onSave={onSaveProjects}
            haritaHiveProjects={[]}
            liveClassProjects={[]}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillsSection 
            skills={skills}
            onSave={onSaveSkills}
            autoDetectedSkills={[]}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <PortfolioTemplateSelector 
            templates={templates}
            currentTemplate={portfolio?.template_id}
            onSelectTemplate={(templateId) => updatePortfolio({ template_id: templateId })}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <PortfolioPreview 
            portfolio={portfolio}
            sections={sections}
            data={exportData}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportSection 
            data={exportData}
            onGenerateResume={async (format) => {
              if (format === 'json') {
                // JSON export doesn't need backend processing
                return;
              } else if (format === 'github') {
                // GitHub Pages export doesn't need backend processing
                return;
              } else {
                const templateType = portfolio?.template_id ? 
                  templates.find(t => t.id === portfolio.template_id)?.category || 'geoai' : 'geoai';
                return generateResume(format as any, templateType);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* AI Enhancement Panel */}
      {showAIPanel && (
        <AIEnhancementPanel
          isOpen={showAIPanel}
          onClose={() => setShowAIPanel(false)}
          onEnhance={handleAIEnhancement}
          data={exportData}
        />
      )}

      {/* Template Selector */}
      {showTemplateSelector && (
        <PortfolioTemplateSelector
          templates={templates}
          currentTemplate={portfolio?.template_id}
          onSelectTemplate={(templateId) => {
            updatePortfolio({ template_id: templateId });
            setShowTemplateSelector(false);
          }}
          isModal
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
};