import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Play, Star, Search, Filter, Package, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import UpgradePrompt from '@/components/premium/UpgradePrompt';


interface ToolkitCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Toolkit {
  id: string;
  title: string;
  description: string;
  category_id: string;
  download_url: string;
  demo_video_url: string;
  sample_project_url: string;
  tags: string[];
  license_type: string;
  rating: number;
  download_count: number;
  is_featured: boolean;
  created_by: string;
}

const Toolkits = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [categories, setCategories] = useState<ToolkitCategory[]>([]);
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [filteredToolkits, setFilteredToolkits] = useState<Toolkit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const hasProAccess = hasAccess('pro');
  const hasEnterpriseAccess = hasAccess('enterprise');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterToolkits();
  }, [toolkits, searchTerm, selectedCategory]);

  const fetchData = async () => {
    try {
      // Mock data with real download URLs for now since we don't have a backend
      const mockCategories: ToolkitCategory[] = [
        { id: 'processing', name: 'Data Processing', description: 'Tools for data cleaning, transformation, and analysis', icon: '⚙️' },
        { id: 'visualization', name: 'Visualization', description: 'Mapping and visualization tools', icon: '📊' },
        { id: 'analysis', name: 'Spatial Analysis', description: 'Advanced spatial analysis tools', icon: '🧠' },
        { id: 'automation', name: 'Automation', description: 'Workflow automation and scripting', icon: '🔄' },
        { id: 'web', name: 'Web GIS', description: 'Web mapping and web GIS development', icon: '🌐' }
      ];

      const mockToolkits: Toolkit[] = [
        {
          id: '1',
          title: 'QGIS Buffer and Heatmap Combo Tool',
          description: 'Combines buffer analysis with heatmap generation for comprehensive spatial analysis',
          category_id: 'analysis',
          download_url: '/downloads/buffer-heatmap-combo.zip',
          demo_video_url: 'https://youtube.com/watch?v=demo1',
          sample_project_url: '/downloads/buffer-heatmap-combo.zip',
          tags: ['QGIS', 'Buffer', 'Heatmap', 'Analysis'],
          license_type: 'MIT',
          rating: 4.8,
          download_count: 1247,
          is_featured: true,
          created_by: 'Harita Hive Team'
        },
        {
          id: '2',
          title: 'Coordinate Transformer Pro',
          description: 'Advanced coordinate system transformation tool with batch processing',
          category_id: 'processing',
          download_url: '/downloads/coordinate-transformer.py',
          demo_video_url: 'https://youtube.com/watch?v=demo2',
          sample_project_url: '/downloads/coordinate-transformer.py',
          tags: ['Python', 'Coordinates', 'CRS', 'Transformation'],
          license_type: 'GPL-3.0',
          rating: 4.6,
          download_count: 892,
          is_featured: true,
          created_by: 'GeoSpatial Solutions'
        },
        {
          id: '3',
          title: 'GeoJSON Editor Suite',
          description: 'Complete toolkit for editing, validating, and optimizing GeoJSON files',
          category_id: 'processing',
          download_url: '/downloads/geojson-editor.zip',
          demo_video_url: 'https://youtube.com/watch?v=demo3',
          sample_project_url: '/downloads/geojson-editor.zip',
          tags: ['GeoJSON', 'Editor', 'Validation', 'Web'],
          license_type: 'Apache-2.0',
          rating: 4.9,
          download_count: 2103,
          is_featured: true,
          created_by: 'OpenGIS Community'
        },
        {
          id: '4',
          title: 'Mapbox Clustering Algorithm',
          description: 'Efficient point clustering for web maps with custom styling options',
          category_id: 'web',
          download_url: '/downloads/mapbox-clustering.js',
          demo_video_url: 'https://youtube.com/watch?v=demo4',
          sample_project_url: '/downloads/mapbox-clustering.js',
          tags: ['Mapbox', 'Clustering', 'JavaScript', 'WebGL'],
          license_type: 'MIT',
          rating: 4.7,
          download_count: 1534,
          is_featured: true,
          created_by: 'Web Mapping Pro'
        },
        {
          id: '5',
          title: 'NDVI Analysis Toolkit',
          description: 'Complete NDVI calculation and analysis suite for vegetation monitoring',
          category_id: 'analysis',
          download_url: '/downloads/ndvi-analysis.qgz',
          demo_video_url: 'https://youtube.com/watch?v=demo5',
          sample_project_url: '/downloads/ndvi-analysis.qgz',
          tags: ['NDVI', 'Vegetation', 'Remote Sensing', 'QGIS'],
          license_type: 'CC-BY-4.0',
          rating: 4.5,
          download_count: 768,
          is_featured: false,
          created_by: 'Remote Sensing Lab'
        },
        {
          id: '6',
          title: 'Polygon Simplification Tool',
          description: 'Optimize polygon geometries while preserving important features',
          category_id: 'processing',
          download_url: '/downloads/polygon-simplifier.py',
          demo_video_url: 'https://youtube.com/watch?v=demo6',
          sample_project_url: '/downloads/polygon-simplifier.py',
          tags: ['Python', 'Polygons', 'Optimization', 'Geometry'],
          license_type: 'BSD-3-Clause',
          rating: 4.4,
          download_count: 623,
          is_featured: false,
          created_by: 'Geometry Solutions'
        }
      ];

      setCategories(mockCategories);
      setToolkits(mockToolkits);
      setLoading(false);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('toolkit_categories')
        .select('*')
        .order('name');

      // Fetch toolkits
      const { data: toolkitsData } = await supabase
        .from('toolkits')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      setCategories(categoriesData || []);
      setToolkits(toolkitsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterToolkits = () => {
    let filtered = toolkits;

    if (searchTerm) {
      filtered = filtered.filter(toolkit =>
        toolkit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toolkit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toolkit.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(toolkit => toolkit.category_id === selectedCategory);
    }

    setFilteredToolkits(filtered);
  };

  const handleDownload = async (toolkit: Toolkit) => {
    if (!hasProAccess && !toolkit.is_featured) {
      return;
    }

    // Increment download count
    await supabase
      .from('toolkits')
      .update({ download_count: toolkit.download_count + 1 })
      .eq('id', toolkit.id);

    // Open download link
    if (toolkit.download_url) {
      window.open(toolkit.download_url, '_blank');
    }

    // Refresh data
    fetchData();
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📦';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'General';
  };

  // Show limited preview for free users
  const displayedToolkits = hasProAccess ? filteredToolkits : filteredToolkits.filter(t => t.is_featured).slice(0, 6);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          Geospatial Toolkits Hub
        </h1>
        <p className="text-muted-foreground">
          Production-ready tools, templates, and plugins for every geospatial domain
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search toolkits, tags, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {toolkits.filter(t => t.category_id === category.id).length} tools
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolkits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedToolkits.map((toolkit) => (
          <Card key={toolkit.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(toolkit.category_id)}</span>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(toolkit.category_id)}
                  </Badge>
                  {toolkit.is_featured && (
                    <Badge className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {toolkit.license_type}
                </Badge>
              </div>
              <CardTitle className="text-lg">{toolkit.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {toolkit.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-4">
                {toolkit.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {toolkit.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{toolkit.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{toolkit.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {toolkit.download_count} downloads
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(toolkit)}
                  disabled={!hasProAccess && !toolkit.is_featured}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                
                {toolkit.demo_video_url && (
                  <Button size="sm" variant="outline" className="text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Demo
                  </Button>
                )}
                
                {toolkit.sample_project_url && (
                  <Button size="sm" variant="outline" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Sample
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upgrade Prompt for Free Users */}
      {!hasProAccess && (
        <UpgradePrompt 
          feature="Full Toolkits Access"
          description="Unlock access to all premium toolkits, templates, and the ability to submit your own tools to the community."
        />
      )}

      {/* Upload Section for Enterprise Users */}
      {hasEnterpriseAccess && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contribute Your Tools</CardTitle>
            <CardDescription>
              Share your geospatial tools and templates with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Upload Toolkit
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
  );
};

export default Toolkits;