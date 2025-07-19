import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar, 
  Share2, 
  MoreHorizontal,
  Map,
  Users,
  Eye,
  Edit,
  Copy,
  Trash2,
  Globe,
  Lock,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useWebGISProjects, WebGISProject } from "@/hooks/useWebGISProjects";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EnhancedProjectDashboardProps {
  onCreateNew: () => void;
  onEditProject: (projectId: string) => void;
}

const EnhancedProjectDashboard = ({ onCreateNew, onEditProject }: EnhancedProjectDashboardProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const { 
    projects, 
    templates, 
    sharedProjects, 
    loading, 
    createProject, 
    deleteProject, 
    duplicateProject, 
    publishProject,
    refetch 
  } = useWebGISProjects();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalViews: 0,
    publicDashboards: 0,
    totalLayers: 0
  });

  useEffect(() => {
    const totalProjects = projects.length;
    const totalViews = projects.reduce((sum, p) => sum + p.view_count, 0);
    const publicDashboards = projects.filter(p => p.is_public).length;
    // Note: Total layers would need to be calculated from webgis_layers table
    const totalLayers = projects.length * 3; // Placeholder calculation

    setStats({
      totalProjects,
      totalViews,
      publicDashboards,
      totalLayers
    });
  }, [projects]);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateFromTemplate = async (template: WebGISProject) => {
    const project = await createProject(
      `${template.title} Dashboard`,
      template.description,
      template.id
    );
    if (project) {
      onEditProject(project.id);
    }
  };

  const handleDuplicate = async (project: WebGISProject) => {
    await duplicateProject(project.id);
  };

  const handleTogglePublic = async (project: WebGISProject) => {
    await publishProject(project.id, !project.is_public);
  };

  const handleDelete = async (project: WebGISProject) => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      await deleteProject(project.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectMenuItems = (project: WebGISProject) => (
    <>
      <DropdownMenuItem onClick={() => onEditProject(project.id)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleDuplicate(project)}>
        <Copy className="h-4 w-4 mr-2" />
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleTogglePublic(project)}>
        {project.is_public ? (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Make Private
          </>
        ) : (
          <>
            <Globe className="h-4 w-4 mr-2" />
            Make Public
          </>
        )}
      </DropdownMenuItem>
      {project.is_public && (
        <DropdownMenuItem onClick={() => window.open(`/dashboard/${project.id}`, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Public
        </DropdownMenuItem>
      )}
      <DropdownMenuItem 
        onClick={() => handleDelete(project)}
        className="text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">WebGIS Builder</h1>
          <p className="text-muted-foreground">Create powerful interactive geospatial dashboards</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={refetch}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={onCreateNew} size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Create Dashboard
          </Button>
        </div>
      </div>

      {/* Live Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Map className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.publicDashboards}</div>
                <div className="text-sm text-muted-foreground">Public Dashboards</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Share2 className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalLayers}</div>
                <div className="text-sm text-muted-foreground">Data Layers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Projects Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded w-12"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center relative">
                    <Map className="h-12 w-12 text-primary" />
                    {project.is_public && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {project.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {getProjectMenuItems(project)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.updated_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.view_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onEditProject(project.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicate(project)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTogglePublic(project)}
                      >
                        {project.is_public ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                        <Map className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {project.title}
                          {project.is_public && <Globe className="h-4 w-4 text-green-500" />}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {project.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Modified {formatDate(project.updated_at)}</span>
                          <span>{project.view_count.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm"
                        onClick={() => onEditProject(project.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {getProjectMenuItems(project)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No projects match your search criteria.' : 'Get started by creating your first WebGIS dashboard.'}
                </p>
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-t-lg flex items-center justify-center">
                  <Map className="h-12 w-12 text-accent" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.template_category}</Badge>
                    <Button size="sm" onClick={() => handleCreateFromTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared">
          {sharedProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Shared Projects</h3>
                <p className="text-muted-foreground">
                  Projects shared with you by other users will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedProjects.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                    <Map className="h-12 w-12 text-primary" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full" onClick={() => onEditProject(project.id)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProjectDashboard;