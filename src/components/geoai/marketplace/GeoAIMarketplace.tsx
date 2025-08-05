import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Download, Star, TrendingUp, Database, Brain, Globe, Shield, DollarSign, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface MarketplaceItem {
  id: string;
  name: string;
  category: 'dataset' | 'model' | 'plugin' | 'template';
  description: string;
  provider: string;
  price: number;
  currency: 'USD' | 'credits';
  rating: number;
  downloads: number;
  size?: string;
  format?: string;
  accuracy?: number;
  features: string[];
  tags: string[];
  is_featured: boolean;
  is_free: boolean;
  preview_image?: string;
}

interface PurchaseHistory {
  id: string;
  item_id: string;
  item_name: string;
  provider: string;
  amount: number;
  currency: string;
  purchased_at: string;
  status: 'completed' | 'pending' | 'failed';
}

const GeoAIMarketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [userCredits, setUserCredits] = useState(150);

  useEffect(() => {
    // Mock marketplace items
    setMarketplaceItems([
      {
        id: '1',
        name: 'Global Land Cover Dataset 2024',
        category: 'dataset',
        description: 'High-resolution global land cover classification dataset with 30m spatial resolution',
        provider: 'Earth Observation Institute',
        price: 0,
        currency: 'USD',
        rating: 4.8,
        downloads: 12500,
        size: '2.3 TB',
        format: 'GeoTIFF, Shapefile',
        features: ['30m Resolution', 'Global Coverage', '12 Land Cover Classes', 'Quarterly Updates'],
        tags: ['land-cover', 'classification', 'satellite', 'global'],
        is_featured: true,
        is_free: true
      },
      {
        id: '2',
        name: 'Crop Yield Prediction Model',
        category: 'model',
        description: 'AI model for predicting crop yields using satellite imagery and weather data',
        provider: 'AgriTech Solutions',
        price: 50,
        currency: 'credits',
        rating: 4.9,
        downloads: 890,
        accuracy: 0.94,
        features: ['Multi-crop Support', 'Weather Integration', '94% Accuracy', 'API Access'],
        tags: ['agriculture', 'yield-prediction', 'ai-model', 'satellite'],
        is_featured: true,
        is_free: false
      },
      {
        id: '3',
        name: 'Urban Heat Island Analysis Plugin',
        category: 'plugin',
        description: 'Advanced plugin for analyzing urban heat island effects and thermal patterns',
        provider: 'Urban Analytics Lab',
        price: 29.99,
        currency: 'USD',
        rating: 4.6,
        downloads: 2340,
        features: ['Thermal Analysis', 'Heat Mapping', 'Temporal Trends', 'Export Tools'],
        tags: ['urban', 'heat-island', 'thermal', 'analysis'],
        is_featured: false,
        is_free: false
      },
      {
        id: '4',
        name: 'Flood Risk Assessment Template',
        category: 'template',
        description: 'Complete workflow template for flood risk assessment and mapping',
        provider: 'Disaster Analytics Corp',
        price: 25,
        currency: 'credits',
        rating: 4.7,
        downloads: 1560,
        features: ['DEM Processing', 'Hydrological Modeling', 'Risk Mapping', 'Report Generation'],
        tags: ['flood', 'risk-assessment', 'hydrology', 'disaster'],
        is_featured: false,
        is_free: false
      },
      {
        id: '5',
        name: 'Climate Change Impact Dataset',
        category: 'dataset',
        description: 'Comprehensive climate projections and impact data for the next 30 years',
        provider: 'Climate Research Alliance',
        price: 75,
        currency: 'credits',
        rating: 4.8,
        downloads: 756,
        size: '850 GB',
        format: 'NetCDF, CSV',
        features: ['30-year Projections', 'Multiple Scenarios', 'Regional Detail', 'Impact Metrics'],
        tags: ['climate', 'projections', 'impact-assessment', 'scenarios'],
        is_featured: true,
        is_free: false
      },
      {
        id: '6',
        name: 'Deforestation Detection Model',
        category: 'model',
        description: 'Real-time deforestation detection using satellite imagery and machine learning',
        provider: 'Forest Guardian AI',
        price: 40,
        currency: 'credits',
        rating: 4.5,
        downloads: 1240,
        accuracy: 0.91,
        features: ['Real-time Detection', 'Alert System', '91% Accuracy', 'Multi-spectral Support'],
        tags: ['deforestation', 'forest', 'detection', 'ai-model'],
        is_featured: false,
        is_free: false
      }
    ]);

    // Mock purchase history
    setPurchaseHistory([
      {
        id: '1',
        item_id: '2',
        item_name: 'Crop Yield Prediction Model',
        provider: 'AgriTech Solutions',
        amount: 50,
        currency: 'credits',
        purchased_at: '2024-01-20T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        item_id: '4',
        item_name: 'Flood Risk Assessment Template',
        provider: 'Disaster Analytics Corp',
        amount: 25,
        currency: 'credits',
        purchased_at: '2024-01-18T14:15:00Z',
        status: 'completed'
      }
    ]);
  }, []);

  const categories = [
    { id: 'all', name: 'All Items', icon: <Globe className="h-4 w-4" /> },
    { id: 'dataset', name: 'Datasets', icon: <Database className="h-4 w-4" /> },
    { id: 'model', name: 'AI Models', icon: <Brain className="h-4 w-4" /> },
    { id: 'plugin', name: 'Plugins', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'template', name: 'Templates', icon: <Shield className="h-4 w-4" /> }
  ];

  const filteredItems = marketplaceItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredItems = marketplaceItems.filter(item => item.is_featured);

  const purchaseItem = async (item: MarketplaceItem) => {
    if (item.is_free) {
      toast({
        title: "Download Started",
        description: `${item.name} is being downloaded to your workspace.`
      });
      return;
    }

    if (item.currency === 'credits' && userCredits < item.price) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits for this purchase.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Processing Purchase",
        description: "Your purchase is being processed..."
      });

      // Simulate purchase process
      setTimeout(() => {
        if (item.currency === 'credits') {
          setUserCredits(prev => prev - item.price);
        }

        const newPurchase: PurchaseHistory = {
          id: Date.now().toString(),
          item_id: item.id,
          item_name: item.name,
          provider: item.provider,
          amount: item.price,
          currency: item.currency,
          purchased_at: new Date().toISOString(),
          status: 'completed'
        };

        setPurchaseHistory(prev => [newPurchase, ...prev]);

        toast({
          title: "Purchase Successful",
          description: `${item.name} has been added to your workspace.`
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dataset': return <Database className="h-5 w-5 text-blue-400" />;
      case 'model': return <Brain className="h-5 w-5 text-purple-400" />;
      case 'plugin': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'template': return <Shield className="h-5 w-5 text-orange-400" />;
      default: return <Globe className="h-5 w-5 text-gray-400" />;
    }
  };

  const ItemCard = ({ item }: { item: MarketplaceItem }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(item.category)}
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {item.name}
              </CardTitle>
              <CardDescription>by {item.provider}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {item.is_featured && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {item.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{item.downloads.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            {item.is_free ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Free
              </Badge>
            ) : (
              <div className="font-bold">
                {item.currency === 'USD' ? '$' : ''}{item.price}
                {item.currency === 'credits' ? ' credits' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 3} more
            </Badge>
          )}
        </div>

        <Button 
          onClick={() => purchaseItem(item)}
          className="w-full"
          variant={item.is_free ? "outline" : "default"}
        >
          {item.is_free ? (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Free
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GeoAI Marketplace</h1>
          <p className="text-muted-foreground">
            Discover datasets, AI models, plugins, and templates from the GeoAI community
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-yellow-400" />
            <span className="font-medium">{userCredits} Credits</span>
          </div>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Become Seller
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search datasets, models, plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              <span className="ml-1">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="uploads">My Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No items found</p>
                <p className="text-muted-foreground">Try adjusting your search or category filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="space-y-4">
            {purchaseHistory.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{purchase.item_name}</CardTitle>
                      <CardDescription>by {purchase.provider}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {purchase.currency === 'USD' ? '$' : ''}{purchase.amount}
                        {purchase.currency === 'credits' ? ' credits' : ''}
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {purchase.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="uploads">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Upload Your Content</p>
              <p className="text-muted-foreground mb-4">
                Share your datasets, models, and tools with the GeoAI community
              </p>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Uploading
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeoAIMarketplace;