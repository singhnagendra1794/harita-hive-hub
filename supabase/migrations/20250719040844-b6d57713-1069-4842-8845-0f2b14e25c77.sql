-- Enhanced project templates system

-- Create sectors enum
CREATE TYPE public.project_sector AS ENUM (
  'agriculture',
  'urban_planning', 
  'infrastructure',
  'risk_mapping',
  'forestry',
  'water_resources',
  'climate',
  'remote_sensing',
  'health',
  'real_estate',
  'mining',
  'transportation',
  'environmental',
  'disaster_management',
  'archaeology',
  'marine',
  'energy'
);

-- Create skill levels enum
CREATE TYPE public.skill_level AS ENUM (
  'beginner',
  'intermediate', 
  'advanced',
  'expert'
);

-- Create tools enum
CREATE TYPE public.gis_tool AS ENUM (
  'qgis',
  'arcgis',
  'python',
  'r',
  'google_earth_engine',
  'postgis',
  'sql',
  'javascript',
  'leaflet',
  'openlayers',
  'mapbox',
  'grass_gis',
  'gdal',
  'fme',
  'autocad_map',
  'microstation',
  'erdas_imagine',
  'envi',
  'snap',
  'matlab'
);

-- Enhanced project templates table
CREATE TABLE public.enhanced_project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  use_case TEXT NOT NULL,
  sector project_sector NOT NULL,
  skill_level skill_level NOT NULL DEFAULT 'intermediate',
  
  -- Template content
  overview TEXT NOT NULL,
  objectives JSONB DEFAULT '[]'::jsonb, -- Array of learning objectives
  tools_required gis_tool[] NOT NULL DEFAULT '{}',
  estimated_duration TEXT, -- e.g., "2-3 hours"
  
  -- Files and resources
  template_files JSONB DEFAULT '[]'::jsonb, -- Array of file objects with name, url, type, size
  sample_data_url TEXT,
  sample_data_description TEXT,
  documentation_url TEXT, -- PDF/Markdown walkthrough
  preview_images JSONB DEFAULT '[]'::jsonb, -- Array of preview image URLs
  result_images JSONB DEFAULT '[]'::jsonb, -- Array of expected result images
  
  -- Template structure
  folder_structure JSONB DEFAULT '{}'::jsonb, -- Nested object representing folder structure
  main_script_file TEXT, -- Primary executable file
  requirements_file TEXT, -- Dependencies/requirements file
  
  -- Metadata
  author_id UUID REFERENCES auth.users(id),
  contributor_name TEXT,
  contributor_email TEXT,
  organization TEXT,
  license_type TEXT DEFAULT 'MIT',
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  changelog JSONB DEFAULT '[]'::jsonb,
  parent_template_id UUID REFERENCES enhanced_project_templates(id),
  
  -- Analytics
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Status and publication
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false, -- Verified by admin as working
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Categorization and discovery
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  learning_outcomes TEXT[] DEFAULT '{}',
  
  -- External links
  github_url TEXT,
  documentation_external_url TEXT,
  video_tutorial_url TEXT,
  blog_post_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  last_verified_at TIMESTAMP WITH TIME ZONE
);

-- Template downloads tracking
CREATE TABLE public.template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES enhanced_project_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  download_type TEXT DEFAULT 'full', -- 'full', 'sample_data', 'scripts_only'
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template ratings
CREATE TABLE public.template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES enhanced_project_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Template usage analytics
CREATE TABLE public.template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES enhanced_project_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'view', 'download', 'fork', 'complete'
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template collections (curated lists)
CREATE TABLE public.template_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  curator_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template collection items
CREATE TABLE public.template_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES template_collections(id) ON DELETE CASCADE,
  template_id UUID REFERENCES enhanced_project_templates(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collection_id, template_id)
);

-- Enable RLS
ALTER TABLE public.enhanced_project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_project_templates
CREATE POLICY "Anyone can view published templates" 
ON public.enhanced_project_templates 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authors can manage their own templates" 
ON public.enhanced_project_templates 
FOR ALL 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all templates" 
ON public.enhanced_project_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Authenticated users can create templates" 
ON public.enhanced_project_templates 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- RLS Policies for template_downloads
CREATE POLICY "Users can view their own downloads" 
ON public.template_downloads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create download records" 
ON public.template_downloads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all downloads" 
ON public.template_downloads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for template_ratings
CREATE POLICY "Anyone can view ratings" 
ON public.template_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own ratings" 
ON public.template_ratings 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for template_usage_analytics
CREATE POLICY "Anyone can create usage analytics" 
ON public.template_usage_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own analytics" 
ON public.template_usage_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" 
ON public.template_usage_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for template_collections
CREATE POLICY "Anyone can view public collections" 
ON public.template_collections 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Curators can manage their own collections" 
ON public.template_collections 
FOR ALL 
USING (auth.uid() = curator_id);

CREATE POLICY "Admins can manage all collections" 
ON public.template_collections 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for template_collection_items
CREATE POLICY "Anyone can view collection items for public collections" 
ON public.template_collection_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM template_collections tc 
    WHERE tc.id = collection_id AND tc.is_public = true
  )
);

CREATE POLICY "Curators can manage their collection items" 
ON public.template_collection_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM template_collections tc 
    WHERE tc.id = collection_id AND tc.curator_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_enhanced_templates_sector ON public.enhanced_project_templates(sector);
CREATE INDEX idx_enhanced_templates_skill_level ON public.enhanced_project_templates(skill_level);
CREATE INDEX idx_enhanced_templates_tools ON public.enhanced_project_templates USING GIN(tools_required);
CREATE INDEX idx_enhanced_templates_status ON public.enhanced_project_templates(status);
CREATE INDEX idx_enhanced_templates_featured ON public.enhanced_project_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_enhanced_templates_tags ON public.enhanced_project_templates USING GIN(tags);
CREATE INDEX idx_enhanced_templates_keywords ON public.enhanced_project_templates USING GIN(keywords);
CREATE INDEX idx_enhanced_templates_rating ON public.enhanced_project_templates(rating_average DESC);
CREATE INDEX idx_enhanced_templates_downloads ON public.enhanced_project_templates(download_count DESC);
CREATE INDEX idx_enhanced_templates_created ON public.enhanced_project_templates(created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_enhanced_templates_updated_at
  BEFORE UPDATE ON public.enhanced_project_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_ratings_updated_at
  BEFORE UPDATE ON public.template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_collections_updated_at
  BEFORE UPDATE ON public.template_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update template ratings
CREATE OR REPLACE FUNCTION public.update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.enhanced_project_templates
  SET 
    rating_average = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    )
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for template rating updates
CREATE TRIGGER template_rating_update
  AFTER INSERT OR UPDATE OR DELETE ON public.template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_template_download_count(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.enhanced_project_templates 
  SET download_count = download_count + 1 
  WHERE id = template_id;
END;
$$;