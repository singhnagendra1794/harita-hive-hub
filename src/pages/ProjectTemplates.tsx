import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  Search, 
  Filter, 
  Star, 
  Users, 
  ExternalLink, 
  Code, 
  MapPin, 
  Satellite,
  TreePine,
  Building,
  Zap
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import TemplateCard from '@/components/templates/TemplateCard';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';

const ProjectTemplates = () => {
  const { user } = useAuth();
  const { templates, loading, downloadTemplate, getTemplateGuide } = useProjectTemplates();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, selectedType]);

  const filterTemplates = () => {
    let filtered = templates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    setFilteredTemplates(filtered);
  };

  const handleDownload = async (templateId: string, isPremium: boolean) => {
    if (isPremium && (!user || !user.email)) {
      toast({
        title: "Premium Template",
        description: "Please sign in to access premium templates.",
        variant: "destructive",
      });
      return;
    }

    try {
      await downloadTemplate(templateId);
      toast({
        title: "Download Started",
        description: "Your template download has begun.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewGuide = async (templateId: string) => {
    try {
      const guideUrl = await getTemplateGuide(templateId);
      // Try to open the guide, but fallback to sample if it fails
      const link = document.createElement('a');
      link.href = guideUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      link.onerror = () => {
        // Import the downloadSampleGuide function and use it as fallback
        import('@/utils/createSampleGuide').then(({ downloadSampleGuide }) => {
          const template = templates.find(t => t.id === templateId);
          if (template) {
            downloadSampleGuide(template.id, template.title);
          }
        });
      };
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Fallback to downloadable sample guide
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const { downloadSampleGuide } = await import('@/utils/createSampleGuide');
        downloadSampleGuide(template.id, template.title);
      }
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'remote-sensing', label: 'Remote Sensing' },
    { value: 'urban-planning', label: 'Urban Planning' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'web-mapping', label: 'Web Mapping' },
    { value: 'analysis', label: 'Spatial Analysis' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'python', label: 'Python-based' },
    { value: 'qgis', label: 'QGIS Project' },
    { value: 'web', label: 'Web Application' },
    { value: 'notebook', label: 'Jupyter Notebook' },
    { value: 'dashboard', label: 'Dashboard' }
  ];

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Project Templates
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Download ready-to-use geospatial projects with step-by-step guides, sample data, and complete implementations
        </p>
        
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <Badge variant="outline" className="text-sm">
            <Download className="h-3 w-3 mr-1" />
            Instant Download
          </Badge>
          <Badge variant="outline" className="text-sm">
            <FileText className="h-3 w-3 mr-1" />
            Step-by-Step Guides
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Code className="h-3 w-3 mr-1" />
            Complete Source Code
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            Portfolio Ready
          </Badge>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
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
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
          
          {(!user || !user.email) && (
            <Badge variant="outline" className="text-primary border-primary">
              <Zap className="h-3 w-3 mr-1" />
              Sign in for Premium Templates
            </Badge>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDownload={() => handleDownload(template.id, template.isPremium)}
              onViewGuide={() => handleViewGuide(template.id)}
              userHasAccess={user ? true : !template.isPremium}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Templates will be available soon!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA for Free Users */}
      {(!user || !user.email) && (
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Unlock All Premium Templates</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get access to advanced projects, complete datasets, and professional-grade templates
                used by industry experts and top students worldwide.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg">
                  <Star className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplates;