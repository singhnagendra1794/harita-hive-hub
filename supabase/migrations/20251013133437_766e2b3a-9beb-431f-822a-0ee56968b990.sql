-- Spatial Analysis Platform Schema
-- Stores spatial analysis projects, tools, and processing history

-- Analysis Projects
CREATE TABLE IF NOT EXISTS public.spatial_analysis_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  project_name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'vector', -- vector, raster, mixed
  layers JSONB DEFAULT '[]'::jsonb,
  analysis_history JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Processing Jobs
CREATE TABLE IF NOT EXISTS public.spatial_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.spatial_analysis_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  tool_category TEXT NOT NULL, -- vector, raster, ai, network
  input_layers JSONB NOT NULL DEFAULT '[]'::jsonb,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0,
  output_layer JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Global Dataset Catalog
CREATE TABLE IF NOT EXISTS public.global_spatial_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name TEXT NOT NULL,
  provider TEXT NOT NULL, -- NASA, ESA, USGS, OSM, etc.
  data_type TEXT NOT NULL, -- raster, vector
  category TEXT NOT NULL, -- satellite, administrative, terrain, climate
  description TEXT,
  coverage_area TEXT, -- global, regional, country
  temporal_range TEXT, -- date range or "current"
  resolution TEXT, -- spatial resolution
  api_endpoint TEXT NOT NULL,
  access_method TEXT NOT NULL, -- wms, wfs, api, tile
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analysis Tools Registry
CREATE TABLE IF NOT EXISTS public.spatial_analysis_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL, -- vector, raster, ai, network, topology
  subcategory TEXT,
  description TEXT NOT NULL,
  parameters_schema JSONB NOT NULL,
  input_requirements JSONB NOT NULL,
  output_type TEXT NOT NULL,
  processing_engine TEXT NOT NULL, -- postgis, gdal, turf, python
  is_active BOOLEAN DEFAULT true,
  requires_subscription TEXT DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Analysis Quotas
CREATE TABLE IF NOT EXISTS public.spatial_analysis_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  monthly_analysis_count INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 10,
  storage_used_mb INTEGER DEFAULT 0,
  storage_limit_mb INTEGER DEFAULT 100,
  reset_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spatial_analysis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_spatial_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_analysis_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_analysis_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own projects"
  ON public.spatial_analysis_projects
  FOR ALL
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users view own processing jobs"
  ON public.spatial_processing_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create processing jobs"
  ON public.spatial_processing_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active datasets"
  ON public.global_spatial_datasets
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active tools"
  ON public.spatial_analysis_tools
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users manage own quotas"
  ON public.spatial_analysis_quotas
  FOR ALL
  USING (auth.uid() = user_id);

-- Insert sample global datasets
INSERT INTO public.global_spatial_datasets (dataset_name, provider, data_type, category, description, coverage_area, temporal_range, resolution, api_endpoint, access_method) VALUES
('Sentinel-2 Imagery', 'ESA', 'raster', 'satellite', 'High-resolution multispectral satellite imagery', 'global', '2015-present', '10-60m', 'https://services.sentinel-hub.com/ogc/wms', 'wms'),
('Landsat 8/9', 'USGS', 'raster', 'satellite', 'Medium-resolution multispectral imagery', 'global', '2013-present', '30m', 'https://landsatlook.usgs.gov/api/v1', 'api'),
('SRTM Elevation', 'NASA', 'raster', 'terrain', 'Global digital elevation model', 'global', '2000', '30m', 'https://elevation-tiles-prod.s3.amazonaws.com', 'tile'),
('OpenStreetMap', 'OSM', 'vector', 'administrative', 'Global street and POI data', 'global', 'current', 'variable', 'https://overpass-api.de/api', 'api'),
('Natural Earth', 'Natural Earth', 'vector', 'administrative', 'Cultural and physical vector data', 'global', 'current', '1:10m-1:110m', 'https://www.naturalearthdata.com/http', 'api'),
('GADM Boundaries', 'GADM', 'vector', 'administrative', 'Global administrative boundaries', 'global', 'current', 'country-level', 'https://gadm.org/maps', 'api'),
('MODIS NDVI', 'NASA', 'raster', 'satellite', 'Vegetation index from MODIS', 'global', '2000-present', '250m-1km', 'https://modis.gsfc.nasa.gov/data', 'api');

-- Insert spatial analysis tools
INSERT INTO public.spatial_analysis_tools (tool_name, display_name, category, subcategory, description, parameters_schema, input_requirements, output_type, processing_engine) VALUES
('buffer', 'Buffer', 'vector', 'proximity', 'Create buffer zones around features', '{"distance": "number", "units": "string", "segments": "number"}', '{"min_layers": 1, "geometry_types": ["point", "line", "polygon"]}', 'vector', 'postgis'),
('intersect', 'Intersect', 'vector', 'overlay', 'Find geometric intersection of layers', '{"keep_attributes": "boolean"}', '{"min_layers": 2, "geometry_types": ["polygon"]}', 'vector', 'postgis'),
('union', 'Union', 'vector', 'overlay', 'Combine multiple layers into one', '{"dissolve": "boolean"}', '{"min_layers": 2, "geometry_types": ["polygon"]}', 'vector', 'postgis'),
('clip', 'Clip', 'vector', 'overlay', 'Clip layer by boundary', '{}', '{"min_layers": 2, "geometry_types": ["any"]}', 'vector', 'postgis'),
('dissolve', 'Dissolve', 'vector', 'geometry', 'Merge features based on attribute', '{"field": "string"}', '{"min_layers": 1, "geometry_types": ["polygon"]}', 'vector', 'postgis'),
('spatial_join', 'Spatial Join', 'vector', 'analysis', 'Join attributes by spatial relationship', '{"join_type": "string", "predicate": "string"}', '{"min_layers": 2, "geometry_types": ["any"]}', 'vector', 'postgis'),
('ndvi', 'NDVI Calculator', 'raster', 'indices', 'Calculate Normalized Difference Vegetation Index', '{"red_band": "number", "nir_band": "number"}', '{"min_layers": 1, "data_type": "raster"}', 'raster', 'gdal'),
('slope', 'Slope Analysis', 'raster', 'surface', 'Calculate terrain slope from DEM', '{"units": "string"}', '{"min_layers": 1, "data_type": "raster"}', 'raster', 'gdal'),
('hillshade', 'Hillshade', 'raster', 'surface', 'Create shaded relief map', '{"azimuth": "number", "altitude": "number"}', '{"min_layers": 1, "data_type": "raster"}', 'raster', 'gdal'),
('raster_calc', 'Raster Calculator', 'raster', 'algebra', 'Perform mathematical operations on rasters', '{"expression": "string"}', '{"min_layers": 1, "data_type": "raster"}', 'raster', 'gdal'),
('zonal_stats', 'Zonal Statistics', 'raster', 'analysis', 'Calculate statistics for zones', '{"statistics": "array"}', '{"min_layers": 2, "types": ["raster", "vector"]}', 'table', 'gdal'),
('land_cover_classify', 'Land Cover Classification', 'ai', 'classification', 'AI-powered land cover classification', '{"classes": "array", "model": "string"}', '{"min_layers": 1, "data_type": "raster"}', 'raster', 'python');

-- Create indexes
CREATE INDEX idx_spatial_projects_user ON public.spatial_analysis_projects(user_id);
CREATE INDEX idx_spatial_jobs_status ON public.spatial_processing_jobs(status);
CREATE INDEX idx_spatial_jobs_user ON public.spatial_processing_jobs(user_id);
CREATE INDEX idx_global_datasets_category ON public.global_spatial_datasets(category);
CREATE INDEX idx_spatial_tools_category ON public.spatial_analysis_tools(category);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_spatial_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spatial_projects_timestamp
  BEFORE UPDATE ON public.spatial_analysis_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_spatial_analysis_updated_at();

CREATE TRIGGER update_spatial_quotas_timestamp
  BEFORE UPDATE ON public.spatial_analysis_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_spatial_analysis_updated_at();