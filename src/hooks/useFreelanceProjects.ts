import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface FreelanceProject {
  id: string;
  external_id?: string;
  platform?: string;
  title: string;
  client_name?: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  budget_type: 'fixed' | 'hourly';
  currency?: string;
  deadline?: string;
  duration?: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
  is_remote: boolean;
  client_rating?: number;
  applicants_count: number;
  apply_url?: string;
  posted_date: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_internal?: boolean;
  source?: string;
}

export const useFreelanceProjects = () => {
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      // Check if external_projects table exists by attempting to query it
      const { data: externalProjects, error: externalError } = await supabase
        .from('external_projects')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      // If table doesn't exist or other error, use sample data
      if (externalError) {
        console.warn('External projects table not found, using sample data:', externalError);
        
        // Create sample projects as fallback
        const sampleProjects: FreelanceProject[] = [
          {
            id: 'sample-1',
            title: 'GIS Data Analysis for Urban Planning',
            client_name: 'Urban Development Corp',
            description: 'We need an experienced GIS professional to analyze urban development patterns and create comprehensive maps for our upcoming city planning project.',
            budget_min: 25000,
            budget_max: 50000,
            budget_type: 'fixed',
            currency: 'INR',
            duration: '2-3 months',
            skills: ['QGIS', 'ArcGIS', 'PostGIS', 'Python', 'Remote Sensing'],
            difficulty: 'intermediate',
            location: 'Mumbai, India',
            is_remote: true,
            client_rating: 4.8,
            applicants_count: 12,
            apply_url: '#',
            posted_date: new Date().toISOString(),
            is_active: true,
            is_verified: true,
            is_internal: true,
            source: 'Harita Hive'
          },
          {
            id: 'sample-2',
            title: 'Satellite Image Classification using Machine Learning',
            client_name: 'AgriTech Solutions',
            description: 'Looking for a GeoAI expert to develop machine learning models for crop classification using satellite imagery. Experience with Python and deep learning required.',
            budget_min: 40000,
            budget_max: 80000,
            budget_type: 'fixed',
            currency: 'INR',
            duration: '1-2 months',
            skills: ['Python', 'TensorFlow', 'Remote Sensing', 'GDAL', 'Google Earth Engine'],
            difficulty: 'advanced',
            location: 'Bangalore, India',
            is_remote: true,
            client_rating: 4.9,
            applicants_count: 8,
            apply_url: '#',
            posted_date: new Date(Date.now() - 86400000).toISOString(),
            is_active: true,
            is_verified: true,
            is_internal: true,
            source: 'Harita Hive'
          },
          {
            id: 'sample-3',
            title: 'Web GIS Application Development',
            client_name: 'Smart City Initiative',
            description: 'Develop a responsive web GIS application for citizen services. Must have experience with Leaflet, OpenLayers, or similar mapping libraries.',
            budget_min: 35000,
            budget_max: 65000,
            budget_type: 'fixed',
            currency: 'INR',
            duration: '3-4 months',
            skills: ['JavaScript', 'Leaflet', 'PostGIS', 'Node.js', 'React'],
            difficulty: 'intermediate',
            location: 'Delhi, India',
            is_remote: true,
            client_rating: 4.7,
            applicants_count: 15,
            apply_url: '#',
            posted_date: new Date(Date.now() - 172800000).toISOString(),
            is_active: true,
            is_verified: true,
            is_internal: true,
            source: 'Harita Hive'
          }
        ];
        
        setProjects(sampleProjects);
        return;
      }

      // Format external projects if table exists
      const formattedExternal: FreelanceProject[] = (externalProjects || []).map(project => ({
        id: project.id,
        external_id: project.external_id,
        platform: project.platform,
        title: project.title,
        client_name: project.client_name || 'Anonymous Client',
        description: project.description,
        budget_min: project.budget_min,
        budget_max: project.budget_max,
        budget_type: project.budget_type as 'fixed' | 'hourly',
        currency: project.currency || 'USD',
        deadline: project.deadline,
        duration: project.duration,
        skills: project.skills || [],
        difficulty: project.difficulty as 'beginner' | 'intermediate' | 'advanced',
        location: project.location,
        is_remote: project.is_remote,
        client_rating: project.client_rating,
        applicants_count: project.applicants_count || 0,
        apply_url: project.apply_url,
        posted_date: project.posted_date || project.created_at,
        is_active: project.is_active,
        is_verified: project.is_verified,
        is_internal: false,
        source: project.platform
      }));

      setProjects(formattedExternal);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Don't show error toast, just use sample data as fallback
      const sampleProjects: FreelanceProject[] = [
        {
          id: 'fallback-1',
          title: 'Sample GIS Project',
          client_name: 'Sample Client',
          description: 'This is a sample project while we load real opportunities.',
          budget_min: 20000,
          budget_max: 40000,
          budget_type: 'fixed',
          currency: 'INR',
          duration: '1-2 months',
          skills: ['GIS', 'QGIS', 'Remote Sensing'],
          difficulty: 'beginner',
          location: 'India',
          is_remote: true,
          client_rating: 4.5,
          applicants_count: 5,
          apply_url: '#',
          posted_date: new Date().toISOString(),
          is_active: true,
          is_verified: false,
          is_internal: true,
          source: 'Harita Hive'
        }
      ];
      setProjects(sampleProjects);
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = async () => {
    setRefreshing(true);
    try {
      // Call edge function to fetch new projects
      const { error } = await supabase.functions.invoke('freelance-project-fetcher', {
        body: { action: 'fetch' }
      });

      if (error) throw error;

      // Refetch projects
      await fetchProjects();
      
      toast({
        title: 'Success',
        description: 'Successfully refreshed freelance projects!',
      });
    } catch (error) {
      console.error('Error refreshing projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh projects. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const saveProject = async (projectId: string, projectData: FreelanceProject) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save projects.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: user.id,
          project_id: projectId,
          project_data: projectData as any
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project saved to your profile!',
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const trackApplication = async (projectId: string, platform?: string, method: string = 'redirect') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('application_tracking')
        .insert({
          user_id: user.id,
          project_id: projectId,
          project_type: platform ? 'external' : 'internal',
          platform: platform,
          application_method: method
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking application:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    refreshing,
    refreshProjects,
    saveProject,
    trackApplication
  };
};