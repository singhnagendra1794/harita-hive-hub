import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, BookOpen, Play, ExternalLink, Star, 
  Clock, Layers, Settings, Code, Database, 
  Users, Calendar, TrendingUp
} from 'lucide-react';
import { SpatialTool } from '@/pages/SpatialAnalysisLab';

interface ToolModalProps {
  tool: SpatialTool | null;
  isOpen: boolean;
  onClose: () => void;
}

const ToolModal = ({ tool, isOpen, onClose }: ToolModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!tool) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'qgis': return '🗺️';
      case 'arcgis': return '🌍';
      case 'python': return '🐍';
      case 'r': return '📊';
      case 'web': return '🌐';
      default: return '💻';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{tool.name}</DialogTitle>
              <DialogDescription className="text-base mt-2">
                {tool.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(tool.difficulty)}>
                {tool.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{tool.stats.rating}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-6 h-[calc(90vh-120px)]">
          {/* Left side - Main content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="guide">Guide</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100%-50px)] mt-4">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Platforms Supported</h3>
                      <div className="flex gap-2 flex-wrap">
                        {tool.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="flex items-center gap-1">
                            <span>{getPlatformIcon(platform)}</span>
                            {platform.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Input/Output</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Database className="h-4 w-4" />
                          <span>Input: {tool.inputTypes.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Layers className="h-4 w-4" />
                          <span>Output: {tool.outputType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Processing: {tool.processingTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Use Cases</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {tool.useCases.map((useCase, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{useCase}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="guide" className="space-y-4">
                  <div className="prose max-w-none">
                    <h3>Step-by-Step Guide</h3>
                    <p>This tool performs {tool.name.toLowerCase()} analysis on your spatial data.</p>
                    
                    <h4>Prerequisites</h4>
                    <ul>
                      <li>Input data in supported formats: {tool.inputTypes.join(', ')}</li>
                      <li>Proper coordinate reference system (CRS)</li>
                      <li>Clean, validated data</li>
                    </ul>

                    <h4>Usage Instructions</h4>
                    <ol>
                      <li>Load your input data into the selected platform</li>
                      <li>Configure the tool parameters (see Parameters tab)</li>
                      <li>Run the analysis</li>
                      <li>Review and export the results</li>
                    </ol>

                    <h4>Expected Output</h4>
                    <p>The tool will generate {tool.outputType} data containing the analysis results.</p>
                  </div>
                </TabsContent>

                <TabsContent value="parameters" className="space-y-4">
                  {tool.parameters && tool.parameters.length > 0 ? (
                    <div className="space-y-4">
                      {tool.parameters.map((param, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{param.name}</h4>
                            <Badge variant="outline">{param.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {param.description}
                          </p>
                          <div className="text-sm">
                            <span className="font-medium">Default: </span>
                            <code className="bg-muted px-1 rounded">{String(param.default)}</code>
                          </div>
                          {param.options && (
                            <div className="text-sm mt-1">
                              <span className="font-medium">Options: </span>
                              {param.options.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No configurable parameters for this tool</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  {tool.codeSnippet ? (
                    <div className="space-y-4">
                      {Object.entries(tool.codeSnippet).map(([language, code]) => (
                        <div key={language}>
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="h-4 w-4" />
                            <h4 className="font-medium capitalize">{language}</h4>
                          </div>
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Code examples coming soon</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right sidebar - Actions & Stats */}
          <div className="w-80 space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Run Tool
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Plugin
              </Button>
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                View Full Guide
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Try in Playground
              </Button>
            </div>

            <Separator />

            {/* Stats */}
            <div className="space-y-3">
              <h4 className="font-medium">Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{tool.stats.downloads.toLocaleString()}</div>
                    <div className="text-muted-foreground">Downloads</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{tool.stats.rating}/5</div>
                    <div className="text-muted-foreground">Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{tool.stats.reviews}</div>
                    <div className="text-muted-foreground">Reviews</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">#{Math.floor(Math.random() * 20) + 1}</div>
                    <div className="text-muted-foreground">Trending</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Additional Information</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Category: {tool.category}</div>
                {tool.sector && <div>Sector: {tool.sector}</div>}
                <div>Last updated: {new Date().toLocaleDateString()}</div>
                <div>Version: 2.1.0</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolModal;