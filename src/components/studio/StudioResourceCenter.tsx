import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Image, 
  Code, 
  Film, 
  BookOpen, 
  Search,
  ExternalLink,
  Star,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'template' | 'guide' | 'asset' | 'script' | 'sample-data';
  format: string;
  size: string;
  downloads: number;
  rating: number;
  author: string;
  date: string;
  tags: string[];
  downloadUrl: string;
  previewUrl?: string;
}

export const StudioResourceCenter: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Screen Recording Overlay Template',
      description: 'Professional overlay template for GIS tutorials with branding elements',
      category: 'templates',
      type: 'template',
      format: 'PSD/PNG',
      size: '15 MB',
      downloads: 2456,
      rating: 4.8,
      author: 'HaritaHive Design Team',
      date: '2024-01-15',
      tags: ['overlay', 'branding', 'tutorial'],
      downloadUrl: '/downloads/screen-recording-overlay.zip'
    },
    {
      id: '2',
      title: 'Map Walkthrough Script Template',
      description: 'Structured template for planning interactive map presentations',
      category: 'guides',
      type: 'guide',
      format: 'DOCX',
      size: '2 MB',
      downloads: 1834,
      rating: 4.6,
      author: 'Dr. Sarah Chen',
      date: '2024-01-10',
      tags: ['planning', 'presentation', 'script'],
      downloadUrl: '/downloads/map-walkthrough-template.docx'
    },
    {
      id: '3',
      title: 'Before-After Analysis JSON Template',
      description: 'Ready-to-use configuration for temporal analysis projects',
      category: 'scripts',
      type: 'script',
      format: 'JSON',
      size: '500 KB',
      downloads: 967,
      rating: 4.9,
      author: 'GeoAnalytics Lab',
      date: '2024-01-08',
      tags: ['analysis', 'temporal', 'configuration'],
      downloadUrl: '/downloads/before-after-template.json'
    },
    {
      id: '4',
      title: 'Video Editing Guide for GIS Content',
      description: 'Complete guide for editing and enhancing geospatial video content',
      category: 'guides',
      type: 'guide',
      format: 'PDF',
      size: '8 MB',
      downloads: 3421,
      rating: 4.7,
      author: 'Video Production Team',
      date: '2024-01-05',
      tags: ['editing', 'video', 'tutorial'],
      downloadUrl: '/downloads/video-editing-guide.pdf'
    },
    {
      id: '5',
      title: 'Case Study Submission Template',
      description: 'Professional format for documenting and sharing GIS projects',
      category: 'templates',
      type: 'template',
      format: 'DOCX',
      size: '3 MB',
      downloads: 1567,
      rating: 4.5,
      author: 'Academic Relations',
      date: '2024-01-03',
      tags: ['case-study', 'documentation', 'academic'],
      downloadUrl: '/downloads/case-study-template.docx'
    },
    {
      id: '6',
      title: 'Portfolio Setup Masterclass',
      description: 'Step-by-step guide to creating a professional GIS portfolio',
      category: 'guides',
      type: 'guide',
      format: 'PDF',
      size: '12 MB',
      downloads: 4523,
      rating: 4.9,
      author: 'Career Development Team',
      date: '2024-01-01',
      tags: ['portfolio', 'career', 'professional'],
      downloadUrl: '/downloads/portfolio-masterclass.pdf'
    },
    {
      id: '7',
      title: 'Sample Geospatial Datasets',
      description: 'Curated collection of sample data for learning and testing',
      category: 'data',
      type: 'sample-data',
      format: 'Multiple',
      size: '45 MB',
      downloads: 5672,
      rating: 4.8,
      author: 'Data Curation Team',
      date: '2023-12-28',
      tags: ['sample-data', 'learning', 'testing'],
      downloadUrl: '/downloads/sample-datasets.zip'
    },
    {
      id: '8',
      title: 'Interactive Map Icons Pack',
      description: 'Professional icon set for web maps and presentations',
      category: 'assets',
      type: 'asset',
      format: 'SVG/PNG',
      size: '25 MB',
      downloads: 3245,
      rating: 4.6,
      author: 'Design Studio',
      date: '2023-12-25',
      tags: ['icons', 'design', 'maps'],
      downloadUrl: '/downloads/map-icons-pack.zip'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: resources.length },
    { id: 'templates', name: 'Templates', count: resources.filter(r => r.category === 'templates').length },
    { id: 'guides', name: 'Guides & Tutorials', count: resources.filter(r => r.category === 'guides').length },
    { id: 'scripts', name: 'Scripts & Code', count: resources.filter(r => r.category === 'scripts').length },
    { id: 'assets', name: 'Design Assets', count: resources.filter(r => r.category === 'assets').length },
    { id: 'data', name: 'Sample Data', count: resources.filter(r => r.category === 'data').length }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (resource: Resource) => {
    toast({
      title: "Download Started",
      description: `Downloading ${resource.title}...`,
    });

    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${resource.title} has been downloaded successfully!`,
      });
    }, 1500);
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'template': return FileText;
      case 'guide': return BookOpen;
      case 'asset': return Image;
      case 'script': return Code;
      case 'sample-data': return Download;
      default: return FileText;
    }
  };

  const formatRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs">{rating}</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Studio Resource Center</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access professional templates, guides, and assets to enhance your geospatial content creation
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <TypeIcon className="h-8 w-8 text-primary" />
                      {formatRating(resource.rating)}
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {resource.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {resource.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        <Badge variant="outline">{resource.format}</Badge>
                        <Badge variant="outline">{resource.size}</Badge>
                      </div>
                      <span className="text-muted-foreground">
                        {resource.downloads.toLocaleString()} downloads
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleDownload(resource)}
                        className="flex-1"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {resource.previewUrl && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search terms or browse different categories
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Featured Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Collection: Getting Started Kit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <p className="text-muted-foreground mb-4">
                Everything you need to start creating professional geospatial content. 
                Includes templates, guides, sample data, and design assets.
              </p>
              <div className="flex gap-2">
                <Badge>15 Items</Badge>
                <Badge>125 MB</Badge>
                <Badge>Beginner Friendly</Badge>
              </div>
            </div>
            <Button size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download Complete Kit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};