import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Search, Filter, Star, File, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import UpgradePrompt from '@/components/premium/UpgradePrompt';
import { ProjectCreationDialog } from '@/components/project/ProjectCreationDialog';
import { ProjectCard } from '@/components/project/ProjectCard';
import { ProjectTemplatesGrid } from '@/components/project/ProjectTemplatesGrid';

interface ProjectSubmission {
  id: string;
  title: string;
  description: string;
  domain: string;
  tools_used: string[];
  github_url?: string;
  colab_url?: string;
  demo_url?: string;
  is_team_project: boolean;
  is_public: boolean;
  upvotes: number;
  average_rating: number;
  rating_count: number;
  status: string;
  thumbnail_url?: string;
  created_at: string;
  user_id: string;
}

const ProjectStudio = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSubmission[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectSubmission[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('published');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const hasProfessionalAccess = hasAccess('pro');
  const hasEnterpriseAccess = hasAccess('enterprise');

  useEffect(() => {
    fetchProjects();
    if (user) {
      fetchUserVotes();
    }
  }, [user]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, domainFilter, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch public projects
      const { data: publicProjects } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('is_public', true)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

      setProjects(publicProjects || []);

      // Fetch user's projects if authenticated
      if (user) {
        const { data: userProjectsData } = await supabase
          .from('project_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setUserProjects(userProjectsData || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('project_votes')
        .select('project_id')
        .eq('user_id', user.id);

      setUserVotes(new Set(data?.map(vote => vote.project_id) || []));
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const filterProjects = () => {
    let filtered = projects.filter(project => 
      statusFilter === 'all' || project.status === statusFilter
    );

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.domain?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (domainFilter) {
      filtered = filtered.filter(project =>
        project.domain?.toLowerCase().includes(domainFilter.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const handleProjectUpdate = () => {
    fetchProjects();
    fetchUserVotes();
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplates(false);
    setShowCreateDialog(true);
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
              Project Studio
            </h1>
            <p className="text-muted-foreground">
              Create, collaborate, and showcase your geospatial projects with the community
            </p>
          </div>
          
          {hasProfessionalAccess && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTemplates(true)}>
                <File className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ProjectCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectUpdate}
        templateId={selectedTemplateId}
      />

      {showTemplates && (
        <div className="mb-6 p-6 border rounded-lg bg-background">
          <ProjectTemplatesGrid onSelectTemplate={handleSelectTemplate} />
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Close Templates
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Projects</TabsTrigger>
          <TabsTrigger value="my-projects" disabled={!hasProfessionalAccess}>
            My Projects {!hasProfessionalAccess && '🔒'}
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!hasProfessionalAccess}>
            Analytics {!hasProfessionalAccess && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              placeholder="Filter by domain..."
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUserVoted={userVotes.has(project.id)}
                onVote={handleProjectUpdate}
                onUpdate={handleProjectUpdate}
              />
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
            <div className="space-y-6">
              {userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your Projects</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to start building your portfolio.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      currentUserVoted={userVotes.has(project.id)}
                      onVote={handleProjectUpdate}
                      onUpdate={handleProjectUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {!hasProfessionalAccess ? (
            <UpgradePrompt 
              feature="Project Analytics"
              description="Track project performance, collaboration insights, and community engagement metrics."
            />
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Project Analytics</h3>
              <p className="text-muted-foreground">
                Analytics dashboard coming soon. Track your project views, votes, and collaboration metrics.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectStudio;