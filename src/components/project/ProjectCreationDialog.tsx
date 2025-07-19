import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
  templateId?: string;
}

const DOMAINS = [
  'Urban Planning', 'Climate & Environment', 'Forestry & Agriculture', 
  'Risk Management', 'Transportation', 'Remote Sensing', 'Water Resources',
  'Energy & Utilities', 'Mining', 'Conservation', 'Emergency Response'
];

const TOOLS = [
  'QGIS', 'ArcGIS', 'Google Earth Engine', 'Python', 'R', 'JavaScript',
  'PostGIS', 'GDAL', 'FME', 'ENVI', 'Erdas Imagine', 'Global Mapper',
  'Leaflet', 'OpenLayers', 'Mapbox', 'D3.js', 'Geopandas', 'Rasterio'
];

export const ProjectCreationDialog: React.FC<ProjectCreationDialogProps> = ({
  open,
  onOpenChange,
  onProjectCreated,
  templateId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    is_public: true,
    tools_used: [] as string[],
    github_url: '',
    colab_url: '',
    demo_url: '',
    is_team_project: false,
    collaborator_emails: ''
  });

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools_used: prev.tools_used.includes(tool)
        ? prev.tools_used.filter(t => t !== tool)
        : [...prev.tools_used, tool]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create the project
      const { data: project, error } = await supabase
        .from('project_submissions')
        .insert({
          title: formData.title,
          description: formData.description,
          domain: formData.domain,
          tools_used: formData.tools_used,
          github_url: formData.github_url || null,
          colab_url: formData.colab_url || null,
          demo_url: formData.demo_url || null,
          is_team_project: formData.is_team_project,
          is_public: formData.is_public,
          user_id: user.id,
          template_id: templateId || null,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;

      // Add collaborators if specified
      if (formData.is_team_project && formData.collaborator_emails.trim()) {
        const emails = formData.collaborator_emails
          .split(',')
          .map(email => email.trim())
          .filter(email => email);

        for (const email of emails) {
          await supabase.from('project_collaborators').insert({
            project_id: project.id,
            email,
            user_id: user.id, // Will be updated when user accepts
            invited_by: user.id,
            status: 'pending'
          });
        }
      }

      // Log activity
      await supabase.rpc('log_project_activity', {
        p_project_id: project.id,
        p_user_id: user.id,
        p_activity_type: 'project_created',
        p_description: templateId ? 'Project created from template' : 'Project created',
        p_activity_data: { template_id: templateId }
      });

      toast({
        title: "Success!",
        description: "Your project has been created successfully."
      });

      onProjectCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        domain: '',
        is_public: true,
        tools_used: [],
        github_url: '',
        colab_url: '',
        demo_url: '',
        is_team_project: false,
        collaborator_emails: ''
      });

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            {templateId ? 'Create a project from template' : 'Launch your geospatial project and share it with the community'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Select value={formData.domain} onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project, methodology, and key findings..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tools Used</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md">
              {TOOLS.map((tool) => (
                <Badge
                  key={tool}
                  variant={formData.tools_used.includes(tool) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleToolToggle(tool)}
                >
                  {tool}
                  {formData.tools_used.includes(tool) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub Repository</Label>
              <Input
                id="github_url"
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colab_url">Colab/Notebook</Label>
              <Input
                id="colab_url"
                value={formData.colab_url}
                onChange={(e) => setFormData(prev => ({ ...prev, colab_url: e.target.value }))}
                placeholder="https://colab.research.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo_url">Live Demo</Label>
              <Input
                id="demo_url"
                value={formData.demo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                placeholder="https://your-demo.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="is_public">Make project public</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_team_project"
                checked={formData.is_team_project}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_team_project: checked }))}
              />
              <Label htmlFor="is_team_project">Team project</Label>
            </div>

            {formData.is_team_project && (
              <div className="space-y-2">
                <Label htmlFor="collaborator_emails">Collaborator Emails</Label>
                <Input
                  id="collaborator_emails"
                  value={formData.collaborator_emails}
                  onChange={(e) => setFormData(prev => ({ ...prev, collaborator_emails: e.target.value }))}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};