import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WebGISLayer, WebGISWidget } from '@/hooks/useWebGISProjects';

export const useWebGISBuilder = (projectId: string) => {
  const [layers, setLayers] = useState<WebGISLayer[]>([]);
  const [widgets, setWidgets] = useState<WebGISWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      
      // Fetch layers
      const { data: layersData, error: layersError } = await supabase
        .from('webgis_layers')
        .select('*')
        .eq('project_id', projectId)
        .order('layer_order', { ascending: true });

      if (layersError) throw layersError;

      // Fetch widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('webgis_widgets')
        .select('*')
        .eq('project_id', projectId);

      if (widgetsError) throw widgetsError;

      setLayers((layersData || []) as WebGISLayer[]);
      setWidgets((widgetsData || []) as WebGISWidget[]);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addLayer = async (layerData: Omit<WebGISLayer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('webgis_layers')
        .insert({
          ...layerData,
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;

      setLayers(prev => [...prev, data as WebGISLayer]);
      toast({
        title: 'Success',
        description: 'Layer added successfully!',
      });

      return data;
    } catch (error) {
      console.error('Error adding layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add layer. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateLayer = async (layerId: string, updates: Partial<WebGISLayer>) => {
    try {
      const { data, error } = await supabase
        .from('webgis_layers')
        .update(updates)
        .eq('id', layerId)
        .select()
        .single();

      if (error) throw error;

      setLayers(prev => prev.map(layer => 
        layer.id === layerId ? { ...layer, ...(data as WebGISLayer) } : layer
      ));

      return data;
    } catch (error) {
      console.error('Error updating layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update layer. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteLayer = async (layerId: string) => {
    try {
      const { error } = await supabase
        .from('webgis_layers')
        .delete()
        .eq('id', layerId);

      if (error) throw error;

      setLayers(prev => prev.filter(layer => layer.id !== layerId));
      toast({
        title: 'Success',
        description: 'Layer deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete layer. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const addWidget = async (widgetData: Omit<WebGISWidget, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('webgis_widgets')
        .insert({
          ...widgetData,
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;

      setWidgets(prev => [...prev, data as WebGISWidget]);
      toast({
        title: 'Success',
        description: 'Widget added successfully!',
      });

      return data;
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to add widget. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateWidget = async (widgetId: string, updates: Partial<WebGISWidget>) => {
    try {
      const { data, error } = await supabase
        .from('webgis_widgets')
        .update(updates)
        .eq('id', widgetId)
        .select()
        .single();

      if (error) throw error;

      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId ? { ...widget, ...(data as WebGISWidget) } : widget
      ));

      return data;
    } catch (error) {
      console.error('Error updating widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update widget. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('webgis_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;

      setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
      toast({
        title: 'Success',
        description: 'Widget deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete widget. Please try again.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  return {
    layers,
    widgets,
    loading,
    addLayer,
    updateLayer,
    deleteLayer,
    addWidget,
    updateWidget,
    deleteWidget,
    refetch: fetchProjectData
  };
};