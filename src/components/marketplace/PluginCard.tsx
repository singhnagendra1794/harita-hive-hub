
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star, Code, Zap, ExternalLink, Heart, Lock } from "lucide-react";
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
  created_at: string;
}

interface PluginCardProps {
  plugin: Plugin;
}

const PluginCard = ({ plugin }: PluginCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
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

  const handleDownload = () => {
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
      window.open(plugin.download_url, '_blank');
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to start download. Please try again.");
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
          {plugin.is_featured && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
              Featured
            </Badge>
          )}
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
