
import { useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GISToolCard from "../components/marketplace/GISToolCard";
import { Plus, Search, Filter, TrendingUp, Package, Users, CheckCircle, WifiOff, FileText, Database } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

const GISMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const { plan } = useUserStats();
  
  // Check if user has professional access
  const isProfessionalUser = plan?.plan === 'professional' || plan?.subscription_tier === 'pro' || plan?.subscription_tier === 'enterprise';

  // Updated tools with standardized pricing at $14.99 USD - removed placeholder URLs
  const tools = [
    {
      id: "1",
      title: "Advanced Spatial Analysis Toolkit",
      description: "Complete toolkit for advanced spatial analysis including clustering, hotspot analysis, and network analysis tools. Includes Python scripts, QGIS plugins, and sample datasets.",
      category: "Analysis",
      price: 14.99,
      priceINR: 1249,
      downloads: 1245,
      rating: 4.8,
      author: "GeoSpatial Pro",
      downloadUrl: "", // Secure download handled by edge function
      isFeatured: true,
      programmingLanguage: "Python",
      compatibleSoftware: ["QGIS", "ArcGIS", "PostGIS"],
      isQGISCompatible: true,
      isOfflineCapable: true,
      includesSampleData: true,
      includesDocumentation: true,
      fileSize: "45.2 MB",
      lastUpdated: "2024-01-15",
      toolContents: ["Python scripts for spatial clustering", "QGIS processing algorithms", "Sample urban datasets", "Comprehensive documentation"],
      requirements: "QGIS 3.0+, Python 3.7+",
      license: "Commercial"
    },
    {
      id: "2", 
      title: "Land Use Classification Scripts",
      description: "Machine learning scripts for automated land use classification from satellite imagery. Works offline with any GIS software and includes pre-trained models.",
      category: "Machine Learning",
      price: 14.99,
      priceINR: 1249,
      downloads: 3421,
      rating: 4.6,
      author: "Dr. Sarah Chen",
      downloadUrl: "", // Secure download handled by edge function
      programmingLanguage: "Python",
      compatibleSoftware: ["QGIS", "R Studio", "Google Earth Engine"],
      isQGISCompatible: true,
      isOfflineCapable: true,
      includesSampleData: true,
      includesDocumentation: true,
      fileSize: "67.8 MB",
      lastUpdated: "2024-01-10",
      toolContents: ["Pre-trained ML models", "Classification scripts", "Satellite imagery samples", "Training notebooks"],
      requirements: "Python 3.8+, scikit-learn, GDAL",
      license: "Commercial"
    },
    {
      id: "3",
      title: "Web Mapping Dashboard Template",
      description: "Complete responsive web mapping dashboard template with admin panel and user management. QGIS-compatible data processing scripts included.",
      category: "Web Development",
      price: 14.99,
      priceINR: 1249,
      downloads: 892,
      rating: 4.9,
      author: "WebGIS Solutions",
      downloadUrl: "", // Secure download handled by edge function
      programmingLanguage: "JavaScript",
      compatibleSoftware: ["QGIS", "Leaflet", "Mapbox", "OpenLayers"],
      isQGISCompatible: true,
      isOfflineCapable: false,
      includesSampleData: true,
      includesDocumentation: true,
      fileSize: "23.4 MB",
      lastUpdated: "2024-01-20",
      toolContents: ["React dashboard template", "Node.js backend", "QGIS processing scripts", "Setup documentation"],
      requirements: "Node.js 16+, QGIS 3.0+",
      license: "Commercial"
    },
    {
      id: "4",
      title: "DEM Processing Utilities",
      description: "Comprehensive set of tools for Digital Elevation Model processing and terrain analysis. Fully compatible with QGIS and works offline.",
      category: "Data Processing",
      price: 14.99,
      priceINR: 1249,
      downloads: 687,
      rating: 4.4,
      author: "TerrainTech",
      downloadUrl: "", // Secure download handled by edge function
      programmingLanguage: "Python",
      compatibleSoftware: ["QGIS", "GDAL", "ArcGIS"],
      isQGISCompatible: true,
      isOfflineCapable: true,
      includesSampleData: true,
      includesDocumentation: true,
      fileSize: "34.7 MB",
      lastUpdated: "2024-01-12",
      toolContents: ["Terrain analysis scripts", "QGIS plugins", "Sample DEM data", "Processing workflows"],
      requirements: "QGIS 3.0+, GDAL, NumPy",
      license: "Commercial"
    },
    {
      id: "5",
      title: "Remote Sensing Image Analysis Suite",
      description: "Complete suite for satellite image analysis, band math, and vegetation indices calculation. Optimized for QGIS workflow.",
      category: "Remote Sensing",
      price: 14.99,
      priceINR: 1249,
      downloads: 1876,
      rating: 4.7,
      author: "RemoteSense Pro",
      downloadUrl: "", // Secure download handled by edge function
      programmingLanguage: "Python",
      compatibleSoftware: ["QGIS", "SNAP", "ENVI"],
      isQGISCompatible: true,
      isOfflineCapable: true,
      includesSampleData: true,
      includesDocumentation: true,
      fileSize: "89.3 MB",
      lastUpdated: "2024-01-18",
      toolContents: ["NDVI/NDWI calculators", "Image enhancement tools", "Landsat/Sentinel samples", "Analysis workflows"],
      requirements: "QGIS 3.0+, Python 3.8+, rasterio",
      license: "Commercial"
    },
    {
      id: "6",
      title: "Hydrological Modeling Toolkit",
      description: "Advanced tools for watershed analysis, flow accumulation, and flood modeling. Includes QGIS processing scripts and sample watersheds.",
      category: "Hydrology",
      price: 14.99,
      priceINR: 1249,
      downloads: 543,
      rating: 4.5,
      author: "HydroGIS Labs",
      downloadUrl: "", // Secure download handled by edge function
      programmingLanguage: "Python",
      compatibleSoftware: ["QGIS", "GRASS GIS", "HEC-RAS"],
      isQGISCompatible: true,
      isOfflineCapable: true,
      includesSampleData: true,
      includesDocumentation: true,
      fileSize: "56.1 MB",
      lastUpdated: "2024-01-08",
      toolContents: ["Watershed delineation tools", "Flow modeling scripts", "Sample watershed data", "Flood analysis tutorials"],
      requirements: "QGIS 3.0+, GRASS GIS, SciPy",
      license: "Commercial"
    }
  ];

  const categories = ["Analysis", "Machine Learning", "Web Development", "Data Processing", "Remote Sensing", "Hydrology", "Visualization"];
  
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

        {/* Quality Assurance Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Quality Assured GIS Tools</h3>
                <p className="text-green-700">All tools are tested and verified for global compatibility</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>✅ QGIS Compatible</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <WifiOff className="h-4 w-4" />
                <span>Offline Capable</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FileText className="h-4 w-4" />
                <span>Full Documentation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Database className="h-4 w-4" />
                <span>Sample Data Included</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Global Pricing:</strong> All tools available at $14.99 USD (₹1,249 INR) with instant download access
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="browse" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="browse">Browse All</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="qgis">QGIS Tools</TabsTrigger>
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

          <TabsContent value="qgis">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.filter(tool => tool.isQGISCompatible).map(tool => (
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
