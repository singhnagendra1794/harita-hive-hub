
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star, Code, Zap, ExternalLink, Heart, Lock, FileText, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Plugin {
  id: string;
  title: string;  
  description: string;
  category: string;
  tech_stack: string[];
  tags: string[];
  download_count: number;
  rating: number;
  author: string;
  download_url?: string;
  github_url?: string;
  license: string;
  is_featured: boolean;
  is_signature?: boolean;
  created_at: string;
  version?: string;
  qgis_version?: string;
  last_updated?: string;
}

interface PluginCardProps {
  plugin: Plugin;
}

const PluginCard = ({ plugin }: PluginCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { canAccessPluginMarketplace } = usePremiumAccess();
  const navigate = useNavigate();

  const getTechIcon = (tech: string) => {
    switch (tech.toLowerCase()) {
      case 'python':
        return '🐍';
      case 'javascript':
        return '🟨';
      case 'qgis':
        return '🗺️';
      case 'arcgis':
        return '🌐';
      default:
        return '⚡';
    }
  };

  const handleDownload = async () => {
    if (!canAccessPluginMarketplace()) {
      toast.error("Plugin marketplace access requires Professional plan or higher");
      navigate("/premium");
      return;
    }
    
    if (!plugin.download_url) {
      toast.error("This plugin is not yet available for download.");
      return;
    }

    // Validate HaritaHive hosting
    if (!plugin.download_url.startsWith('https://haritahive.com/')) {
      toast.error("Invalid download source. All downloads must be hosted on HaritaHive.");
      return;
    }
    
    try {
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = plugin.download_url;
      link.download = plugin.download_url.split('/').pop() || `${plugin.title}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started! Check your downloads folder.");
    } catch (error) {
      toast.error("Failed to start download. Please try again.");
      console.error("Download error:", error);
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${plugin.is_featured ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{plugin.title}</CardTitle>
              <CardDescription>by {plugin.author}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {plugin.is_signature && (
              <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary text-white">
                Harita Signature
              </Badge>
            )}
            {plugin.is_featured && (
              <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ QGIS {plugin.qgis_version || "3.22+"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plugin.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {plugin.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {plugin.license}
            </Badge>
            {plugin.version && (
              <Badge variant="outline" className="text-xs">
                v{plugin.version}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-wrap">
            {plugin.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {plugin.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{plugin.tags.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{plugin.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{plugin.download_count.toLocaleString()}</span>
              </div>
              {plugin.last_updated && (
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(plugin.last_updated).toLocaleDateString()}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            onClick={handleDownload} 
            className="flex-1"
            disabled={!canAccessPluginMarketplace()}
          >
            {!canAccessPluginMarketplace() && <Lock className="h-4 w-4 mr-2" />}
            <Download className="h-4 w-4 mr-2" />
            {canAccessPluginMarketplace() ? "Download" : "Pro Required"}
          </Button>
          
          <Dialog open={showInstallGuide} onOpenChange={setShowInstallGuide}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Installation Guide</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">QGIS Installation:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Download the ZIP file</li>
                    <li>Open QGIS</li>
                    <li>Go to Plugins → Manage and Install Plugins</li>
                    <li>Click "Install from ZIP" tab</li>
                    <li>Browse and select the downloaded ZIP</li>
                    <li>Click "Install Plugin"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>QGIS {plugin.qgis_version || "3.22+"}</li>
                    <li>Python 3.6+</li>
                    {plugin.tech_stack.map((tech, i) => (
                      <li key={i}>{tech}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {plugin.github_url && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(plugin.github_url, '_blank')}
              disabled={!canAccessPluginMarketplace()}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PluginCard;
