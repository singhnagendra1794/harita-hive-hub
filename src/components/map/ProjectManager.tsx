import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, Folder, Share, Globe, Lock, 
  Calendar, User, FileText 
} from 'lucide-react';

interface ProjectManagerProps {
  onSave: (projectName: string, isPublic: boolean) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onSave }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!projectName.trim()) return;
    
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      onSave(projectName, isPublic);
      
      // Reset form
      setProjectName('');
      setDescription('');
      setIsPublic(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadProject = (projectId: string) => {
    console.log('Loading project:', projectId);
  };

  // Mock saved projects for demonstration
  const savedProjects = [
    {
      id: '1',
      name: 'Urban Analysis 2024',
      description: 'City development analysis with population data',
      isPublic: false,
      lastModified: '2 hours ago',
      owner: 'You'
    },
    {
      id: '2',
      name: 'Environmental Study',
      description: 'Vegetation and land use mapping',
      isPublic: true,
      lastModified: 'Yesterday',
      owner: 'You'
    },
    {
      id: '3',
      name: 'Transportation Network',
      description: 'Public transport accessibility analysis',
      isPublic: false,
      lastModified: '3 days ago',
      owner: 'You'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Save Current Project */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Current Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project (optional)"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-project">Make Public</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to view and use this project
              </p>
            </div>
            <Switch
              id="public-project"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!projectName.trim() || isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Project'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Saved Projects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Your Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved projects yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedProjects.map((project) => (
                <div key={project.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{project.name}</h4>
                        <Badge variant={project.isPublic ? 'default' : 'secondary'} className="text-xs">
                          {project.isPublic ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </>
                          )}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {project.owner}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.lastModified}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadProject(project.id)}
                      className="flex-1"
                    >
                      Load Project
                    </Button>
                    {project.isPublic && (
                      <Button variant="outline" size="sm">
                        <Share className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Project Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: 'Urban Planning', description: 'City development analysis template' },
              { name: 'Environmental', description: 'Land use and vegetation mapping' },
              { name: 'Transportation', description: 'Network and accessibility analysis' },
              { name: 'Demographics', description: 'Population and census data analysis' }
            ].map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Quick Save
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share Current
        </Button>
      </div>
    </div>
  );
};

export default ProjectManager;