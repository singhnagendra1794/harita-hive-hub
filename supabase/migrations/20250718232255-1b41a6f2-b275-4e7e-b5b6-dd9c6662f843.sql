-- Add missing columns and constraints for QGIS plugin compatibility
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS qgis_min_version TEXT;
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS plugin_id TEXT; -- QGIS plugin identifier
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS plugin_icon_url TEXT;
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS installation_guide TEXT;
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS compatibility_notes TEXT;
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS dependencies TEXT[]; -- Required dependencies
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS minimum_requirements JSONB DEFAULT '{}';
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS installation_verified BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS security_scanned BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_tools ADD COLUMN IF NOT EXISTS scan_results JSONB DEFAULT '{}';

-- Create plugin compatibility tracking table
CREATE TABLE IF NOT EXISTS public.plugin_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES marketplace_tools(id) ON DELETE CASCADE,
  qgis_version TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'windows', 'linux', 'mac'
  compatibility_status TEXT NOT NULL, -- 'compatible', 'incompatible', 'partial', 'untested'
  test_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tester_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create installation instructions table
CREATE TABLE IF NOT EXISTS public.installation_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES marketplace_tools(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction_text TEXT NOT NULL,
  screenshot_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update RLS policies
ALTER TABLE public.plugin_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installation_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view compatibility info" ON public.plugin_compatibility
FOR SELECT USING (true);

CREATE POLICY "Anyone can view installation instructions" ON public.installation_instructions  
FOR SELECT USING (true);

CREATE POLICY "Admins can manage compatibility" ON public.plugin_compatibility
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage instructions" ON public.installation_instructions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to check premium access for downloads
CREATE OR REPLACE FUNCTION public.can_download_premium_plugin(p_user_id UUID, p_tool_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tool_is_free BOOLEAN;
  user_has_premium BOOLEAN;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if tool is free
  SELECT is_free INTO tool_is_free
  FROM marketplace_tools
  WHERE id = p_tool_id;
  
  -- If tool is free, allow download
  IF tool_is_free THEN
    RETURN true;
  END IF;
  
  -- Check if user is super admin
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = p_user_id 
    AND email = 'contact@haritahive.com'
  ) INTO is_super_admin;
  
  IF is_super_admin THEN
    RETURN true;
  END IF;
  
  -- Check if user has premium access
  SELECT user_has_premium_access(p_user_id) INTO user_has_premium;
  
  RETURN user_has_premium;
END;
$$;

-- Insert sample QGIS-compatible plugins with proper metadata
INSERT INTO public.marketplace_tools (
  title, description, category, tool_type, tech_stack, tags,
  download_url, github_url, license_type, version, qgis_min_version,
  is_free, base_price_usd, base_price_inr, is_featured, is_verified,
  rating, rating_count, download_count, status, file_size_mb,
  plugin_id, installation_guide, compatibility_notes, dependencies,
  installation_verified, security_scanned
) VALUES 
(
  'Advanced Buffer Analysis Plugin',
  'Professional QGIS plugin for creating complex buffers with varying distances, custom shapes, and advanced spatial analysis. Includes metadata.txt, proper Python structure, and comprehensive documentation.',
  'Vector',
  'qgis_plugin',
  ARRAY['Python', 'QGIS', 'PyQt5'],
  ARRAY['Vector', 'Spatial Analysis', 'Buffer', 'Professional'],
  'https://haritahive.com/downloads/advanced-buffer-plugin.zip',
  'https://github.com/haritahive/advanced-buffer-plugin',
  'MIT',
  '2.1.0',
  '3.22',
  false,
  29.99,
  2499,
  true,
  true,
  4.8,
  156,
  1250,
  'active',
  2.5,
  'advanced_buffer_analysis',
  'Install via QGIS Plugin Manager or manually extract to plugins folder',
  'Compatible with QGIS 3.22+, requires Python 3.8+',
  ARRAY['PyQt5', 'qgis-core'],
  true,
  true
),
(
  'Free NDVI Calculator',
  'Open-source QGIS plugin for calculating NDVI from satellite imagery. Properly packaged with all required files including metadata.txt, icon.png, and sample data.',
  'Remote Sensing',
  'qgis_plugin', 
  ARRAY['Python', 'QGIS', 'NumPy', 'GDAL'],
  ARRAY['NDVI', 'Remote Sensing', 'Free', 'Open Source'],
  'https://haritahive.com/downloads/ndvi-calculator.zip',
  'https://github.com/haritahive/ndvi-calculator',
  'MIT',
  '1.2.0',
  '3.16',
  true,
  0,
  0,
  true,
  true,
  4.6,
  284,
  3240,
  'active',
  1.8,
  'ndvi_calculator',
  'Download ZIP file and install via QGIS > Plugins > Manage and Install Plugins > Install from ZIP',
  'Works on Windows, Linux, and macOS. Minimum QGIS 3.16 required.',
  ARRAY['numpy', 'gdal'],
  true,
  true
);

-- Insert installation instructions
INSERT INTO public.installation_instructions (tool_id, step_number, instruction_text) 
SELECT id, 1, 'Download the plugin ZIP file from the marketplace'
FROM marketplace_tools WHERE plugin_id = 'advanced_buffer_analysis';

INSERT INTO public.installation_instructions (tool_id, step_number, instruction_text)
SELECT id, 2, 'Open QGIS and go to Plugins > Manage and Install Plugins'
FROM marketplace_tools WHERE plugin_id = 'advanced_buffer_analysis';

INSERT INTO public.installation_instructions (tool_id, step_number, instruction_text)
SELECT id, 3, 'Click "Install from ZIP" tab and select the downloaded file'
FROM marketplace_tools WHERE plugin_id = 'advanced_buffer_analysis';

INSERT INTO public.installation_instructions (tool_id, step_number, instruction_text)
SELECT id, 4, 'Click "Install Plugin" and enable the plugin in the Installed tab'
FROM marketplace_tools WHERE plugin_id = 'advanced_buffer_analysis';

-- Insert compatibility data
INSERT INTO public.plugin_compatibility (tool_id, qgis_version, platform, compatibility_status, notes)
SELECT id, '3.22', 'windows', 'compatible', 'Fully tested and working'
FROM marketplace_tools WHERE plugin_id = 'advanced_buffer_analysis';

INSERT INTO public.plugin_compatibility (tool_id, qgis_version, platform, compatibility_status, notes)
SELECT id, '3.34', 'linux', 'compatible', 'Tested on Ubuntu 22.04'
FROM marketplace_tools WHERE plugin_id = 'advanced_buffer_analysis';