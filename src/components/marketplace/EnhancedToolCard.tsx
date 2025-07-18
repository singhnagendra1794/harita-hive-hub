import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Star, 
  Eye, 
  Github, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Monitor,
  Smartphone,
  Info,
  FileText,
  Crown,
  Lock,
  ExternalLink
} from 'lucide-react';

interface MarketplaceTool {
  id: string;
  title: string;
  description: string;
  category: string;
  tool_type: 'qgis_plugin' | 'python_script' | 'gee_app' | 'web_component';
  tech_stack: string[];
  tags: string[];
  download_url?: string;
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  license_type: string;
  version: string;
  qgis_min_version?: string;
  file_size_mb?: number;
  is_free: boolean;
  base_price_usd: number;
  base_price_inr: number;
  is_featured: boolean;
  is_verified: boolean;
  download_count: number;
  rating: number;
  rating_count: number;
  status: string;
  plugin_id?: string;
  installation_guide?: string;
  compatibility_notes?: string;
  dependencies?: string[];
  installation_verified?: boolean;
  security_scanned?: boolean;
  created_at: string;
  updated_at: string;
}

interface EnhancedToolCardProps {
  tool: MarketplaceTool;
  userCountry: string;
}

const EnhancedToolCard: React.FC<EnhancedToolCardProps> = ({ tool, userCountry }) => {
  const [downloading, setDownloading] = useState(false);
  const [installationSteps, setInstallationSteps] = useState<Array<{step_number: number, instruction_text: string}>>([]);
  const [compatibilityData, setCompatibilityData] = useState<Array<{qgis_version: string, platform: string, compatibility_status: string, notes: string}>>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const { isSuperAdmin } = useUserRoles();

  const hasProAccess = hasAccess('pro');
  const canDownload = tool.is_free || hasProAccess || isSuperAdmin();

  const price = userCountry === 'IN' ? tool.base_price_inr : tool.base_price_usd;
  const currency = userCountry === 'IN' ? '₹' : '$';

  const fetchInstallationData = async () => {
    try {
      const [instructionsResponse, compatibilityResponse] = await Promise.all([
        supabase
          .from('installation_instructions')
          .select('step_number, instruction_text')
          .eq('tool_id', tool.id)
          .order('step_number'),
        supabase
          .from('plugin_compatibility')
          .select('qgis_version, platform, compatibility_status, notes')
          .eq('tool_id', tool.id)
      ]);

      if (instructionsResponse.data) {
        setInstallationSteps(instructionsResponse.data);
      }
      if (compatibilityResponse.data) {
        setCompatibilityData(compatibilityResponse.data);
      }
    } catch (error) {
      console.error('Error fetching installation data:', error);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to download plugins.",
        variant: "destructive"
      });
      return;
    }

    if (!canDownload) {
      toast({
        title: "Premium Access Required",
        description: "This plugin requires a Professional or Enterprise subscription.",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);

    try {
      const { data, error } = await supabase.functions.invoke('download-plugin', {
        body: {
          toolId: tool.id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started",
          description: `${tool.title} is downloading. File size: ${data.fileSize}MB`,
        });
      } else {
        throw new Error(data.error || 'Download failed');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download plugin. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const getToolTypeIcon = (type: string) => {
    switch (type) {
      case 'qgis_plugin': return '🗺️';
      case 'python_script': return '🐍';
      case 'gee_app': return '🛰️';
      case 'web_component': return '🌐';
      default: return '🔧';
    }
  };

  const getCompatibilityIcon = (status: string) => {
    switch (status) {
      case 'compatible': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'incompatible': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {tool.is_featured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-yellow-500 text-yellow-900">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getToolTypeIcon(tool.tool_type)}</span>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {tool.title}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{tool.rating}</span>
                <span>({tool.rating_count})</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{tool.download_count.toLocaleString()}</span>
              </div>

              {tool.is_verified && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span>Verified</span>
                </div>
              )}

              {tool.security_scanned && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Scanned</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {tool.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tool.tech_stack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {tool.tech_stack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tool.tech_stack.length - 3} more
            </Badge>
          )}
        </div>

        {/* Version and Requirements */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Version:</span> {tool.version}
          </div>
          {tool.qgis_min_version && (
            <div>
              <span className="font-medium">QGIS:</span> {tool.qgis_min_version}+
            </div>
          )}
          {tool.file_size_mb && (
            <div>
              <span className="font-medium">Size:</span> {tool.file_size_mb}MB
            </div>
          )}
          <div>
            <span className="font-medium">License:</span> {tool.license_type}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {tool.is_free ? (
              <Badge className="bg-green-100 text-green-800">
                Free
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
                <span className="text-lg font-bold">
                  {currency}{price}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={downloading || (!canDownload && !tool.is_free)}
            className="flex-1"
            size="sm"
          >
            {downloading ? (
              "Downloading..."
            ) : !canDownload && !tool.is_free ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Premium Only
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Download
              </>
            )}
          </Button>

          <Dialog open={showDetails} onOpenChange={(open) => {
            setShowDetails(open);
            if (open) fetchInstallationData();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{getToolTypeIcon(tool.tool_type)}</span>
                  {tool.title}
                  {tool.is_verified && <Shield className="h-4 w-4 text-blue-600" />}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="installation">Installation</TabsTrigger>
                  <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Technical Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Version:</strong> {tool.version}</div>
                      <div><strong>Category:</strong> {tool.category}</div>
                      <div><strong>License:</strong> {tool.license_type}</div>
                      {tool.qgis_min_version && (
                        <div><strong>Min QGIS:</strong> {tool.qgis_min_version}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {tool.github_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={tool.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {tool.demo_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={tool.demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Demo
                        </a>
                      </Button>
                    )}
                    {tool.documentation_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          Docs
                        </a>
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="installation" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Installation Guide</h4>
                    {tool.installation_guide ? (
                      <p className="text-sm text-muted-foreground mb-4">{tool.installation_guide}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4">
                        Download the ZIP file and install via QGIS Plugin Manager.
                      </p>
                    )}
                  </div>

                  {installationSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Step-by-Step Instructions</h4>
                      <ol className="space-y-2">
                        {installationSteps.map((step) => (
                          <li key={step.step_number} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                              {step.step_number}
                            </span>
                            <span className="text-sm">{step.instruction_text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {tool.compatibility_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Compatibility Notes</h4>
                      <p className="text-sm text-muted-foreground">{tool.compatibility_notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="compatibility" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Tested Compatibility</h4>
                    {compatibilityData.length > 0 ? (
                      <div className="space-y-2">
                        {compatibilityData.map((compat, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            {getCompatibilityIcon(compat.compatibility_status)}
                            <div className="flex-1">
                              <div className="font-medium">
                                QGIS {compat.qgis_version} on {compat.platform}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {compat.compatibility_status}
                                {compat.notes && ` - ${compat.notes}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No compatibility data available. Contact support for specific version requirements.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Required Dependencies</h4>
                    {tool.dependencies && tool.dependencies.length > 0 ? (
                      <ul className="space-y-2">
                        {tool.dependencies.map((dep) => (
                          <li key={dep} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <code className="text-sm bg-muted px-2 py-1 rounded">{dep}</code>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional dependencies required.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {tool.tech_stack.map((tech) => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedToolCard;