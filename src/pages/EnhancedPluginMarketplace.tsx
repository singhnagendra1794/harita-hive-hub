import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, Star, TrendingUp, Package, Globe, IndianRupee, DollarSign } from 'lucide-react';
import EnhancedToolCard from '@/components/marketplace/EnhancedToolCard';
import PluginUploadForm from '@/components/marketplace/PluginUploadForm';
import PremiumAccessGate from '@/components/premium/PremiumAccessGate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { updatePageSEO, addSchemaMarkup } from '@/utils/seoUtils';

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

const EnhancedPluginMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [tools, setTools] = useState<MarketplaceTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState('US');
  
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const { isSuperAdmin } = useUserRoles();
  const { toast } = useToast();

  const hasProAccess = hasAccess('pro');

  useEffect(() => {
    // Set SEO
    updatePageSEO({
      title: 'GIS Plugin Marketplace | Harita Hive - Download QGIS Plugins & GIS Tools',
      description: 'Discover and download professional GIS plugins, Python scripts, and geospatial tools. Free and premium QGIS plugins, Google Earth Engine apps, and spatial analysis tools.',
      keywords: 'GIS plugins, QGIS plugins, geospatial tools, spatial analysis, remote sensing tools, GIS marketplace, Python GIS scripts',
      url: window.location.href,
      type: 'website'
    });

    // Add marketplace schema
    const marketplaceSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Harita Hive GIS Plugin Marketplace",
      "description": "Professional marketplace for GIS plugins and geospatial tools",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Cross-platform",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "199"
      }
    };
    addSchemaMarkup(marketplaceSchema);

    detectUserLocation();
    fetchTools();
  }, []);

  const detectUserLocation = async () => {
    try {
      // Try to detect user's country via IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_code) {
        setUserCountry(data.country_code);
      }
    } catch (error) {
      console.log('Could not detect location, defaulting to US');
    }
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_tools')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      setTools((data || []) as MarketplaceTool[]);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace tools.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sample data for initial display (will be replaced by database data)
  const sampleTools: MarketplaceTool[] = [
    {
      id: '1',
      title: 'Advanced Buffer Tool Pro',
      description: 'Create complex buffers with varying distances, custom shapes, and advanced spatial analysis capabilities.',
      category: 'Vector',
      tool_type: 'qgis_plugin',
      tech_stack: ['Python', 'QGIS', 'PyQt'],
      tags: ['Vector', 'Spatial Analysis', 'Professional'],
      download_url: 'https://haritahive.com/downloads/buffer-tool-pro.zip',
      github_url: 'https://github.com/haritahive/buffer-tool-pro',
      license_type: 'MIT',
      version: '2.1.0',
      qgis_min_version: '3.22',
      file_size_mb: 2.5,
      is_free: false,
      base_price_usd: 29.99,
      base_price_inr: 2499,
      is_featured: true,
      is_verified: true,
      download_count: 1250,
      rating: 4.8,
      rating_count: 156,
      status: 'active',
      metadata: {},
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-07-10T00:00:00Z'
    },
    {
      id: '2',
      title: 'Satellite Image Classifier AI',
      description: 'Advanced machine learning tool for automated land cover classification using satellite imagery.',
      category: 'Remote Sensing',
      tool_type: 'python_script',
      tech_stack: ['Python', 'TensorFlow', 'GDAL', 'scikit-learn'],
      tags: ['AI', 'Machine Learning', 'Classification'],
      download_url: 'https://haritahive.com/downloads/satellite-classifier-ai.zip',
      github_url: 'https://github.com/haritahive/satellite-classifier-ai',
      license_type: 'Apache 2.0',
      version: '1.3.0',
      python_version: '3.8',
      file_size_mb: 15.2,
      is_free: false,
      base_price_usd: 59.99,
      base_price_inr: 4999,
      is_featured: true,
      is_verified: true,
      download_count: 890,
      rating: 4.9,
      rating_count: 127,
      status: 'active',
      metadata: {},
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-07-05T00:00:00Z'
    },
    {
      id: '3',
      title: 'Open Source NDVI Calculator',
      description: 'Free and open-source tool for calculating NDVI from satellite imagery with multiple band options.',
      category: 'Remote Sensing',
      tool_type: 'qgis_plugin',
      tech_stack: ['Python', 'QGIS', 'NumPy'],
      tags: ['NDVI', 'Open Source', 'Vegetation'],
      download_url: 'https://haritahive.com/downloads/ndvi-calculator.zip',
      github_url: 'https://github.com/haritahive/ndvi-calculator',
      license_type: 'MIT',
      version: '1.0.5',
      qgis_min_version: '3.16',
      file_size_mb: 1.8,
      is_free: true,
      base_price_usd: 0,
      base_price_inr: 0,
      is_featured: true,
      is_verified: true,
      download_count: 3240,
      rating: 4.6,
      rating_count: 284,
      status: 'active',
      metadata: {},
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z'
    }
  ];

  // Use sample data if no tools loaded from database
  const displayTools = tools.length > 0 ? tools : sampleTools;

  // Filter and sort tools
  const filteredTools = displayTools.filter(tool => {
    const matchesSearch = !searchTerm || 
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesType = selectedType === 'all' || tool.tool_type === selectedType;
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === 'free' && tool.is_free) ||
      (priceFilter === 'paid' && !tool.is_free);
    
    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return Number(b.is_featured) - Number(a.is_featured);
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.download_count - a.download_count;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price_low':
        return a.base_price_usd - b.base_price_usd;
      case 'price_high':
        return b.base_price_usd - a.base_price_usd;
      default:
        return 0;
    }
  });

  const categories = ['Vector', 'Raster', 'Remote Sensing', 'Spatial Analysis', 'Web GIS', 'Data Conversion', 'AI/ML'];
  const toolTypes = [
    { value: 'qgis_plugin', label: '🗺️ QGIS Plugin' },
    { value: 'python_script', label: '🐍 Python Script' },
    { value: 'gee_app', label: '🛰️ GEE App' },
    { value: 'web_component', label: '🌐 Web Component' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              GIS Plugin Marketplace
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Discover professional GIS tools, plugins, and scripts. Download free tools or purchase premium solutions with regional pricing.
          </p>

          {/* Regional Pricing Info */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {userCountry === 'IN' ? (
                <>
                  <IndianRupee className="h-3 w-3" />
                  Indian Pricing
                </>
              ) : (
                <>
                  <DollarSign className="h-3 w-3" />
                  Global Pricing
                </>
              )}
            </Badge>
            <Badge variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              {displayTools.length} Tools Available
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools, plugins, scripts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {toolTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free Only</SelectItem>
              <SelectItem value="paid">Premium Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{filteredTools.length}</div>
              <div className="text-sm text-muted-foreground">Tools Found</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredTools.filter(t => t.is_free).length}</div>
              <div className="text-sm text-muted-foreground">Free Tools</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredTools.filter(t => t.is_verified).length}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{filteredTools.filter(t => t.is_featured).length}</div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTools.map((tool) => (
              <EnhancedToolCard 
                key={tool.id} 
                tool={tool} 
                userCountry={userCountry}
              />
            ))}
          </div>
        )}

        {/* Upload Section - Access controlled */}
        {(hasProAccess || isSuperAdmin()) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Contribute to the Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Share your GIS tools and plugins with the global community. Professional users can upload and monetize their tools.
              </p>
              <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Tool
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload New Tool</DialogTitle>
                  </DialogHeader>
                  <PluginUploadForm />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Access Gate for Free Users */}
        {!hasProAccess && (
          <Card className="mt-8 border-dashed border-2 border-primary/20">
            <CardContent className="text-center p-8">
              <h3 className="text-lg font-semibold mb-2">Unlock Full Marketplace Access</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to Professional plan to access premium tools, upload your own plugins, and get priority support.
              </p>
              <Button onClick={() => window.location.href = '/choose-plan'}>
                Upgrade to Professional
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedPluginMarketplace;