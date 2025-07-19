import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface WebGISProject {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  config: any;
  thumbnail_url?: string;
  is_public: boolean;
  is_template: boolean;
  template_category?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  published_url?: string;
  embed_code?: string;
}

export interface WebGISLayer {
  id: string;
  project_id: string;
  name: string;
  type: 'geojson' | 'wms' | 'wmts' | 'csv' | 'api';
  source_url?: string;
  source_data?: any;
  style_config: any;
  is_visible: boolean;
  layer_order: number;
  created_at: string;
  updated_at: string;
}

export interface WebGISWidget {
  id: string;
  project_id: string;
  type: 'legend' | 'scale' | 'coordinates' | 'filter' | 'chart';
  title?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  config: any;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export const useWebGISProjects = () => {
  const [projects, setProjects] = useState<WebGISProject[]>([]);
  const [templates, setTemplates] = useState<WebGISProject[]>([]);
  const [sharedProjects, setSharedProjects] = useState<WebGISProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's projects
      const { data: userProjects, error: userError } = await supabase
        .from('webgis_projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_template', false)
        .order('updated_at', { ascending: false });

      if (userError) throw userError;

      // Fetch templates
      const { data: templateData, error: templateError } = await supabase
        .from('webgis_projects')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (templateError) throw templateError;

      // Fetch shared projects
      const { data: sharedData, error: sharedError } = await supabase
        .from('webgis_shared_projects')
        .select(`
          *,
          webgis_projects (*)
        `)
        .eq('user_id', user.id);

      if (sharedError) throw sharedError;

      setProjects(userProjects || []);
      setTemplates(templateData || []);
      setSharedProjects(sharedData?.map(s => s.webgis_projects).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (title: string, description?: string, templateId?: string) => {
    if (!user) return null;

    try {
      let config = { basemap: 'osm', center: [0, 0], zoom: 2, theme: 'light' };
      
      if (templateId) {
        const { data: template } = await supabase
          .from('webgis_projects')
          .select('config')
          .eq('id', templateId)
          .single();
        
        
        if (template && template.config) {
          config = template.config as any;
        }
      }

      const { data, error } = await supabase
        .from('webgis_projects')
        .insert({
          user_id: user.id,
          title,
          description,
          config
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<WebGISProject>) => {
    try {
      const { error } = await supabase
        .from('webgis_projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('webgis_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const duplicateProject = async (projectId: string) => {
    if (!user) return null;

    try {
      const { data: originalProject } = await supabase
        .from('webgis_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!originalProject) throw new Error('Project not found');

      const { data: newProject, error } = await supabase
        .from('webgis_projects')
        .insert({
          user_id: user.id,
          title: `${originalProject.title} (Copy)`,
          description: originalProject.description,
          config: originalProject.config,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      toast({
        title: 'Success',
        description: 'Project duplicated successfully!',
      });

      return newProject;
    } catch (error) {
      console.error('Error duplicating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate project. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const publishProject = async (projectId: string, isPublic: boolean) => {
    try {
      const published_url = isPublic ? `/dashboard/${projectId}` : null;
      const published_at = isPublic ? new Date().toISOString() : null;
      
      const { error } = await supabase
        .from('webgis_projects')
        .update({ 
          is_public: isPublic, 
          published_url,
          published_at
        })
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      toast({
        title: 'Success',
        description: isPublic ? 'Project published successfully!' : 'Project made private successfully!',
      });
    } catch (error) {
      console.error('Error publishing project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project visibility. Please try again.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    templates,
    sharedProjects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    publishProject,
    refetch: fetchProjects
  };
};