import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToolkitCard from "@/components/toolkits/ToolkitCard";
import AIToolkitEngine from "@/components/toolkits/AIToolkitEngine";
import { 
  Search, 
  Plus, 
  Wrench, 
  TrendingUp,
  Target,
  Zap,
  Building,
  Sprout,
  TreePine,
  MapPin,
  Truck,
  Shield,
  Radio,
  Heart,
  Home,
  Pickaxe,
  Waves,
  Sun,
  Droplets,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Sector definitions with icons and colors
const sectors = [
  {
    id: 'urban-planning',
    name: 'Urban Planning',
    icon: Building,
    color: 'bg-blue-50 border-blue-200',
    description: 'City planning, zoning, and smart city solutions'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Sprout,
    color: 'bg-green-50 border-green-200',
    description: 'Precision farming, crop monitoring, and field management'
  },
  {
    id: 'forestry',
    name: 'Forestry & Environment',
    icon: TreePine,
    color: 'bg-emerald-50 border-emerald-200',
    description: 'Forest monitoring, conservation, and environmental analysis'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & Utilities',
    icon: MapPin,
    color: 'bg-gray-50 border-gray-200',
    description: 'Infrastructure mapping, utility networks, and asset management'
  },
  {
    id: 'transportation',
    name: 'Transportation & Logistics',
    icon: Truck,
    color: 'bg-orange-50 border-orange-200',
    description: 'Route optimization, fleet management, and logistics planning'
  },
  {
    id: 'disaster',
    name: 'Disaster Management',
    icon: Shield,
    color: 'bg-red-50 border-red-200',
    description: 'Emergency response, risk assessment, and disaster preparedness'
  },
  {
    id: 'telecom',
    name: 'Telecom',
    icon: Radio,
    color: 'bg-purple-50 border-purple-200',
    description: 'Network planning, coverage analysis, and site optimization'
  },
  {
    id: 'health',
    name: 'Health & Epidemiology',
    icon: Heart,
    color: 'bg-pink-50 border-pink-200',
    description: 'Disease mapping, health facility planning, and epidemiological studies'
  },
  {
    id: 'real-estate',
    name: 'Real Estate & Land Use',
    icon: Home,
    color: 'bg-indigo-50 border-indigo-200',
    description: 'Property valuation, land use analysis, and market research'
  },
  {
    id: 'mining',
    name: 'Mining & Geology',
    icon: Pickaxe,
    color: 'bg-amber-50 border-amber-200',
    description: 'Geological surveys, mineral exploration, and mining operations'
  },
  {
    id: 'marine',
    name: 'Marine & Coastal',
    icon: Waves,
    color: 'bg-cyan-50 border-cyan-200',
    description: 'Coastal monitoring, marine conservation, and oceanographic analysis'
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    icon: Sun,
    color: 'bg-yellow-50 border-yellow-200',
    description: 'Solar/wind site selection, energy potential mapping'
  },
  {
    id: 'water-resources',
    name: 'Water Resources',
    icon: Droplets,
    color: 'bg-teal-50 border-teal-200',
    description: 'Watershed analysis, flood modeling, and water quality monitoring'
  }
];

// Enhanced tools data organized by sectors
const tools = [
  // Urban Planning Tools
  {
    id: 'urban-analyzer',
    name: 'Urban Growth Analyzer',
    description: 'AI-powered tool for analyzing urban expansion patterns and predicting future growth using satellite imagery',
    sector: 'urban-planning',
    type: 'internal',
    url: '/labs/urban-analyzer',
    tags: ['AI', 'Analysis', 'Prediction', 'Satellite'],
    featured: true,
    hasGuide: true,
    difficulty: 'intermediate'
  },
  {
    id: 'qgis',
    name: 'QGIS Desktop',
    description: 'Free and open-source geographic information system for comprehensive urban planning and mapping',
    sector: 'urban-planning',
    type: 'external',
    url: 'https://qgis.org',
    tags: ['Desktop GIS', 'Open Source', 'Mapping'],
    featured: true,
    hasGuide: true,
    difficulty: 'intermediate'
  },
  {
    id: 'urban-3d',
    name: '3D City Modeler',
    description: 'Create detailed 3D models of urban areas for planning and visualization purposes',
    sector: 'urban-planning',
    type: 'internal',
    url: '/labs/3d-modeler',
    tags: ['3D Modeling', 'Visualization'],
    featured: false,
    hasGuide: true,
    difficulty: 'advanced'
  },

  // Agriculture Tools
  {
    id: 'crop-classifier',
    name: 'Crop Classifier',
    description: 'Classify satellite images by crop type using NDVI & time series analysis for precision agriculture',
    sector: 'agriculture',
    type: 'internal',
    url: '/labs/crop-classifier',
    tags: ['Remote Sensing', 'Classification', 'NDVI', 'Precision Agriculture'],
    featured: true,
    hasGuide: true,
    difficulty: 'beginner'
  },
  {
    id: 'google-earth-engine',
    name: 'Google Earth Engine',
    description: 'Cloud-based platform for planetary-scale agricultural monitoring and analysis',
    sector: 'agriculture',
    type: 'external',
    url: 'https://earthengine.google.com',
    tags: ['Cloud Computing', 'Big Data', 'Monitoring'],
    featured: true,
    hasGuide: true,
    difficulty: 'advanced'
  },
  {
    id: 'farm-optimizer',
    name: 'Farm Field Optimizer',
    description: 'Optimize field boundaries and irrigation systems using topographic and soil data',
    sector: 'agriculture',
    type: 'internal',
    url: '/labs/farm-optimizer',
    tags: ['Optimization', 'Irrigation', 'Soil Analysis'],
    featured: false,
    hasGuide: true,
    difficulty: 'intermediate'
  },

  // Forestry Tools
  {
    id: 'forest-monitor',
    name: 'Forest Change Monitor',
    description: 'Real-time forest cover change detection using satellite imagery and machine learning',
    sector: 'forestry',
    type: 'internal',
    url: '/labs/forest-monitor',
    tags: ['Change Detection', 'Monitoring', 'Machine Learning'],
    featured: true,
    hasGuide: true,
    difficulty: 'advanced'
  },
  {
    id: 'carbon-calculator',
    name: 'Carbon Stock Calculator',
    description: 'Estimate forest carbon stocks and sequestration potential for climate projects',
    sector: 'forestry',
    type: 'internal',
    url: '/labs/carbon-calculator',
    tags: ['Carbon', 'Climate', 'Assessment'],
    featured: false,
    hasGuide: true,
    difficulty: 'intermediate'
  },

  // Disaster Management Tools
  {
    id: 'flood-predictor',
    name: 'Flood Risk Predictor',
    description: 'Predict flood risks using elevation models, rainfall data, and hydrological modeling',
    sector: 'disaster',
    type: 'internal',
    url: '/labs/flood-predictor',
    tags: ['Risk Assessment', 'Hydrology', 'Prediction'],
    featured: true,
    hasGuide: true,
    difficulty: 'advanced'
  },
  {
    id: 'emergency-mapper',
    name: 'Emergency Response Mapper',
    description: 'Real-time mapping tool for emergency response coordination and resource allocation',
    sector: 'disaster',
    type: 'internal',
    url: '/labs/emergency-mapper',
    tags: ['Emergency Response', 'Real-time', 'Coordination'],
    featured: false,
    hasGuide: true,
    difficulty: 'intermediate'
  },

  // Water Resources Tools
  {
    id: 'watershed-analyzer',
    name: 'Watershed Analyzer',
    description: 'Comprehensive watershed delineation and hydrological analysis tool',
    sector: 'water-resources',
    type: 'internal',
    url: '/labs/watershed-analyzer',
    tags: ['Watershed', 'Hydrology', 'Analysis'],
    featured: true,
    hasGuide: true,
    difficulty: 'intermediate'
  }
];

const Toolkits = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [bookmarkedTools, setBookmarkedTools] = useState(new Set<string>());
  const [showAIEngine, setShowAIEngine] = useState(false);

  // Filter tools based on search and sector
  const filteredTools = tools.filter(tool => {
    const matchesSearch = !search || 
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesSector = selectedSector === 'all' || tool.sector === selectedSector;
    
    return matchesSearch && matchesSector;
  });

  // Group tools by sector
  const toolsBySector = sectors.reduce((acc, sector) => {
    acc[sector.id] = filteredTools.filter(tool => tool.sector === sector.id);
    return acc;
  }, {} as Record<string, typeof tools>);

  const handleBookmark = (toolId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to bookmark tools",
        variant: "destructive"
      });
      return;
    }

    setBookmarkedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
        toast({ title: "Removed from bookmarks" });
      } else {
        newSet.add(toolId);
        toast({ title: "Added to bookmarks" });
      }
      return newSet;
    });
  };

  const handleSuggestTool = () => {
    toast({
      title: "Feature coming soon!",
      description: "Tool suggestion form will be available shortly",
    });
  };

  const featuredTools = tools.filter(tool => tool.featured);
  const totalTools = tools.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-teal-50 via-green-50 to-blue-50">
        <div className="container py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Wrench className="h-12 w-12 text-teal-600" />
                <Zap className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                Geospatial Toolkits
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
              Discover the perfect geospatial tools for your domain. Organized by key sectors, 
              from urban planning to agriculture, with everything you need to get started.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border shadow-sm">
                <Target className="h-4 w-4 text-teal-600" />
                <span className="font-medium">{sectors.length} Sectors</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border shadow-sm">
                <Wrench className="h-4 w-4 text-green-600" />
                <span className="font-medium">{totalTools} Tools</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border shadow-sm">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{featuredTools.length} Featured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* AI Engine Toggle */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAIEngine(!showAIEngine)}
            size="lg"
            variant={showAIEngine ? "default" : "outline"}
            className="w-full md:w-auto"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {showAIEngine ? 'Browse All Tools' : 'AI-Powered Toolkit Generator'}
          </Button>
        </div>

        {/* AI Toolkit Engine */}
        {showAIEngine && (
          <div className="mb-8">
            <AIToolkitEngine />
          </div>
        )}

        {/* Search and Actions */}
        {!showAIEngine && (
          <>
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools, sectors, or use cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSuggestTool}>
                  <Plus className="h-4 w-4 mr-2" />
                  Suggest Tool
                </Button>
              </div>
            </div>

            {/* Sector Tabs */}
            <Tabs value={selectedSector} onValueChange={setSelectedSector} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
            <TabsTrigger value="all" className="text-xs">All Sectors</TabsTrigger>
            {sectors.slice(0, 6).map(sector => (
              <TabsTrigger key={sector.id} value={sector.id} className="text-xs">
                {sector.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-12">
              {sectors.map(sector => {
                const sectorTools = toolsBySector[sector.id];
                const Icon = sector.icon;
                
                if (sectorTools.length === 0) return null;
                
                return (
                  <section key={sector.id} className="space-y-6">
                    <div className={`p-6 rounded-xl ${sector.color}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">{sector.name}</h2>
                        <Badge variant="secondary">{sectorTools.length} tools</Badge>
                      </div>
                      <p className="text-muted-foreground">{sector.description}</p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {sectorTools.map(tool => (
                        <ToolkitCard
                          key={tool.id}
                          tool={tool}
                          onBookmark={handleBookmark}
                          isBookmarked={bookmarkedTools.has(tool.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </TabsContent>

          {sectors.map(sector => (
            <TabsContent key={sector.id} value={sector.id}>
              <div className="space-y-6">
                <div className={`p-8 rounded-xl ${sector.color}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <sector.icon className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold">{sector.name}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">{sector.description}</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {toolsBySector[sector.id].map(tool => (
                    <ToolkitCard
                      key={tool.id}
                      tool={tool}
                      onBookmark={handleBookmark}
                      isBookmarked={bookmarkedTools.has(tool.id)}
                    />
                  ))}
                </div>
                
                {toolsBySector[sector.id].length === 0 && (
                  <div className="text-center py-12">
                    <sector.icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolkits;