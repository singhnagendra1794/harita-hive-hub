import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Star, ShoppingCart, Code, ExternalLink, Heart, Lock, FileText, Info, Globe, IndianRupee, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketplaceTool {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
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
  python_version?: string;
  file_size_mb?: number;
  is_free: boolean;
  base_price_usd: number;
  base_price_inr: number;
  is_featured: boolean;
  is_verified: boolean;
  download_count: number;
  rating: number;
  rating_count: number;
  author_id?: string;
  created_by?: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface RegionalPricing {
  local_price: number;
  currency_code: string;
  tax_rate: number;
}

interface EnhancedToolCardProps {
  tool: MarketplaceTool;
  userCountry?: string;
}

const EnhancedToolCard: React.FC<EnhancedToolCardProps> = ({ 
  tool, 
  userCountry = 'US' 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [regionalPrice, setRegionalPrice] = useState<RegionalPricing | null>(null);
  const [hasUserPurchased, setHasUserPurchased] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { hasAccess } = usePremiumAccess();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasProAccess = hasAccess('pro');
  const isIndianUser = userCountry === 'IN';

  useEffect(() => {
    fetchRegionalPricing();
    if (user && !tool.is_free) {
      checkUserPurchase();
    }
  }, [tool.id, userCountry, user]);

  const fetchRegionalPricing = async () => {
    if (tool.is_free) return;
    
    try {
      const { data, error } = await supabase.rpc('get_regional_price', {
        p_base_price_usd: tool.base_price_usd,
        p_country_code: userCountry
      });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setRegionalPrice(data[0]);
      }
    } catch (error) {
      console.error('Error fetching regional pricing:', error);
    }
  };

  const checkUserPurchase = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tool_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_id', tool.id)
        .eq('status', 'completed')
        .limit(1);
      
      if (error) throw error;
      setHasUserPurchased(data && data.length > 0);
    } catch (error) {
      console.error('Error checking purchase:', error);
    }
  };

  const getTechIcon = (tech: string) => {
    const icons: Record<string, string> = {
      'python': '🐍',
      'javascript': '🟨',
      'qgis': '🗺️',
      'arcgis': '🌐',
      'gdal': '🌍',
      'react': '⚛️',
      'vue': '💚',
      'angular': '🔺',
      'nodejs': '💚',
      'tensorflow': '🧠',
      'pytorch': '🔥',
      'opencv': '👁️',
      'postgis': '🐘',
      'docker': '🐳'
    };
    return icons[tech.toLowerCase()] || '⚡';
  };

  const getToolTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'qgis_plugin': '🗺️ QGIS Plugin',
      'python_script': '🐍 Python Script',
      'gee_app': '🛰️ Google Earth Engine',
      'web_component': '🌐 Web Component'
    };
    return types[type] || type;
  };

  const formatPrice = () => {
    if (tool.is_free) return 'Free';
    
    if (regionalPrice) {
      const currencySymbol = regionalPrice.currency_code === 'INR' ? '₹' : '$';
      const totalPrice = regionalPrice.local_price + (regionalPrice.local_price * regionalPrice.tax_rate);
      return `${currencySymbol}${totalPrice.toFixed(2)}`;
    }
    
    return isIndianUser ? `₹${tool.base_price_inr}` : `$${tool.base_price_usd}`;
  };

  const handleDownload = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to download tools.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Check access requirements
    if (!tool.is_free && !hasUserPurchased) {
      setShowPurchaseDialog(true);
      return;
    }

    if (!tool.is_free && !hasProAccess) {
      toast({
        title: "Premium Access Required",
        description: "This tool requires Professional plan access.",
        variant: "destructive"
      });
      navigate('/choose-plan');
      return;
    }

    if (!tool.download_url) {
      toast({
        title: "Download Unavailable",
        description: "This tool is not yet available for download.",
        variant: "destructive"
      });
      return;
    }

    // Validate HaritaHive hosting
    if (!tool.download_url.startsWith('https://haritahive.com/')) {
      toast({
        title: "Invalid Download Source",
        description: "All downloads must be hosted on HaritaHive.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // Record download
      await supabase.from('user_downloads').insert({
        user_id: user.id,
        tool_id: tool.id,
        download_type: tool.is_free ? 'free' : 'purchased',
        download_url: tool.download_url
      });

      // Update download count
      await supabase
        .from('marketplace_tools')
        .update({ download_count: tool.download_count + 1 })
        .eq('id', tool.id);

      // Start download
      const link = document.createElement('a');
      link.href = tool.download_url;
      link.download = tool.download_url.split('/').pop() || `${tool.title}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Check your downloads folder for the file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to start download. Please try again.",
        variant: "destructive"
      });
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Create purchase record
      const { data: purchase, error } = await supabase
        .from('tool_purchases')
        .insert({
          user_id: user.id,
          tool_id: tool.id,
          purchase_price: regionalPrice?.local_price || tool.base_price_usd,
          currency_code: regionalPrice?.currency_code || 'USD',
          payment_method: isIndianUser ? 'razorpay' : 'stripe'
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to payment processing
      if (isIndianUser) {
        // Handle Razorpay payment
        window.location.href = `/payment?type=tool&id=${purchase.id}&method=razorpay`;
      } else {
        // Handle Stripe payment
        window.location.href = `/payment?type=tool&id=${purchase.id}&method=stripe`;
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive"
      });
      console.error("Purchase error:", error);
    }
  };

  const canDownload = tool.is_free || hasUserPurchased;
  const needsPremium = !tool.is_free && !hasProAccess;

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${tool.is_featured ? 'ring-2 ring-primary/20' : ''} ${tool.is_verified ? 'border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight">{tool.title}</CardTitle>
              <CardDescription className="text-sm">
                {getToolTypeDisplay(tool.tool_type)}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {tool.is_verified && (
              <Badge variant="default" className="bg-green-500 text-white text-xs">
                ✓ Verified
              </Badge>
            )}
            {tool.is_featured && (
              <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-xs">
                ⭐ Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1">
          {tool.tech_stack.slice(0, 4).map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {getTechIcon(tech)} {tech}
            </Badge>
          ))}
          {tool.tech_stack.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{tool.tech_stack.length - 4} more
            </Badge>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {tool.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tool.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats and Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{tool.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({tool.rating_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{tool.download_count.toLocaleString()}</span>
            </div>
            {tool.file_size_mb && (
              <div className="text-xs text-muted-foreground">
                {tool.file_size_mb}MB
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

        {/* Version and Compatibility */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">v{tool.version}</Badge>
          {tool.qgis_min_version && (
            <Badge variant="outline" className="text-xs">
              QGIS {tool.qgis_min_version}+
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{tool.license_type}</Badge>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-2">
            {tool.is_free ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Free
              </Badge>
            ) : (
              <div className="flex items-center gap-1">
                {isIndianUser ? (
                  <IndianRupee className="h-4 w-4 text-primary" />
                ) : (
                  <DollarSign className="h-4 w-4 text-primary" />
                )}
                <span className="font-semibold text-lg">{formatPrice()}</span>
                {regionalPrice && regionalPrice.tax_rate > 0 && (
                  <span className="text-xs text-muted-foreground">+tax</span>
                )}
              </div>
            )}
          </div>
          {isIndianUser && !tool.is_free && (
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Indian Pricing
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {tool.is_free || hasUserPurchased ? (
            <Button
              onClick={handleDownload}
              disabled={isDownloading || needsPremium}
              className="col-span-2"
            >
              {needsPremium && <Lock className="h-4 w-4 mr-2" />}
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : (needsPremium ? 'Pro Required' : 'Download')}
            </Button>
          ) : (
            <Button
              onClick={() => setShowPurchaseDialog(true)}
              className="col-span-2 bg-gradient-to-r from-primary to-secondary"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Now
            </Button>
          )}

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
                  <h4 className="font-semibold mb-2">Installation:</h4>
                  {tool.tool_type === 'qgis_plugin' ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Download the ZIP file</li>
                      <li>Open QGIS</li>
                      <li>Go to Plugins → Manage and Install Plugins</li>
                      <li>Click "Install from ZIP" tab</li>
                      <li>Browse and select the downloaded ZIP</li>
                      <li>Click "Install Plugin"</li>
                    </ol>
                  ) : tool.tool_type === 'python_script' ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Download the Python script</li>
                      <li>Install required dependencies: {tool.tech_stack.join(', ')}</li>
                      <li>Run: python {tool.title.toLowerCase().replace(/\s+/g, '_')}.py</li>
                    </ol>
                  ) : (
                    <p className="text-sm">Follow the included README for installation instructions.</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {tool.qgis_min_version && <li>QGIS {tool.qgis_min_version}+</li>}
                    {tool.python_version && <li>Python {tool.python_version}+</li>}
                    {tool.tech_stack.map((tech, i) => (
                      <li key={i}>{tech}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Purchase Dialog */}
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Purchase {tool.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{formatPrice()}</div>
                {regionalPrice && regionalPrice.tax_rate > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Includes {(regionalPrice.tax_rate * 100).toFixed(1)}% tax
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">What's included:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Full source code and documentation</li>
                  <li>Free updates for 1 year</li>
                  <li>Community support access</li>
                  <li>Commercial usage rights</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePurchase} className="bg-gradient-to-r from-primary to-secondary">
                  {isIndianUser ? '₹ Pay with UPI' : '$ Pay with Card'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Additional Links */}
        <div className="flex gap-2 pt-2 border-t">
          {tool.github_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(tool.github_url, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              GitHub
            </Button>
          )}
          {tool.demo_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(tool.demo_url, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Demo
            </Button>
          )}
          {tool.documentation_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(tool.documentation_url, '_blank')}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-1" />
              Docs
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedToolCard;