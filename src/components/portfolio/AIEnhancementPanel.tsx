import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  FileText, 
  Briefcase, 
  Settings, 
  Target 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIEnhancementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEnhance: (type: string, content: string) => Promise<string | undefined>;
  data: {
    personalInfo: any;
    projects: any[];
    skills: any[];
    certificates: any[];
  };
}

interface Enhancement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: any;
  originalContent: string;
  enhancedContent?: string;
  isLoading: boolean;
  isApplied: boolean;
}

export const AIEnhancementPanel = ({
  isOpen,
  onClose,
  onEnhance,
  data
}: AIEnhancementPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suggestions");
  const [enhancements, setEnhancements] = useState<Enhancement[]>([
    {
      id: "summary",
      type: "summary",
      title: "Professional Summary",
      description: "Enhance your professional summary with industry keywords and compelling language",
      icon: FileText,
      originalContent: data.personalInfo.professionalSummary || "No summary provided",
      isLoading: false,
      isApplied: false
    },
    {
      id: "skills",
      type: "skills",
      title: "Skills Optimization",
      description: "Get recommendations for missing skills and trending technologies",
      icon: Settings,
      originalContent: data.skills.map(s => s.name).join(", "),
      isLoading: false,
      isApplied: false
    },
    {
      id: "experience",
      type: "experience",
      title: "Experience Bullets",
      description: "Transform your experience into powerful, achievement-focused bullet points",
      icon: Briefcase,
      originalContent: data.personalInfo.careerObjective || "No experience description provided",
      isLoading: false,
      isApplied: false
    },
    {
      id: "projects",
      type: "projects",
      title: "Project Descriptions",
      description: "Enhance project descriptions to highlight technical skills and impact",
      icon: Target,
      originalContent: data.projects[0]?.description || "No projects available",
      isLoading: false,
      isApplied: false
    }
  ]);

  const [customContent, setCustomContent] = useState("");
  const [customType, setCustomType] = useState("summary");

  const handleEnhance = async (enhancementId: string) => {
    const enhancement = enhancements.find(e => e.id === enhancementId);
    if (!enhancement) return;

    setEnhancements(prev => 
      prev.map(e => e.id === enhancementId ? { ...e, isLoading: true } : e)
    );

    try {
      const enhanced = await onEnhance(enhancement.type, enhancement.originalContent);
      
      setEnhancements(prev => 
        prev.map(e => e.id === enhancementId ? { 
          ...e, 
          enhancedContent: enhanced, 
          isLoading: false 
        } : e)
      );

      toast({
        title: "Enhancement Complete",
        description: `Your ${enhancement.title.toLowerCase()} has been enhanced!`,
      });
    } catch (error) {
      setEnhancements(prev => 
        prev.map(e => e.id === enhancementId ? { ...e, isLoading: false } : e)
      );
      
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing your content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCustomEnhance = async () => {
    if (!customContent.trim()) return;

    try {
      const enhanced = await onEnhance(customType, customContent);
      setCustomContent(enhanced || "");
      
      toast({
        title: "Custom Enhancement Complete",
        description: "Your content has been enhanced!",
      });
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing your content.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            GEOVA AI Portfolio Enhancement
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="custom">Custom Enhancement</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid gap-4">
              {enhancements.map((enhancement) => {
                const IconComponent = enhancement.icon;
                
                return (
                  <Card key={enhancement.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{enhancement.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {enhancement.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleEnhance(enhancement.id)}
                          disabled={enhancement.isLoading}
                          size="sm"
                        >
                          {enhancement.isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Enhance
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Original Content:</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          {enhancement.originalContent}
                        </div>
                      </div>
                      
                      {enhancement.enhancedContent && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Enhanced Content:</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(enhancement.enhancedContent!)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-primary/5 border border-primary/20 p-3 rounded text-sm">
                            {enhancement.type === 'skills' ? (
                              <pre className="whitespace-pre-wrap font-sans">
                                {enhancement.enhancedContent}
                              </pre>
                            ) : (
                              enhancement.enhancedContent
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Content Enhancement</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Paste any content you want to enhance with AI
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type:</label>
                  <div className="flex gap-2 mb-4">
                    {["summary", "experience", "projects", "skills"].map(type => (
                      <Button
                        key={type}
                        variant={customType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Textarea
                  placeholder="Paste your content here..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="min-h-[120px]"
                />
                
                <Button 
                  onClick={handleCustomEnhance}
                  disabled={!customContent.trim()}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};