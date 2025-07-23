import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Download, Play, BookOpen, 
  ExternalLink, Settings, Cpu, Layers, 
  Zap, Brain, Users, Globe
} from 'lucide-react';

// Import components
import ToolCard from '@/components/spatial-lab/ToolCard';
import ToolFilters from '@/components/spatial-lab/ToolFilters';
import ToolModal from '@/components/spatial-lab/ToolModal';
import { spatialTools } from '@/data/spatialTools';

export interface SpatialTool {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'expert' | 'sector-specific';
  sector?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  platforms: ('qgis' | 'arcgis' | 'python' | 'r' | 'web')[];
  inputTypes: string[];
  outputType: string;
  processingTime: string;
  downloadUrl?: string;
  guideUrl?: string;
  sampleDataUrl?: string;
  webToolUrl?: string;
  tags: string[];
  useCases: string[];
  parameters?: {
    name: string;
    type: 'number' | 'text' | 'select' | 'boolean';
    default: any;
    options?: string[];
    description: string;
  }[];
  codeSnippet?: {
    python?: string;
    r?: string;
    qgis?: string;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
  };
}

const SpatialAnalysisLab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<SpatialTool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTools = useMemo(() => {
    return spatialTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSector = selectedSector === 'all' || tool.sector === selectedSector;
      const matchesDifficulty = selectedDifficulty === 'all' || tool.difficulty === selectedDifficulty;
      const matchesPlatform = selectedPlatform === 'all' || tool.platforms.includes(selectedPlatform as any);
      
      return matchesSearch && matchesCategory && matchesSector && matchesDifficulty && matchesPlatform;
    });
  }, [searchTerm, selectedCategory, selectedSector, selectedDifficulty, selectedPlatform]);

  const categoryStats = {
    total: spatialTools.length,
    basic: spatialTools.filter(t => t.category === 'basic').length,
    advanced: spatialTools.filter(t => t.category === 'advanced').length,
    expert: spatialTools.filter(t => t.category === 'expert').length,
    'sector-specific': spatialTools.filter(t => t.category === 'sector-specific').length
  };

  const handleToolSelect = (tool: SpatialTool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return Layers;
      case 'advanced': return Cpu;
      case 'expert': return Brain;
      case 'sector-specific': return Users;
      default: return Globe;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      case 'sector-specific': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Zap className="h-10 w-10" />
              Spatial Analysis Lab
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Comprehensive collection of spatial analysis tools for GIS professionals, researchers, and analysts
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {Object.entries(categoryStats).map(([key, count]) => (
                <div key={key} className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm opacity-80 capitalize">{key === 'sector-specific' ? 'Sector Tools' : key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ToolFilters
                  selectedCategory={selectedCategory}
                  selectedSector={selectedSector}
                  selectedDifficulty={selectedDifficulty}
                  selectedPlatform={selectedPlatform}
                  onCategoryChange={setSelectedCategory}
                  onSectorChange={setSelectedSector}
                  onDifficultyChange={setSelectedDifficulty}
                  onPlatformChange={setSelectedPlatform}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Try in Map Playground
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Guides
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Toolkit
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="grid" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="categories">By Category</TabsTrigger>
                  <TabsTrigger value="sectors">By Sector</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  {filteredTools.length} of {spatialTools.length} tools
                </div>
              </div>

              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onSelect={handleToolSelect}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="categories">
                <div className="space-y-8">
                  {['basic', 'advanced', 'expert', 'sector-specific'].map((category) => {
                    const categoryTools = filteredTools.filter(t => t.category === category);
                    if (categoryTools.length === 0) return null;
                    
                    const Icon = getCategoryIcon(category);
                    
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-3 mb-4">
                          <Icon className="h-6 w-6" />
                          <h2 className="text-2xl font-bold capitalize">
                            {category === 'sector-specific' ? 'Sector-Specific Tools' : `${category} Tools`}
                          </h2>
                          <Badge className={getCategoryColor(category)}>
                            {categoryTools.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {categoryTools.map((tool) => (
                            <ToolCard
                              key={tool.id}
                              tool={tool}
                              onSelect={handleToolSelect}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="sectors">
                <div className="space-y-8">
                  {['urban-planning', 'agriculture', 'disaster-management', 'environment', 'telecom'].map((sector) => {
                    const sectorTools = filteredTools.filter(t => t.sector === sector);
                    if (sectorTools.length === 0) return null;
                    
                    return (
                      <div key={sector}>
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-2xl font-bold capitalize">
                            {sector.replace('-', ' ')}
                          </h2>
                          <Badge variant="outline">
                            {sectorTools.length} tools
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {sectorTools.map((tool) => (
                            <ToolCard
                              key={tool.id}
                              tool={tool}
                              onSelect={handleToolSelect}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No tools found matching your criteria</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedSector('all');
                    setSelectedDifficulty('all');
                    setSelectedPlatform('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool Details Modal */}
      <ToolModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default SpatialAnalysisLab;