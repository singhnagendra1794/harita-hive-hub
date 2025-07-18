import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Share, Copy, FileText, Linkedin, Mail, Sparkles, Lock, Crown } from "lucide-react";
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
  onGenerateResume: (format: "pdf" | "linkedin") => void;
}

export const ExportSection = ({ data, onGenerateResume }: ExportSectionProps) => {
  const { toast } = useToast();
  const { hasAccess } = usePremiumAccess();
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkedinContent, setLinkedinContent] = useState("");

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

  const handleGenerateResume = async (format: "pdf" | "linkedin") => {
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
      }
      await onGenerateResume(format);
      toast({
        title: `${format.toUpperCase()} Export Successful`,
        description: format === "pdf" ? "Your resume PDF is ready for download!" : "LinkedIn content has been generated!",
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

      {!hasProAccess && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Crown className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Unlock Professional Resume Features</h3>
                <p className="text-muted-foreground">
                  Get access to PDF downloads, LinkedIn optimization, email sharing, and more with a Professional plan.
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