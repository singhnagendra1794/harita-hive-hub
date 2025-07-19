
import { useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GISToolCard from "../components/marketplace/GISToolCard";
import { Plus, Search, Filter, TrendingUp, Package, Users } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

const GISMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const { plan } = useUserStats();
  
  // Check if user has professional access
  const isProfessionalUser = plan?.plan === 'professional' || plan?.subscription_tier === 'pro' || plan?.subscription_tier === 'enterprise';

  // Mock data - replace with real data from Supabase
  const tools = [
    {
      id: "1",
      title: "Advanced Spatial Analysis Toolkit",
      description: "Complete toolkit for advanced spatial analysis including clustering, hotspot analysis, and network analysis tools.",
      category: "Analysis",
      price: 49.99,
      downloads: 1245,
      rating: 4.8,
      author: "GeoSpatial Pro",
      downloadUrl: "#",
      isFeatured: true,
      programmingLanguage: "Python",
      compatibleSoftware: ["ArcGIS", "QGIS", "PostGIS"]
    },
    {
      id: "2", 
      title: "Land Use Classification Scripts",
      description: "Machine learning scripts for automated land use classification from satellite imagery.",
      category: "Machine Learning",
      price: 0,
      downloads: 3421,
      rating: 4.6,
      author: "Dr. Sarah Chen",
      downloadUrl: "#",
      programmingLanguage: "R",
      compatibleSoftware: ["R Studio", "Google Earth Engine"]
    },
    {
      id: "3",
      title: "Web Mapping Dashboard Template",
      description: "Complete responsive web mapping dashboard template with admin panel and user management.",
      category: "Web Development",
      price: 79.99,
      downloads: 892,
      rating: 4.9,
      author: "WebGIS Solutions",
      downloadUrl: "#",
      programmingLanguage: "JavaScript",
      compatibleSoftware: ["Leaflet", "Mapbox", "OpenLayers"]
    },
    {
      id: "4",
      title: "DEM Processing Utilities",
      description: "Comprehensive set of tools for Digital Elevation Model processing and terrain analysis.",
      category: "Data Processing",
      price: 29.99,
      downloads: 687,
      rating: 4.4,
      author: "TerrainTech",
      downloadUrl: "#",
      programmingLanguage: "Python",
      compatibleSoftware: ["GDAL", "ArcGIS", "QGIS"]
    }
  ];

  const categories = ["Analysis", "Machine Learning", "Web Development", "Data Processing", "Visualization"];
  
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && tool.price === 0) ||
                        (priceFilter === "paid" && tool.price > 0);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const featuredTools = tools.filter(t => t.isFeatured);
  const stats = {
    totalTools: tools.length,
    totalDownloads: tools.reduce((sum, t) => sum + t.downloads, 0),
    activeCreators: 156
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover and download GIS tools, scripts, templates, and resources created by the community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Package className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalTools}</div>
                  <div className="text-muted-foreground">Tools Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeCreators}</div>
                  <div className="text-muted-foreground">Active Creators</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools, scripts, templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="browse" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="browse">Browse All</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
            </TabsList>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Tool
            </Button>
          </div>

          <TabsContent value="browse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <GISToolCard 
                  key={tool.id} 
                  {...tool} 
                  userPlan={plan?.plan || 'free'}
                  isProfessionalUser={isProfessionalUser}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map(tool => (
                <GISToolCard 
                  key={tool.id} 
                  {...tool} 
                  userPlan={plan?.plan || 'free'}
                  isProfessionalUser={isProfessionalUser}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...tools].sort((a, b) => b.downloads - a.downloads).map(tool => (
                <GISToolCard 
                  key={tool.id} 
                  {...tool} 
                  userPlan={plan?.plan || 'free'}
                  isProfessionalUser={isProfessionalUser}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...tools].reverse().map(tool => (
                <GISToolCard 
                  key={tool.id} 
                  {...tool} 
                  userPlan={plan?.plan || 'free'}
                  isProfessionalUser={isProfessionalUser}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredTools.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all tools.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceFilter("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default GISMarketplace;
