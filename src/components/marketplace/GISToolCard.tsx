
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, ExternalLink, Heart, CheckCircle, Wifi, WifiOff, FileText, Database, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GISToolCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceINR?: number;
  downloads: number;
  rating: number;
  author: string;
  downloadUrl: string;
  isFeatured?: boolean;
  programmingLanguage?: string;
  compatibleSoftware?: string[];
  userPlan?: string;
  isProfessionalUser?: boolean;
  isQGISCompatible?: boolean;
  isOfflineCapable?: boolean;
  includesSampleData?: boolean;
  includesDocumentation?: boolean;
  fileSize?: string;
  lastUpdated?: string;
}

const GISToolCard = ({ 
  id,
  title, 
  description, 
  category, 
  price, 
  priceINR,
  downloads, 
  rating, 
  author, 
  downloadUrl,
  isFeatured,
  programmingLanguage,
  compatibleSoftware,
  userPlan = 'free',
  isProfessionalUser = false,
  isQGISCompatible = false,
  isOfflineCapable = false,
  includesSampleData = false,
  includesDocumentation = false,
  fileSize,
  lastUpdated
}: GISToolCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // All tools are now $14.99 USD for global consistency
  const displayPrice = 14.99;
  const displayPriceINR = priceINR || 1249;

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Simulate payment flow for paid tools
      if (price > 0) {
        toast({
          title: "Redirecting to Payment",
          description: "You'll be redirected to complete your purchase...",
        });
        
        // Simulate payment processing
        setTimeout(() => {
          setIsDownloading(false);
          initiateDownload();
        }, 2000);
      } else {
        initiateDownload();
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  };

  const initiateDownload = () => {
    try {
      if (downloadUrl && downloadUrl !== "#") {
        window.open(downloadUrl, '_blank');
        toast({
          title: "Download Started",
          description: `${title} is now downloading...`,
        });
      } else {
        toast({
          title: "Download Unavailable",
          description: "This file is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to start download. Please check your connection.",
        variant: "destructive",
      });
    }
    setIsDownloading(false);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative">
      {isFeatured && (
        <Badge className="absolute top-2 right-2 z-10" variant="secondary">
          Featured
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="mt-1">
              by {author}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Compatibility Indicators */}
        <div className="flex flex-wrap gap-2 mt-3">
          {isQGISCompatible && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              ✅ QGIS-Compatible
            </Badge>
          )}
          {isOfflineCapable && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline Ready
            </Badge>
          )}
          {includesSampleData && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              <Database className="h-3 w-3 mr-1" />
              Sample Data
            </Badge>
          )}
          {includesDocumentation && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              <FileText className="h-3 w-3 mr-1" />
              Documentation
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline">{category}</Badge>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {programmingLanguage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Language:</span>
              <Badge variant="secondary" className="text-xs">{programmingLanguage}</Badge>
            </div>
          )}

          {compatibleSoftware && compatibleSoftware.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Compatible:</span>
              {compatibleSoftware.slice(0, 2).map((software, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {software}
                </Badge>
              ))}
              {compatibleSoftware.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{compatibleSoftware.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {fileSize && (
                <span>Size: {fileSize}</span>
              )}
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{downloads.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  ${displayPrice}
                </span>
                <Badge variant="secondary" className="text-xs">
                  USD
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                ₹{displayPriceINR} INR
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          onClick={handleDownload} 
          className="flex-1" 
          disabled={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Processing...' : 'Purchase & Download'}
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GISToolCard;
