import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Share, Copy, FileText, Linkedin, Mail, Sparkles, Lock, Crown, Github, Code, FolderDown, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

interface ExportData {
  personalInfo: any;
  projects: any[];
  skills: any[];
  certificates: any[];
}

interface ExportSectionProps {
  data: ExportData;
  onGenerateResume: (format: "pdf" | "linkedin" | "github" | "json") => void;
}

export const ExportSection = ({ data, onGenerateResume }: ExportSectionProps) => {
  const { toast } = useToast();
  const { hasAccess } = usePremiumAccess();
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkedinContent, setLinkedinContent] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [githubRepoData, setGithubRepoData] = useState("");

  const hasProAccess = hasAccess('pro');

  const generateLinkedInContent = () => {
    const { personalInfo, skills, projects } = data;
    
    const headline = `${personalInfo.title} | ${personalInfo.yearsOfExperience} Years Experience | Geospatial Technology Expert`;
    
    const skillsText = skills.slice(0, 5).map(s => s.name).join(' • ');
    
    const experienceText = `🌍 Passionate geospatial professional with expertise in:
• ${skills.filter(s => s.level === 'expert' || s.level === 'advanced').slice(0, 4).map(s => s.name).join(' • ')}

🚀 Recent Projects:
${projects.slice(0, 3).map(p => `• ${p.title} - ${p.description.slice(0, 100)}...`).join('\n')}

📍 ${personalInfo.location}
📧 ${personalInfo.email}

#GIS #RemoteSensing #SpatialAnalysis #Geospatial #HaritaHive`;

    const content = {
      headline,
      skills: skillsText,
      experience: experienceText
    };

    setLinkedinContent(JSON.stringify(content, null, 2));
  };

  const generateJsonExport = () => {
    const exportJson = {
      portfolioData: data,
      meta: {
        exportedAt: new Date().toISOString(),
        platform: "HaritaHive",
        version: "1.0.0"
      },
      schema: {
        personalInfo: "User profile and contact information",
        projects: "Array of completed projects with details",
        skills: "Technical skills with proficiency levels",
        certificates: "Earned certifications and achievements"
      }
    };
    
    setJsonContent(JSON.stringify(exportJson, null, 2));
  };

  const generateGithubPagesExport = () => {
    const githubData = {
      repositoryStructure: {
        "index.html": "Main portfolio page",
        "css/style.css": "Portfolio styling",
        "js/main.js": "Interactive features",
        "assets/": "Images and documents",
        "_config.yml": "Jekyll configuration",
        "README.md": "Repository documentation"
      },
      deploymentSteps: [
        "1. Create a new GitHub repository named 'portfolio'",
        "2. Upload generated files to the repository",
        "3. Enable GitHub Pages in repository settings",
        "4. Select 'Deploy from a branch' and choose 'main'",
        "5. Your portfolio will be available at username.github.io/portfolio"
      ],
      configContent: `name: ${data.personalInfo.name}
title: Geospatial Technology Portfolio
description: Professional portfolio showcasing GIS and remote sensing expertise
url: "https://username.github.io/portfolio"
theme: minima`,
      htmlPreview: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${data.personalInfo.name} - Portfolio</title>
</head>
<body>
    <h1>${data.personalInfo.name}</h1>
    <p>${data.personalInfo.professionalSummary}</p>
    <!-- Full portfolio content will be generated -->
</body>
</html>`
    };
    
    setGithubRepoData(JSON.stringify(githubData, null, 2));
  };

  const handleGenerateResume = async (format: "pdf" | "linkedin" | "github" | "json") => {
    if (!hasProAccess) {
      toast({
        title: "Premium Feature",
        description: "Resume export is available for Professional and Enterprise users only.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      if (format === "linkedin") {
        generateLinkedInContent();
      } else if (format === "json") {
        generateJsonExport();
      } else if (format === "github") {
        generateGithubPagesExport();
      }
      await onGenerateResume(format);
      toast({
        title: `${format.toUpperCase()} Export Successful`,
        description: format === "pdf" ? "Your resume PDF is ready for download!" : 
                     format === "linkedin" ? "LinkedIn content has been generated!" :
                     format === "json" ? "JSON data export is ready!" :
                     format === "github" ? "GitHub Pages setup is ready!" : "Export completed!",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const sendViaEmail = () => {
    const subject = encodeURIComponent("My Professional Resume - Geospatial Technology");
    const body = encodeURIComponent(`Hi,

I'm sharing my professional resume showcasing my expertise in geospatial technology and GIS development.

Key highlights:
• ${data.personalInfo.yearsOfExperience} years of experience in geospatial technology
• Proficient in: ${data.skills.slice(0, 5).map(s => s.name).join(', ')}
• Completed ${data.projects.length} notable projects

Best regards,
${data.personalInfo.name}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export & Share</h2>
        <p className="text-muted-foreground">Generate professional resume and LinkedIn-optimized content</p>
      </div>

      {!hasProAccess && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Resume export is a premium feature. 
            <Button variant="link" className="p-0 h-auto ml-1">
              Upgrade to Professional
            </Button> 
            to download your resume and access LinkedIn optimization tools.
          </AlertDescription>
        </Alert>
      )}

      {/* Resume Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Preview
            {hasProAccess && <Badge variant="secondary">Pro</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed">
            <div className="text-center space-y-2">
              <h3 className="font-bold text-lg">{data.personalInfo.name}</h3>
              <p className="text-primary font-medium">{data.personalInfo.title}</p>
              <p className="text-sm text-muted-foreground">
                {data.personalInfo.email} • {data.personalInfo.phone} • {data.personalInfo.location}
              </p>
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-semibold border-b">Professional Summary</h4>
                <p className="text-sm mt-1 line-clamp-2">{data.personalInfo.professionalSummary}</p>
              </div>
              
              <div>
                <h4 className="font-semibold border-b">Key Skills</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.skills.slice(0, 8).map(skill => (
                    <Badge key={skill.name} variant="outline" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold border-b">Featured Projects</h4>
                <div className="space-y-1 mt-1">
                  {data.projects.slice(0, 3).map(project => (
                    <div key={project.id} className="text-sm">
                      <span className="font-medium">{project.title}</span>
                      <span className="text-muted-foreground"> - {project.description.slice(0, 60)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => handleGenerateResume("pdf")}
              disabled={!hasProAccess || isGenerating}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Download PDF Resume"}
              {!hasProAccess && <Lock className="h-4 w-4 ml-2" />}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendViaEmail}
              disabled={!hasProAccess}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Resume
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn Optimization
            {hasProAccess && <Badge variant="secondary">Pro</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Suggested Headline</Label>
              <div className="bg-muted p-3 rounded text-sm">
                {data.personalInfo.title} | {data.personalInfo.yearsOfExperience} Years Experience | 
                {data.skills.slice(0, 3).map(s => s.name).join(' • ')} Expert
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Skills Section</Label>
              <div className="flex flex-wrap gap-1">
                {data.skills.slice(0, 10).map(skill => (
                  <Badge key={skill.name} variant="secondary" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {linkedinContent && (
            <div>
              <Label className="text-sm font-medium">Generated LinkedIn Content</Label>
              <Textarea
                value={linkedinContent}
                readOnly
                className="min-h-[200px] text-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => copyToClipboard(linkedinContent)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => handleGenerateResume("linkedin")}
              disabled={!hasProAccess || isGenerating}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate LinkedIn Content
              {!hasProAccess && <Lock className="h-4 w-4 ml-2" />}
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              disabled={!hasProAccess}
              className="flex-1"
            >
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Share className="h-4 w-4 mr-2" />
                Open LinkedIn
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{data.projects.length}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{data.skills.length}</div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {data.skills.filter(s => s.level === 'expert' || s.level === 'advanced').length}
              </div>
              <div className="text-sm text-muted-foreground">Advanced+ Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{data.certificates.length}</div>
              <div className="text-sm text-muted-foreground">Certificates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Pages Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Pages Export
            {hasProAccess && <Badge variant="secondary">Pro</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Deploy your portfolio as a static website on GitHub Pages with a custom domain.
          </p>
          
          {githubRepoData && (
            <div>
              <Label className="text-sm font-medium">Repository Setup Instructions</Label>
              <Textarea
                value={githubRepoData}
                readOnly
                className="min-h-[300px] text-sm font-mono"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => copyToClipboard(githubRepoData)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Setup Instructions
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => handleGenerateResume("github")}
              disabled={!hasProAccess || isGenerating}
              className="flex-1"
            >
              <Github className="h-4 w-4 mr-2" />
              Generate GitHub Pages Setup
              {!hasProAccess && <Lock className="h-4 w-4 ml-2" />}
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              disabled={!hasProAccess}
              className="flex-1"
            >
              <a href="https://github.com/new" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                Create GitHub Repo
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* JSON Developer Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            JSON Developer Export
            <Badge variant="outline">Developer</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your portfolio data as structured JSON for custom integrations and development.
          </p>
          
          {jsonContent && (
            <div>
              <Label className="text-sm font-medium">Portfolio JSON Data</Label>
              <Textarea
                value={jsonContent}
                readOnly
                className="min-h-[200px] text-sm font-mono"
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(jsonContent)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const blob = new Blob([jsonContent], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'portfolio-data.json';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={() => handleGenerateResume("json")}
            disabled={isGenerating}
            className="w-full"
          >
            <Code className="h-4 w-4 mr-2" />
            Generate JSON Export
          </Button>
        </CardContent>
      </Card>

      {/* Downloadable Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderDown className="h-5 w-5" />
            Downloadable Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Professional templates and guides to enhance your geospatial career.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Resume Templates</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Professional resume templates for GIS analysts, remote sensing specialists, and geospatial developers.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-3 w-3 mr-2" />
                Download Templates
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Case Study Templates</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Structured templates for documenting GIS projects and spatial analysis workflows.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-3 w-3 mr-2" />
                Download Templates
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Portfolio Examples</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Sample portfolios from successful geospatial professionals across different specializations.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-3 w-3 mr-2" />
                View Examples
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Career Roadmaps</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Step-by-step career progression guides for GIS, remote sensing, and spatial data science roles.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-3 w-3 mr-2" />
                Download Roadmaps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasProAccess && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Crown className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Unlock Professional Portfolio Features</h3>
                <p className="text-muted-foreground">
                  Get access to PDF downloads, LinkedIn optimization, GitHub Pages export, premium templates, and more with a Professional plan.
                </p>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Upgrade to Professional
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};