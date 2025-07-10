
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Map, 
  Share2, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Calendar,
  Users,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MapProject {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  layers_count: number;
  is_public: boolean;
  views: number;
  share_url: string;
  thumbnail?: string;
}

const ProjectDashboard = ({ onCreateNew }: { onCreateNew: () => void }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    is_public: false
  });

  // Mock data - replace with real data from backend
  const projects: MapProject[] = [
    {
      id: "1",
      name: "City Planning Dashboard",
      description: "Interactive map showing urban development zones and infrastructure planning.",
      created_at: "2024-01-15",
      updated_at: "2024-01-20",
      layers_count: 8,
      is_public: true,
      views: 245,
      share_url: "https://webgis.example.com/maps/city-planning-dashboard"
    },
    {
      id: "2", 
      name: "Environmental Monitoring",
      description: "Tracking air quality and environmental sensors across the region.",
      created_at: "2024-01-10",
      updated_at: "2024-01-18",
      layers_count: 5,
      is_public: false,
      views: 89,
      share_url: "https://webgis.example.com/maps/environmental-monitoring"
    },
    {
      id: "3",
      name: "Transportation Network",
      description: "Real-time traffic data and public transportation routes.",
      created_at: "2024-01-05",
      updated_at: "2024-01-22",
      layers_count: 12,
      is_public: true,
      views: 387,
      share_url: "https://webgis.example.com/maps/transportation-network"
    }
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async () => {
    try {
      // Create project logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Project created successfully!",
        description: `${newProject.name} is ready for editing.`,
      });
      
      setShowCreateDialog(false);
      setNewProject({ name: '', description: '', is_public: false });
      onCreateNew();
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyShareUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share URL has been copied to clipboard.",
    });
  };

  const deleteProject = (projectId: string, projectName: string) => {
    toast({
      title: "Project deleted",
      description: `${projectName} has been deleted.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My GIS Projects</h1>
          <p className="text-muted-foreground">Create and manage your web-based GIS applications</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New GIS Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome GIS App"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Description (Optional)</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this project is for..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public-project">Make project public</Label>
                <Switch
                  id="public-project"
                  checked={newProject.is_public}
                  onCheckedChange={(checked) => setNewProject(prev => ({ ...prev, is_public: checked }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateProject} className="flex-1">
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{projects.filter(p => p.is_public).length}</div>
                <div className="text-sm text-muted-foreground">Public Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.views, 0)}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.layers_count, 0)}</div>
                <div className="text-sm text-muted-foreground">Total Layers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {project.is_public && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Project Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Map className="h-4 w-4" />
                      {project.layers_count} layers
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={onCreateNew}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyShareUrl(project.share_url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(project.share_url, '_blank')}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteProject(project.id, project.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first GIS project to get started'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectDashboard;
