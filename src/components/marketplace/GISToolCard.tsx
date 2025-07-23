
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, ExternalLink, Heart, CheckCircle, Wifi, WifiOff, FileText, Database, Clock, CreditCard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  hasMarketplaceAccess?: boolean;
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
  hasMarketplaceAccess = false,
  isQGISCompatible = false,
  isOfflineCapable = false,
  includesSampleData = false,
  includesDocumentation = false,
  fileSize,
  lastUpdated
}: GISToolCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasAccess: isPremiumUser } = usePremiumAccess();

  // All tools are now $14.99 USD for global consistency
  const displayPrice = 14.99;
  const displayPriceINR = priceINR || 1249;

  const handleDownload = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to download tools.",
        variant: "destructive",
      });
      return;
    }

    if (!hasMarketplaceAccess) {
      toast({
        title: "Subscription Required",
        description: "Please subscribe to the GIS Marketplace to download tools.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      await initiateSecureDownload();
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  };

  const detectUserRegion = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta') ? 'IN' : 'INTL';
  };

  const initiatePayment = async () => {
    const region = detectUserRegion();
    const amount = region === 'IN' ? displayPriceINR : displayPrice;
    const currency = region === 'IN' ? 'INR' : 'USD';

    // Load Razorpay script if not loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      await new Promise((resolve) => { script.onload = resolve; });
    }

    // Create Razorpay order
    const { data, error } = await supabase.functions.invoke('purchase-tool', {
      body: {
        toolId: id,
        amount: amount,
        currency: currency
      }
    });

    if (error) {
      throw error;
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'Harita Hive',
      description: `Purchase: ${title}`,
      order_id: data.orderId,
      prefill: {
        email: user.email,
        name: user.user_metadata?.full_name || '',
      },
      theme: { color: '#3B82F6' },
      handler: async function (response: any) {
        try {
          // Payment successful, now download
          toast({
            title: "Payment Successful!",
            description: "Your tool purchase is complete. Downloading now...",
          });
          
          // Wait a moment then download
          setTimeout(async () => {
            await initiateSecureDownload();
          }, 1000);
          
        } catch (error) {
          console.error('Post-payment error:', error);
          toast({
            title: "Payment Successful",
            description: "Payment completed! Please try downloading again.",
          });
          setIsDownloading(false);
        }
      },
      modal: {
        ondismiss: function() {
          setIsDownloading(false);
          toast({
            title: "Payment Cancelled",
            description: "You can try again anytime to purchase this tool.",
            variant: "destructive",
          });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const initiateSecureDownload = async () => {
    try {
      // Call secure download function
      const { data, error } = await supabase.functions.invoke('download-gis-tool', {
        body: { toolId: id }
      });

      if (error) {
        throw error;
      }

      if (data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_v${data.version || '1.0'}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started",
          description: `${title} is now downloading...`,
        });
      } else {
        throw new Error('Download URL not available');
      }
      
    } catch (error) {
      console.error('Secure download error:', error);
      toast({
        title: "Download Error",
        description: "Failed to start download. Please contact support if this persists.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
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
          {hasMarketplaceAccess ? (
            <>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download Now'}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe to Download
            </>
          )}
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GISToolCard;
