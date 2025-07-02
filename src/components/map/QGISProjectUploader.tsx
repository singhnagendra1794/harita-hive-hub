
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, MapPin, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QGISProject {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: Date;
  size: number;
  layers: number;
  type: 'qgz' | 'qgs';
  status: 'uploaded' | 'processing' | 'ready' | 'error';
}

interface QGISProjectUploaderProps {
  onProjectSelect: (project: QGISProject) => void;
}

const QGISProjectUploader: React.FC<QGISProjectUploaderProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<QGISProject[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.qgz', '.qgs'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .qgz or .qgs QGIS project file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload to Supabase storage
      const fileName = `qgis-projects/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(fileName, file);

      if (error) throw error;

      const newProject: QGISProject = {
        id: Date.now().toString(),
        name: file.name.replace(/\.(qgz|qgs)$/, ''),
        fileName: file.name,
        uploadedAt: new Date(),
        size: file.size,
        layers: Math.floor(Math.random() * 15) + 5, // Simulated layer count
        type: fileExtension.slice(1) as 'qgz' | 'qgs',
        status: 'ready'
      };

      setProjects([...projects, newProject]);
      
      toast({
        title: "Project uploaded successfully",
        description: `${file.name} is now available for use.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your QGIS project.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: QGISProject['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            QGIS Project Upload
          </CardTitle>
          <CardDescription>
            Upload your QGIS project files (.qgz or .qgs) to make them available in the web viewer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".qgz,.qgs"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Supported formats: .qgz (QGIS compressed project), .qgs (QGIS project file)
          </div>
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available QGIS Projects</CardTitle>
            <CardDescription>Click on a project to load it in the map viewer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.layers} layers • {(project.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase">
                      {project.type}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QGISProjectUploader;
export type { QGISProject };
