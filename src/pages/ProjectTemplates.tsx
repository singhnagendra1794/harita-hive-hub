import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedProjectTemplate } from "@/components/project-templates/EnhancedProjectTemplate";
import { TemplateFilters } from "@/components/project-templates/TemplateFilters";
import { TemplateUploadForm } from "@/components/project-templates/TemplateUploadForm";
import { sampleProjectTemplates, sampleCollections } from "@/data/sampleProjectTemplates";
import { 
  FolderOpen, 
  Star, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ProjectTemplates = () => {
  const [filters, setFilters] = useState({
    search: '',
    sectors: [],
    tools: [],
    skillLevels: [],
    tags: [],
    status: []
  });
  const [sortBy, setSortBy] = useState('featured');
  const [templates] = useState(sampleProjectTemplates);
  const [downloadingTemplates, setDownloadingTemplates] = useState(new Set());
  const [userRatings, setUserRatings] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Filter and sort templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !filters.search || 
      template.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesSector = filters.sectors.length === 0 || filters.sectors.includes(template.sector);
    const matchesTools = filters.tools.length === 0 || filters.tools.some(tool => template.tools_required.includes(tool));
    const matchesSkillLevel = filters.skillLevels.length === 0 || filters.skillLevels.includes(template.skill_level);
    const matchesTags = filters.tags.length === 0 || filters.tags.some(tag => template.tags.includes(tag));
    const matchesStatus = filters.status.length === 0 ||
      (filters.status.includes('featured') && template.is_featured) ||
      (filters.status.includes('verified') && template.is_verified) ||
      (filters.status.includes('recent') && new Date(template.created_at) > new Date(Date.now() - 30*24*60*60*1000));

    return matchesSearch && matchesSector && matchesTools && matchesSkillLevel && matchesTags && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'featured': return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      case 'popular': return b.download_count - a.download_count;
      case 'rating': return b.rating_average - a.rating_average;
      case 'recent': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return 0;
    }
  });

  const handleDownload = async (templateId: string, downloadType: string) => {
    setDownloadingTemplates(prev => new Set([...prev, templateId]));
    
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDownloadingTemplates(prev => {
      const newSet = new Set(prev);
      newSet.delete(templateId);
      return newSet;
    });

    toast({
      title: "Download started",
      description: "Template files are being prepared for download",
    });
  };

  const handleRate = (templateId: string, rating: number) => {
    setUserRatings(prev => ({ ...prev, [templateId]: rating }));
    toast({
      title: "Rating submitted",
      description: "Thank you for your feedback!",
    });
  };

  const handleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
        toast({ title: "Removed from favorites" });
      } else {
        newSet.add(templateId);
        toast({ title: "Added to favorites" });
      }
      return newSet;
    });
  };

  const handleUpload = async (templateData: any) => {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Template submitted",
      description: "Your template has been submitted for review. We'll notify you once it's approved.",
    });
  };

  // Generate filter options from data
  const availableSectors = Array.from(new Set(templates.map(t => t.sector))).map(sector => ({
    value: sector,
    label: sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: templates.filter(t => t.sector === sector).length,
    icon: "🌍"
  }));

  const availableTools = Array.from(new Set(templates.flatMap(t => t.tools_required))).map(tool => ({
    value: tool,
    label: tool.toUpperCase(),
    count: templates.filter(t => t.tools_required.includes(tool)).length
  }));

  const availableSkillLevels = ['beginner', 'intermediate', 'advanced', 'expert'].map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1),
    count: templates.filter(t => t.skill_level === level).length
  }));

  const availableTags = Array.from(new Set(templates.flatMap(t => t.tags)))
    .map(tag => ({
      value: tag,
      label: tag,
      count: templates.filter(t => t.tags.includes(tag)).length
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FolderOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Project Templates</h1>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Production-ready, sector-specific geospatial project templates for consultants, students, and enterprise GIS teams
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              All templates tested & verified
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Enterprise ready
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {templates.length} curated templates
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community driven
            </div>
          </div>

          {/* Upload CTA */}
          <div className="flex items-center justify-center gap-4">
            <TemplateUploadForm onUpload={handleUpload} />
            <Button variant="outline" asChild>
              <a href="/contact">Request Custom Template</a>
            </Button>
          </div>
        </div>

        {/* Featured Collections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleCollections.filter(c => c.is_featured).map(collection => (
              <Card key={collection.id} className="group hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {collection.name}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{collection.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{collection.template_ids.length} templates</Badge>
                    <Badge variant="outline">Curated</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TemplateFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableSectors={availableSectors}
              availableTools={availableTools}
              availableSkillLevels={availableSkillLevels}
              availableTags={availableTags}
              totalResults={filteredTemplates.length}
            />
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {filteredTemplates.length} Template{filteredTemplates.length !== 1 ? 's' : ''} Found
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { key: 'featured', label: 'Featured' },
                    { key: 'popular', label: 'Popular' },
                    { key: 'rating', label: 'Rating' },
                    { key: 'recent', label: 'Recent' }
                  ].map(option => (
                    <Button
                      key={option.key}
                      variant={sortBy === option.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy(option.key)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates List */}
            <div className="space-y-8">
              {filteredTemplates.map(template => (
                <EnhancedProjectTemplate
                  key={template.id}
                  template={template}
                  onDownload={handleDownload}
                  onRate={handleRate}
                  onFavorite={handleFavorite}
                  isDownloading={downloadingTemplates.has(template.id)}
                  userRating={userRatings[template.id]}
                  isFavorited={favorites.has(template.id)}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={() => setFilters({
                  search: '', sectors: [], tools: [], skillLevels: [], tags: [], status: []
                })}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplates;