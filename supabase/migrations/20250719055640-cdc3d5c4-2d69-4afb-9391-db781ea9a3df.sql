-- Create download logs table for tracking GIS tool downloads
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT,
  download_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  download_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for download logs
CREATE POLICY "Users can view their own download logs" 
ON public.download_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert download logs" 
ON public.download_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update download logs" 
ON public.download_logs 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_tool_id ON public.download_logs(tool_id);
CREATE INDEX idx_download_logs_timestamp ON public.download_logs(download_timestamp);

-- Create GIS tools table for better data management
CREATE TABLE IF NOT EXISTS public.gis_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 14.99,
  price_inr DECIMAL(10,2) NOT NULL DEFAULT 1249,
  author_name TEXT,
  author_id UUID REFERENCES auth.users(id),
  programming_language TEXT,
  compatible_software TEXT[],
  is_qgis_compatible BOOLEAN DEFAULT false,
  is_offline_capable BOOLEAN DEFAULT false,
  includes_sample_data BOOLEAN DEFAULT false,
  includes_documentation BOOLEAN DEFAULT false,
  file_size TEXT,
  download_url TEXT,
  preview_images TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated DATE
);

-- Enable Row-Level Security on gis_tools
ALTER TABLE public.gis_tools ENABLE ROW LEVEL SECURITY;

-- Create policies for gis_tools
CREATE POLICY "Anyone can view active tools" 
ON public.gis_tools 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authors can manage their own tools" 
ON public.gis_tools 
FOR ALL 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all tools" 
ON public.gis_tools 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- Create indexes for gis_tools
CREATE INDEX idx_gis_tools_category ON public.gis_tools(category);
CREATE INDEX idx_gis_tools_price ON public.gis_tools(price_usd);
CREATE INDEX idx_gis_tools_rating ON public.gis_tools(rating);
CREATE INDEX idx_gis_tools_featured ON public.gis_tools(is_featured);
CREATE INDEX idx_gis_tools_active ON public.gis_tools(is_active);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_gis_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gis_tools_updated_at_trigger
    BEFORE UPDATE ON public.gis_tools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_gis_tools_updated_at();

-- Insert sample GIS tools data
INSERT INTO public.gis_tools (
  id, title, description, category, author_name, programming_language, 
  compatible_software, is_qgis_compatible, is_offline_capable, 
  includes_sample_data, includes_documentation, file_size, 
  download_url, rating, download_count, is_featured
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Advanced Spatial Analysis Toolkit',
  'Complete toolkit for advanced spatial analysis including clustering, hotspot analysis, and network analysis tools. Includes Python scripts, QGIS plugins, and sample datasets.',
  'Analysis',
  'GeoSpatial Pro',
  'Python',
  ARRAY['QGIS', 'ArcGIS', 'PostGIS'],
  true,
  true,
  true,
  true,
  '45.2 MB',
  'https://example.com/downloads/spatial-analysis-toolkit.zip',
  4.8,
  1245,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Land Use Classification Scripts',
  'Machine learning scripts for automated land use classification from satellite imagery. Works offline with any GIS software and includes pre-trained models.',
  'Machine Learning',
  'Dr. Sarah Chen',
  'Python',
  ARRAY['QGIS', 'R Studio', 'Google Earth Engine'],
  true,
  true,
  true,
  true,
  '67.8 MB',
  'https://example.com/downloads/land-use-classification.zip',
  4.6,
  3421,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Web Mapping Dashboard Template',
  'Complete responsive web mapping dashboard template with admin panel and user management. QGIS-compatible data processing scripts included.',
  'Web Development',
  'WebGIS Solutions',
  'JavaScript',
  ARRAY['QGIS', 'Leaflet', 'Mapbox', 'OpenLayers'],
  true,
  false,
  true,
  true,
  '23.4 MB',
  'https://example.com/downloads/web-mapping-dashboard.zip',
  4.9,
  892,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'DEM Processing Utilities',
  'Comprehensive set of tools for Digital Elevation Model processing and terrain analysis. Fully compatible with QGIS and works offline.',
  'Data Processing',
  'TerrainTech',
  'Python',
  ARRAY['QGIS', 'GDAL', 'ArcGIS'],
  true,
  true,
  true,
  true,
  '34.7 MB',
  'https://example.com/downloads/dem-processing-utilities.zip',
  4.4,
  687,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Remote Sensing Image Analysis Suite',
  'Complete suite for satellite image analysis, band math, and vegetation indices calculation. Optimized for QGIS workflow.',
  'Remote Sensing',
  'RemoteSense Pro',
  'Python',
  ARRAY['QGIS', 'SNAP', 'ENVI'],
  true,
  true,
  true,
  true,
  '89.3 MB',
  'https://example.com/downloads/remote-sensing-suite.zip',
  4.7,
  1876,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Hydrological Modeling Toolkit',
  'Advanced tools for watershed analysis, flow accumulation, and flood modeling. Includes QGIS processing scripts and sample watersheds.',
  'Hydrology',
  'HydroGIS Labs',
  'Python',
  ARRAY['QGIS', 'GRASS GIS', 'HEC-RAS'],
  true,
  true,
  true,
  true,
  '56.1 MB',
  'https://example.com/downloads/hydro-modeling-toolkit.zip',
  4.5,
  543,
  false
);