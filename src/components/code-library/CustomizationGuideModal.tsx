import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Settings, 
  Play, 
  Copy, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Code,
  FileText,
  Image as ImageIcon,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomizationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippet: {
    id: string;
    title: string;
    code: string;
    language: string;
    configuration: Record<string, any>;
    customization_guide?: {
      variables: Array<{
        name: string;
        description: string;
        example: string;
        required: boolean;
      }>;
      steps: Array<{
        title: string;
        description: string;
        code_snippet?: string;
      }>;
      use_cases: string[];
      tips: string[];
      common_errors: Array<{
        error: string;
        solution: string;
      }>;
      example_outputs: Array<{
        description: string;
        image_url?: string;
      }>;
    };
  };
}

export const CustomizationGuideModal = ({ 
  isOpen, 
  onClose, 
  snippet 
}: CustomizationGuideModalProps) => {
  const { toast } = useToast();
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard!",
      description: "Code snippet has been copied",
    });
  };

  const downloadGuide = () => {
    // Create a comprehensive guide document
    const guideContent = `
# ${snippet.title} - Customization Guide

## Overview
This guide will help you customize and implement the ${snippet.title} code snippet for your specific use case.

## Variables to Customize
${snippet.customization_guide?.variables.map(v => `
### ${v.name} ${v.required ? '(Required)' : '(Optional)'}
- **Description:** ${v.description}
- **Example:** \`${v.example}\`
`).join('\n') || 'No variables to customize.'}

## Step-by-Step Implementation
${snippet.customization_guide?.steps.map((step, index) => `
### Step ${index + 1}: ${step.title}
${step.description}
${step.code_snippet ? `\`\`\`${snippet.language}\n${step.code_snippet}\n\`\`\`` : ''}
`).join('\n') || 'Follow the code as provided.'}

## Use Cases
${snippet.customization_guide?.use_cases.map(useCase => `- ${useCase}`).join('\n') || 'General geospatial analysis tasks.'}

## Tips & Best Practices
${snippet.customization_guide?.tips.map(tip => `- ${tip}`).join('\n') || 'Follow coding best practices.'}

## Common Issues & Solutions
${snippet.customization_guide?.common_errors.map(error => `
**Issue:** ${error.error}
**Solution:** ${error.solution}
`).join('\n') || 'No common issues documented.'}

---
Generated from HaritaHive Code Library
`;

    const blob = new Blob([guideContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title.replace(/\s+/g, '_').toLowerCase()}_guide.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Guide downloaded!",
      description: "Customization guide has been saved as Markdown",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Customization Guide</DialogTitle>
              <DialogDescription className="mt-1">
                Learn how to customize "{snippet.title}" for your specific needs
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadGuide}>
                <Download className="h-4 w-4 mr-1" />
                Download Guide
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="variables" className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="examples">Use Cases</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="outputs">Examples</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[500px]">
            <TabsContent value="variables" className="space-y-4 mt-0">
              <div className="grid gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Variables to Customize</h3>
                </div>
                
                {snippet.customization_guide?.variables ? (
                  snippet.customization_guide.variables.map((variable, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {variable.name}
                          </CardTitle>
                          <Badge variant={variable.required ? "destructive" : "secondary"}>
                            {variable.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {variable.description}
                        </p>
                        <div className="bg-muted rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Example:</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyCode(variable.example)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <code className="text-sm">{variable.example}</code>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-6">
                      <Code className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        This snippet works out of the box with minimal configuration.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="steps" className="space-y-4 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Step-by-Step Implementation</h3>
              </div>
              
              {snippet.customization_guide?.steps ? (
                <div className="space-y-4">
                  {snippet.customization_guide.steps.map((step, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        {step.code_snippet && (
                          <div className="bg-muted rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Code:</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyCode(step.code_snippet!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <pre className="text-sm overflow-x-auto">
                              <code>{step.code_snippet}</code>
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-6">
                    <Play className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Run the code as provided - no additional steps required.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="examples" className="space-y-4 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Real-World Use Cases</h3>
              </div>
              
              {snippet.customization_guide?.use_cases ? (
                <div className="grid gap-3">
                  {snippet.customization_guide.use_cases.map((useCase, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">
                            {index + 1}
                          </Badge>
                          <p className="text-sm">{useCase}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-6">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Use cases will be added based on community feedback.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tips" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Tips & Best Practices</h3>
                </div>
                
                {snippet.customization_guide?.tips && snippet.customization_guide.tips.length > 0 ? (
                  <div className="space-y-3">
                    {snippet.customization_guide.tips.map((tip, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{tip}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-6">
                      <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Follow standard {snippet.language} best practices.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {snippet.customization_guide?.common_errors && snippet.customization_guide.common_errors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Common Issues & Solutions
                    </h4>
                    <div className="space-y-3">
                      {snippet.customization_guide.common_errors.map((error, index) => (
                        <Card key={index} className="border-yellow-200">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <p className="text-sm font-medium">{error.error}</p>
                              </div>
                              <div className="flex items-start gap-2 ml-6">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <p className="text-sm text-muted-foreground">{error.solution}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="outputs" className="space-y-4 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Example Outputs</h3>
              </div>
              
              {snippet.customization_guide?.example_outputs ? (
                <div className="grid gap-4">
                  {snippet.customization_guide.example_outputs.map((output, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <p className="text-sm mb-3">{output.description}</p>
                        {output.image_url && (
                          <div className="bg-muted rounded p-4 text-center">
                            <img 
                              src={output.image_url} 
                              alt={`Example output ${index + 1}`}
                              className="max-w-full h-auto mx-auto rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-6">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Example outputs will be added soon.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};