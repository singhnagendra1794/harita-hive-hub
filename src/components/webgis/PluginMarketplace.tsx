import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Shield, 
  Zap, 
  Code2, 
  Palette, 
  BarChart3,
  Map,
  Database,
  Globe,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings,
  Heart,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PluginMarketplaceProps {
  projectId: string;
}

const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [installedPlugins, setInstalledPlugins] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Plugins', icon: Package },
    { id: 'visualization', name: 'Visualization', icon: Palette },
    { id: 'analysis', name: 'Analysis', icon: BarChart3 },
    { id: 'data', name: 'Data Sources', icon: Database },
    { id: 'mapping', name: 'Mapping Tools', icon: Map },
    { id: 'utilities', name: 'Utilities', icon: Settings }
  ];

  const plugins = [
    {
      id: 'heatmap-pro',
      name: 'Advanced Heatmap Generator',
      description: 'Create stunning heatmaps with customizable gradients and clustering algorithms',
      category: 'visualization',
      author: 'GeoViz Studio',
      authorAvatar: '',
      version: '2.1.0',
      downloads: 12543,
      rating: 4.8,
      reviews: 89,
      price: 'Free',
      featured: true,
      verified: true,
      lastUpdated: '2 days ago',
      tags: ['heatmap', 'clustering', 'visualization'],
      size: '2.3 MB'
    },
    {
      id: 'satellite-layers',
      name: 'Satellite Imagery Layers',
      description: 'Access high-resolution satellite imagery from multiple providers',
      category: 'data',
      author: 'SkyData Inc',
      authorAvatar: '',
      version: '1.5.2',
      downloads: 8924,
      rating: 4.6,
      reviews: 156,
      price: '$29/month',
      featured: false,
      verified: true,
      lastUpdated: '1 week ago',
      tags: ['satellite', 'imagery', 'layers'],
      size: '5.7 MB'
    },
    {
      id: 'route-optimizer',
      name: 'Smart Route Optimizer',
      description: 'AI-powered route optimization for logistics and transportation',
      category: 'analysis',
      author: 'LogisTech Solutions',
      authorAvatar: '',
      version: '3.0.1',
      downloads: 6789,
      rating: 4.9,
      reviews: 234,
      price: '$99/month',
      featured: true,
      verified: true,
      lastUpdated: '3 days ago',
      tags: ['routing', 'optimization', 'AI'],
      size: '8.2 MB'
    },
    {
      id: 'weather-data',
      name: 'Real-time Weather Data',
      description: 'Integrate live weather data and forecasts into your maps',
      category: 'data',
      author: 'WeatherAPI Pro',
      authorAvatar: '',
      version: '1.2.8',
      downloads: 15673,
      rating: 4.7,
      reviews: 98,
      price: 'Free',
      featured: false,
      verified: true,
      lastUpdated: '5 days ago',
      tags: ['weather', 'real-time', 'forecast'],
      size: '1.8 MB'
    },
    {
      id: 'terrain-3d',
      name: '3D Terrain Visualizer',
      description: 'Create immersive 3D terrain visualizations with elevation data',
      category: 'visualization',
      author: 'Terra3D Labs',
      authorAvatar: '',
      version: '2.3.0',
      downloads: 4567,
      rating: 4.5,
      reviews: 67,
      price: '$49/month',
      featured: false,
      verified: false,
      lastUpdated: '2 weeks ago',
      tags: ['3D', 'terrain', 'elevation'],
      size: '12.4 MB'
    },
    {
      id: 'population-density',
      name: 'Population Density Maps',
      description: 'Visualize population density with dynamic grid systems',
      category: 'analysis',
      author: 'DemoGraphics Inc',
      authorAvatar: '',
      version: '1.8.3',
      downloads: 9876,
      rating: 4.4,
      reviews: 145,
      price: 'Free',
      featured: false,
      verified: true,
      lastUpdated: '1 week ago',
      tags: ['population', 'demographics', 'grid'],
      size: '3.1 MB'
    }
  ];

  const featuredPlugins = plugins.filter(p => p.featured);
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstallPlugin = (pluginId: string, pluginName: string) => {
    if (installedPlugins.has(pluginId)) {
      setInstalledPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
      toast({
        title: "Plugin Uninstalled",
        description: `${pluginName} has been removed from your project.`,
      });
    } else {
      setInstalledPlugins(prev => new Set(prev).add(pluginId));
      toast({
        title: "Plugin Installed",
        description: `${pluginName} has been added to your project.`,
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const PluginCard: React.FC<{ plugin: any }> = ({ plugin }) => {
    const isInstalled = installedPlugins.has(plugin.id);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{plugin.name}</h3>
                  {plugin.verified && (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                  {plugin.featured && (
                    <Badge variant="default" className="text-xs">Featured</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">by {plugin.author}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={isInstalled ? "outline" : "default"}
              onClick={() => handleInstallPlugin(plugin.id, plugin.name)}
            >
              {isInstalled ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Installed
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </>
              )}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{plugin.description}</p>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              {renderStars(plugin.rating)}
              <span className="text-sm text-muted-foreground ml-1">
                {plugin.rating} ({plugin.reviews})
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Download className="h-3 w-3" />
              {plugin.downloads.toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {plugin.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-sm font-medium">
              {plugin.price}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>v{plugin.version}</span>
            <span>{plugin.size}</span>
            <span>{plugin.lastUpdated}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Plugin Marketplace</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Extend your WebGIS capabilities with powerful plugins
                </p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Develop Plugin
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installedPlugins.size})</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Featured Plugins */}
          {featuredPlugins.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Plugins
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredPlugins.map((plugin) => (
                  <PluginCard key={plugin.id} plugin={plugin} />
                ))}
              </div>
            </div>
          )}

          {/* All Plugins */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {searchQuery || selectedCategory !== 'all' ? 'Search Results' : 'All Plugins'}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredPlugins.length} plugins)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlugins.map((plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Installed Tab */}
        <TabsContent value="installed" className="space-y-4">
          {installedPlugins.size === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Plugins Installed</h3>
                <p className="text-muted-foreground mb-4">
                  Browse the marketplace to find and install plugins for your project
                </p>
                <Button>Browse Plugins</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plugins
                .filter(plugin => installedPlugins.has(plugin.id))
                .map((plugin) => (
                  <PluginCard key={plugin.id} plugin={plugin} />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plugins
              .sort((a, b) => b.downloads - a.downloads)
              .slice(0, 6)
              .map((plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginMarketplace;