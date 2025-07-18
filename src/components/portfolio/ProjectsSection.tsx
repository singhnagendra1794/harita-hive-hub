import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Save, X, Github, Globe, Eye, Upload, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  type: "web-map" | "analysis" | "tool" | "research" | "challenge" | "custom";
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  completedDate: string;
  duration?: string;
  source: "harita-hive" | "custom";
}

interface ProjectsSectionProps {
  projects: Project[];
  onSave: (projects: Project[]) => void;
  haritaHiveProjects?: Project[]; // Auto-fetched from platform
}

const projectTypes = [
  { value: "web-map", label: "Web Mapping" },
  { value: "analysis", label: "Spatial Analysis" },
  { value: "tool", label: "GIS Tool" },
  { value: "research", label: "Research Project" },
  { value: "challenge", label: "Challenge Submission" },
  { value: "custom", label: "Custom Project" }
];

const commonTechnologies = [
  "Python", "JavaScript", "React", "QGIS", "ArcGIS", "Google Earth Engine", 
  "PostGIS", "Leaflet", "Mapbox", "OpenLayers", "GDAL", "GeoPandas",
  "TensorFlow", "PyTorch", "R", "SQL", "Docker", "AWS", "Azure"
];

export const ProjectsSection = ({ projects, onSave, haritaHiveProjects = [] }: ProjectsSectionProps) => {
  const [localProjects, setLocalProjects] = useState(projects);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const allProjects = [...haritaHiveProjects, ...localProjects];

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setLocalProjects(prev => prev.map(p => p.id === project.id ? project : p));
    } else {
      setLocalProjects(prev => [...prev, project]);
    }
    setIsAddingProject(false);
    setEditingProject(null);
    onSave([...haritaHiveProjects, ...localProjects]);
  };

  const handleDeleteProject = (projectId: string) => {
    setLocalProjects(prev => prev.filter(p => p.id !== projectId));
    onSave(localProjects.filter(p => p.id !== projectId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Projects Portfolio</h2>
          <p className="text-muted-foreground">Showcase your geospatial projects and achievements</p>
        </div>
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm 
              onSave={handleSaveProject}
              onCancel={() => setIsAddingProject(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Auto-fetched Harita Hive Projects */}
      {haritaHiveProjects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Badge variant="secondary">Auto-imported</Badge>
            Harita Hive Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {haritaHiveProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Custom Projects */}
      {localProjects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Custom Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onEdit={() => setEditingProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
                showActions
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <ProjectForm 
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  showActions = false 
}: { 
  project: Project;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}) => {
  return (
    <Card className="overflow-hidden">
      {project.imageUrl && (
        <div className="aspect-video bg-muted">
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{project.title}</h3>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {projectTypes.find(t => t.value === project.type)?.label}
            </Badge>
            {project.source === "harita-hive" && (
              <Badge variant="secondary" className="text-xs">HH</Badge>
            )}
          </div>
        </div>
        
        <p className="text-muted-foreground mb-3 text-sm line-clamp-2">{project.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {project.technologies.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.technologies.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {project.githubUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          
          {showActions && (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {new Date(project.completedDate).toLocaleDateString()}
          {project.duration && <span>• {project.duration}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectForm = ({ 
  project, 
  onSave, 
  onCancel 
}: { 
  project?: Project; 
  onSave: (project: Project) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'source'>>({
    title: project?.title || "",
    description: project?.description || "",
    type: project?.type || "custom",
    technologies: project?.technologies || [],
    githubUrl: project?.githubUrl || "",
    demoUrl: project?.demoUrl || "",
    imageUrl: project?.imageUrl || "",
    completedDate: project?.completedDate || new Date().toISOString().split('T')[0],
    duration: project?.duration || ""
  });

  const [newTechnology, setNewTechnology] = useState("");

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
      setNewTechnology("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: project?.id || crypto.randomUUID(),
      source: project?.source || "custom"
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter project title"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Project Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your project, its goals, and key achievements..."
          className="min-h-[80px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="completedDate">Completion Date</Label>
          <Input
            id="completedDate"
            type="date"
            value={formData.completedDate}
            onChange={(e) => setFormData(prev => ({ ...prev, completedDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="e.g., 3 months, 2 weeks"
          />
        </div>
      </div>

      <div>
        <Label>Technologies Used</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTechnology}
            onChange={(e) => setNewTechnology(e.target.value)}
            placeholder="Add technology"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTechnology(newTechnology);
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => addTechnology(newTechnology)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {commonTechnologies.filter(tech => !formData.technologies.includes(tech)).slice(0, 6).map(tech => (
            <Button
              key={tech}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTechnology(tech)}
            >
              {tech}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.technologies.map(tech => (
            <span 
              key={tech}
              className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
              onClick={() => removeTechnology(tech)}
            >
              {tech} <X className="h-3 w-3" />
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="githubUrl">GitHub Repository</Label>
          <Input
            id="githubUrl"
            value={formData.githubUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
            placeholder="https://github.com/username/repo"
          />
        </div>
        <div>
          <Label htmlFor="demoUrl">Demo/Live URL</Label>
          <Input
            id="demoUrl"
            value={formData.demoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
            placeholder="https://yourproject.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">Project Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://example.com/project-screenshot.png"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Project
        </Button>
      </div>
    </form>
  );
};