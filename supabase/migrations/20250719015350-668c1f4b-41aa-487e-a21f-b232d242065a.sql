-- Create webgis_projects table for storing dashboard projects
CREATE TABLE IF NOT EXISTS public.webgis_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  template_category TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  published_url TEXT,
  embed_code TEXT
);

-- Enable RLS
ALTER TABLE public.webgis_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for webgis_projects
CREATE POLICY "Users can manage their own projects" 
ON public.webgis_projects 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public projects" 
ON public.webgis_projects 
FOR SELECT 
USING (is_public = true);

-- Create webgis_layers table for storing map layers
CREATE TABLE IF NOT EXISTS public.webgis_layers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.webgis_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'geojson', 'wms', 'wmts', 'csv', 'api'
  source_url TEXT,
  source_data JSONB,
  style_config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  layer_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webgis_layers ENABLE ROW LEVEL SECURITY;

-- Create policies for webgis_layers
CREATE POLICY "Users can manage layers for their projects" 
ON public.webgis_layers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.webgis_projects 
  WHERE id = webgis_layers.project_id AND user_id = auth.uid()
));

CREATE POLICY "Anyone can view layers for public projects" 
ON public.webgis_layers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.webgis_projects 
  WHERE id = webgis_layers.project_id AND is_public = true
));

-- Create webgis_widgets table for map widgets
CREATE TABLE IF NOT EXISTS public.webgis_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.webgis_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'legend', 'scale', 'coordinates', 'filter', 'chart'
  title TEXT,
  position TEXT NOT NULL, -- 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webgis_widgets ENABLE ROW LEVEL SECURITY;

-- Create policies for webgis_widgets
CREATE POLICY "Users can manage widgets for their projects" 
ON public.webgis_widgets 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.webgis_projects 
  WHERE id = webgis_widgets.project_id AND user_id = auth.uid()
));

CREATE POLICY "Anyone can view widgets for public projects" 
ON public.webgis_widgets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.webgis_projects 
  WHERE id = webgis_widgets.project_id AND is_public = true
));

-- Create webgis_shared_projects table for collaboration
CREATE TABLE IF NOT EXISTS public.webgis_shared_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.webgis_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'edit', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webgis_shared_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for webgis_shared_projects
CREATE POLICY "Users can view projects shared with them" 
ON public.webgis_shared_projects 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = shared_by);

CREATE POLICY "Project owners can manage sharing" 
ON public.webgis_shared_projects 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.webgis_projects 
  WHERE id = webgis_shared_projects.project_id AND user_id = auth.uid()
));

-- Create webgis_comments table for collaboration
CREATE TABLE IF NOT EXISTS public.webgis_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.webgis_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  position JSONB, -- Optional map coordinates for location-based comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webgis_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for webgis_comments
CREATE POLICY "Users can manage their own comments" 
ON public.webgis_comments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view comments on accessible projects" 
ON public.webgis_comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.webgis_projects 
  WHERE id = webgis_comments.project_id 
  AND (user_id = auth.uid() OR is_public = true)
) OR EXISTS (
  SELECT 1 FROM public.webgis_shared_projects 
  WHERE project_id = webgis_comments.project_id AND user_id = auth.uid()
));

-- Create template data
INSERT INTO public.webgis_projects (user_id, title, description, config, is_template, template_category, is_public) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'City Planning Dashboard',
  'Interactive map for urban planning with zoning data, development proposals, and demographic information',
  '{"basemap":"osm","center":[0,0],"zoom":10,"theme":"light"}',
  true,
  'Urban Planning',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Air Quality Monitoring',
  'Real-time air quality data visualization with sensor networks and pollution hotspots',
  '{"basemap":"satellite","center":[0,0],"zoom":8,"theme":"light"}',
  true,
  'Environmental',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Utility Infrastructure Dashboard',
  'Comprehensive utility management with power grids, water systems, and maintenance tracking',
  '{"basemap":"terrain","center":[0,0],"zoom":12,"theme":"dark"}',
  true,
  'Infrastructure',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Disaster Response Center',
  'Emergency management dashboard with incident tracking, resource allocation, and evacuation routes',
  '{"basemap":"osm","center":[0,0],"zoom":9,"theme":"light"}',
  true,
  'Emergency Management',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Wildlife Tracking System',
  'Conservation dashboard for tracking animal movements, habitat zones, and biodiversity hotspots',
  '{"basemap":"satellite","center":[0,0],"zoom":11,"theme":"light"}',
  true,
  'Conservation',
  true
);

-- Create indexes for better performance
CREATE INDEX idx_webgis_projects_user_id ON public.webgis_projects(user_id);
CREATE INDEX idx_webgis_projects_public ON public.webgis_projects(is_public);
CREATE INDEX idx_webgis_projects_template ON public.webgis_projects(is_template);
CREATE INDEX idx_webgis_layers_project_id ON public.webgis_layers(project_id);
CREATE INDEX idx_webgis_widgets_project_id ON public.webgis_widgets(project_id);
CREATE INDEX idx_webgis_shared_projects_user_id ON public.webgis_shared_projects(user_id);
CREATE INDEX idx_webgis_comments_project_id ON public.webgis_comments(project_id);