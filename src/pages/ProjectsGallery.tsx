import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Search, Filter, Eye, FileText, Code, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  difficulty_level: string;
  download_count: number;
  preview_url?: string;
  resource_url?: string;
  is_featured: boolean;
}

const ProjectsGallery = () => {
  const [projects, setProjects] = useState<ProjectTemplate[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    'Satellite Analysis',
    'Urban Planning',
    'Agricultural Monitoring',
    'Disaster Management',
    'Environmental Studies',
    'Python Scripting',
    'QGIS Workflows'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('download_count', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load project templates.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(project => project.difficulty_level === selectedDifficulty);
    }

    setFilteredProjects(filtered);
  };

  const handleDownload = async (projectId: string, resourceUrl?: string) => {
    if (!resourceUrl) {
      toast({
        title: "No Resource",
        description: "Download link not available for this project.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update download count
      await supabase.rpc('increment_download_count', { 
        template_id: projectId 
      });

      // Open download link
      window.open(resourceUrl, '_blank');

      toast({
        title: "Download Started",
        description: "Your project template download has started.",
      });
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Python') || category.includes('Script')) return <Code className="h-4 w-4" />;
    if (category.includes('QGIS')) return <MapPin className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project templates...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Geospatial Project Templates
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Download ready-to-use project templates, code samples, and workflows for your geospatial projects
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search projects, tags, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
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
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} project templates
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow animate-fade-in">
                {project.is_featured && (
                  <div className="bg-gradient-to-r from-primary to-secondary p-2">
                    <Badge variant="secondary" className="bg-white text-primary">
                      Featured
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </div>
                    <div className="ml-4">
                      {getCategoryIcon(project.category)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <Badge variant="outline" className={getDifficultyColor(project.difficulty_level)}>
                        {project.difficulty_level}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {project.download_count} downloads
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {project.preview_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.preview_url, '_blank')}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDownload(project.id, project.resource_url)}
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find more project templates.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsGallery;