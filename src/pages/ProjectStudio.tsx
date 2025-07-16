import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, Share2, Github, ExternalLink, Plus, Search, Filter, Star, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import UpgradePrompt from '@/components/premium/UpgradePrompt';

interface ProjectSubmission {
  id: string;
  title: string;
  description: string;
  tools_used: string[];
  github_url: string;
  colab_url: string;
  demo_url: string;
  is_team_project: boolean;
  team_members: any[];
  upvotes: number;
  status: string;
  thumbnail_url: string;
  created_at: string;
  user_id: string;
}

const ProjectStudio = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toolFilter, setToolFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('published');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const hasProfessionalAccess = hasAccess('pro');
  const hasEnterpriseAccess = hasAccess('enterprise');

  // New project form state
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tools_used: '',
    github_url: '',
    colab_url: '',
    demo_url: '',
    is_team_project: false,
    team_members: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, toolFilter, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('project_submissions')
        .select('*')
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

      // Transform the data to handle Json type for team_members
      const transformedData = data?.map(project => ({
        ...project,
        team_members: Array.isArray(project.team_members) 
          ? project.team_members 
          : project.team_members 
            ? [project.team_members] 
            : []
      })) || [];

      setProjects(transformedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects.filter(project => project.status === statusFilter);

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (toolFilter) {
      filtered = filtered.filter(project =>
        project.tools_used.some(tool => 
          tool.toLowerCase().includes(toolFilter.toLowerCase())
        )
      );
    }

    setFilteredProjects(filtered);
  };

  const handleVote = async (projectId: string) => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('project_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (existingVote) {
        // Remove vote
        await supabase
          .from('project_votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Add vote
        await supabase
          .from('project_votes')
          .insert({
            user_id: user.id,
            project_id: projectId,
            vote_type: 'upvote'
          });
      }

      fetchProjects();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!user || !hasProfessionalAccess) return;

    try {
      const { error } = await supabase
        .from('project_submissions')
        .insert({
          ...newProject,
          user_id: user.id,
          tools_used: newProject.tools_used.split(',').map(t => t.trim()),
          team_members: newProject.is_team_project ? 
            newProject.team_members.split(',').map(m => m.trim()) : [],
          status: 'published'
        });

      if (!error) {
        setShowCreateForm(false);
        setNewProject({
          title: '',
          description: '',
          tools_used: '',
          github_url: '',
          colab_url: '',
          demo_url: '',
          is_team_project: false,
          team_members: ''
        });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Star className="h-8 w-8 text-primary" />
              Project Launcher Studio
            </h1>
            <p className="text-muted-foreground">
              Showcase your geospatial projects and discover inspiring work from the community
            </p>
          </div>
          
          {hasProfessionalAccess && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Launch Project
            </Button>
          )}
        </div>
      </div>

      {/* Create Project Modal/Form */}
      {showCreateForm && hasProfessionalAccess && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Launch New Project</CardTitle>
            <CardDescription>
              Share your geospatial work with the community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <Input
                placeholder="Tools Used (comma-separated)"
                value={newProject.tools_used}
                onChange={(e) => setNewProject({...newProject, tools_used: e.target.value})}
              />
            </div>
            
            <Textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              rows={3}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="GitHub URL (optional)"
                value={newProject.github_url}
                onChange={(e) => setNewProject({...newProject, github_url: e.target.value})}
              />
              <Input
                placeholder="Colab/Notebook URL (optional)"
                value={newProject.colab_url}
                onChange={(e) => setNewProject({...newProject, colab_url: e.target.value})}
              />
              <Input
                placeholder="Demo URL (optional)"
                value={newProject.demo_url}
                onChange={(e) => setNewProject({...newProject, demo_url: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newProject.is_team_project}
                  onChange={(e) => setNewProject({...newProject, is_team_project: e.target.checked})}
                />
                Team Project
              </label>
              
              {newProject.is_team_project && (
                <Input
                  placeholder="Team Members (comma-separated)"
                  value={newProject.team_members}
                  onChange={(e) => setNewProject({...newProject, team_members: e.target.value})}
                  className="flex-1"
                />
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreateProject}>Launch Project</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Projects</TabsTrigger>
          <TabsTrigger value="my-projects" disabled={!hasProfessionalAccess}>
            My Projects {!hasProfessionalAccess && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filter by tool..."
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                {project.thumbnail_url && (
                  <div className="aspect-video w-full bg-muted overflow-hidden rounded-t-lg">
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                    {project.status === 'featured' && (
                      <Badge className="ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tools_used.slice(0, 3).map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                    {project.tools_used.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tools_used.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(project.id)}
                        className="text-xs"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {project.upvotes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Comments
                      </Button>
                    </div>
                    
                    {project.is_team_project && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Team
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <Button size="sm" variant="outline" className="text-xs">
                        <Github className="h-3 w-3 mr-1" />
                        Code
                      </Button>
                    )}
                    {project.demo_url && (
                      <Button size="sm" variant="outline" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Demo
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs ml-auto">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                {hasProfessionalAccess 
                  ? "Be the first to share your project with the community!"
                  : "Upgrade to Professional to start sharing your projects."
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-projects">
          {!hasProfessionalAccess ? (
            <UpgradePrompt 
              feature="Project Management"
              description="Launch and manage your geospatial projects, collaborate with teams, and showcase your work to the community."
            />
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your Projects</h3>
              <p className="text-muted-foreground mb-4">
                Manage your published projects and track their performance.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Launch Your First Project
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectStudio;