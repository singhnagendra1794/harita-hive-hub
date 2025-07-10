
import { useState } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Plus, Star, TrendingUp } from "lucide-react";
import PluginCard from "../components/marketplace/PluginCard";
import PluginUploadForm from "../components/marketplace/PluginUploadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PluginMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("all");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Mock data - replace with real data from your backend
  const plugins = [
    {
      id: "1",
      title: "Advanced Buffer Tool",
      description: "Create complex buffers with varying distances and custom shapes for advanced spatial analysis.",
      category: "QGIS Plugin",
      tech_stack: ["Python", "QGIS", "PyQt"],
      download_count: 1250,
      rating: 4.8,
      author: "GIS Developer",
      download_url: "https://example.com/download/buffer-tool.zip",
      github_url: "https://github.com/example/buffer-tool",
      is_featured: true,
      created_at: "2024-01-15"
    },
    {
      id: "2",
      title: "Leaflet Heatmap Widget",
      description: "Interactive heatmap visualization component for web mapping applications.",
      category: "JavaScript Widget",
      tech_stack: ["JavaScript", "Leaflet", "D3.js"],
      download_count: 850,
      rating: 4.6,
      author: "WebGIS Pro",
      download_url: "https://example.com/download/heatmap-widget.zip",
      github_url: "https://github.com/example/heatmap-widget",
      is_featured: false,
      created_at: "2024-02-01"
    },
    {
      id: "3",
      title: "Satellite Image Classifier",
      description: "Python script for automated land cover classification using machine learning.",
      category: "Python Script",
      tech_stack: ["Python", "scikit-learn", "GDAL", "NumPy"],
      download_count: 2100,
      rating: 4.9,
      author: "ML Geospatial",
      download_url: "https://example.com/download/classifier.py",
      github_url: "https://github.com/example/satellite-classifier",
      is_featured: true,
      created_at: "2024-01-20"
    }
  ];

  const categories = ["all", "QGIS Plugin", "Python Script", "JavaScript Widget", "ArcGIS Tool", "Web Component"];
  const techStack = ["all", "Python", "JavaScript", "QGIS", "ArcGIS", "Leaflet", "OpenLayers"];

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    const matchesTech = selectedTech === "all" || plugin.tech_stack.includes(selectedTech);
    
    return matchesSearch && matchesCategory && matchesTech;
  });

  const featuredPlugins = plugins.filter(p => p.is_featured);
  const totalDownloads = plugins.reduce((sum, p) => sum + p.download_count, 0);

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Plugin Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover, download, and share powerful GIS tools created by the community.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{plugins.length}</div>
                <div className="text-sm text-muted-foreground">Total Plugins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalDownloads.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Submit Your Plugin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Plugin</DialogTitle>
              </DialogHeader>
              <PluginUploadForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search plugins..."
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
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Technology" />
              </SelectTrigger>
              <SelectContent>
                {techStack.map(tech => (
                  <SelectItem key={tech} value={tech}>
                    {tech === "all" ? "All Technologies" : tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("all")}>×</button>
              </Badge>
            )}
            {selectedTech !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedTech}
                <button onClick={() => setSelectedTech("all")}>×</button>
              </Badge>
            )}
          </div>
        </div>

        {/* Featured Plugins */}
        {featuredPlugins.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Plugins</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPlugins.map(plugin => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </div>
          </div>
        )}

        {/* All Plugins */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Plugins ({filteredPlugins.length})</h2>
            <Select defaultValue="popular">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPlugins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map(plugin => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No plugins found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PluginMarketplace;
