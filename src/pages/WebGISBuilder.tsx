import { useState } from "react";
import Layout from "../components/Layout";
import PremiumAccessGate from "../components/premium/PremiumAccessGate";
import EnhancedMapBuilder from "../components/webgis/EnhancedMapBuilder";
import EnhancedProjectDashboard from "../components/webgis/EnhancedProjectDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWebGISProjects } from "@/hooks/useWebGISProjects";

const WebGISBuilder = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  
  const { createProject } = useWebGISProjects();

  const handleCreateNew = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    
    const project = await createProject(newProjectTitle, newProjectDescription);
    if (project) {
      setCurrentProjectId(project.id);
      setCurrentView('builder');
      setCreateDialogOpen(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
    }
  };

  const handleEditProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView('builder');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentProjectId(null);
  };

  return (
    <Layout>
      <PremiumAccessGate 
        requiredTier="enterprise"
        featureName="WebGIS Builder"
        featureDescription="Create professional web-based GIS applications with drag-and-drop interface, real-time data sources, spatial analysis tools, and collaboration features."
      >
        <div className="h-screen flex flex-col">
          {currentView === 'dashboard' ? (
            <div className="container py-8 flex-1">
              <EnhancedProjectDashboard 
                onCreateNew={handleCreateNew} 
                onEditProject={handleEditProject}
              />
            </div>
          ) : currentProjectId ? (
            <div className="flex-1">
              <EnhancedMapBuilder 
                projectId={currentProjectId}
                onBack={handleBackToDashboard}
              />
            </div>
          ) : null}
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New WebGIS Dashboard</DialogTitle>
              <DialogDescription>
                Build an interactive geospatial dashboard with drag-and-drop interface
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Dashboard Title</Label>
                <Input
                  id="title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="My WebGIS Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your dashboard's purpose..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProjectTitle.trim()}>
                  Create Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PremiumAccessGate>
    </Layout>
  );
};

export default WebGISBuilder;