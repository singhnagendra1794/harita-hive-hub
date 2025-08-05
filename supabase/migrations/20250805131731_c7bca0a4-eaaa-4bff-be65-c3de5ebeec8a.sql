-- Create comprehensive GeoAI system tables

-- GeoAI Data Sources table for managing satellite/remote sensing data connections
CREATE TABLE IF NOT EXISTS public.geoai_data_sources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'sentinel_hub', 'nasa_earthdata', 'copernicus', 'grace', 'custom'
    api_endpoint TEXT,
    authentication_config JSONB DEFAULT '{}',
    data_formats JSONB DEFAULT '[]', -- supported formats like 'geotiff', 'netcdf', etc.
    coverage_area JSONB, -- geographic bounds
    temporal_range JSONB, -- time range available
    bands_available JSONB DEFAULT '[]',
    resolution_meters NUMERIC,
    update_frequency TEXT, -- 'daily', 'weekly', 'monthly'
    is_active BOOLEAN DEFAULT true,
    usage_limits JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GeoAI Models table for managing AI/ML models
CREATE TABLE IF NOT EXISTS public.geoai_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    model_type TEXT NOT NULL, -- 'classification', 'regression', 'change_detection', 'time_series', 'object_detection'
    category TEXT NOT NULL, -- 'urban_growth', 'flood_risk', 'crop_yield', 'heat_islands', 'groundwater'
    description TEXT,
    model_config JSONB DEFAULT '{}',
    input_requirements JSONB DEFAULT '{}', -- required data types, bands, resolution
    output_format JSONB DEFAULT '{}',
    accuracy_metrics JSONB DEFAULT '{}',
    computational_requirements JSONB DEFAULT '{}',
    model_file_path TEXT,
    model_version TEXT DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    is_gpu_required BOOLEAN DEFAULT false,
    processing_time_estimate INTEGER, -- in seconds
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GeoAI Workflows table for no-code workflow management
CREATE TABLE IF NOT EXISTS public.geoai_workflows (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    workflow_type TEXT NOT NULL, -- 'template', 'custom', 'shared'
    workflow_config JSONB NOT NULL DEFAULT '{}', -- complete workflow definition
    data_sources JSONB DEFAULT '[]', -- references to data sources
    models_used JSONB DEFAULT '[]', -- references to models
    processing_steps JSONB DEFAULT '[]',
    output_config JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    average_rating NUMERIC DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    estimated_runtime INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GeoAI Jobs table for tracking workflow executions
CREATE TABLE IF NOT EXISTS public.geoai_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    workflow_id UUID REFERENCES public.geoai_workflows(id),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed', 'cancelled'
    progress INTEGER DEFAULT 0, -- 0-100
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    processing_logs JSONB DEFAULT '[]',
    error_message TEXT,
    computational_cost NUMERIC DEFAULT 0,
    processing_time INTEGER, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GeoAI Usage Tracking for plan limits
CREATE TABLE IF NOT EXISTS public.geoai_usage_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    month_year TEXT NOT NULL, -- 'YYYY-MM' format
    jobs_executed INTEGER DEFAULT 0,
    compute_minutes_used NUMERIC DEFAULT 0,
    data_processed_gb NUMERIC DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    storage_used_gb NUMERIC DEFAULT 0,
    plan_tier TEXT NOT NULL DEFAULT 'free',
    limits JSONB DEFAULT '{}', -- monthly limits based on plan
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, month_year)
);

-- GeoAI Data Layers for managing spatial data
CREATE TABLE IF NOT EXISTS public.geoai_data_layers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    layer_name TEXT NOT NULL,
    layer_type TEXT NOT NULL, -- 'raster', 'vector', 'point_cloud'
    data_source_id UUID REFERENCES public.geoai_data_sources(id),
    file_path TEXT,
    file_size_bytes BIGINT,
    file_format TEXT,
    spatial_reference TEXT, -- EPSG code
    bounding_box JSONB, -- geographic extent
    temporal_info JSONB, -- time information
    bands_info JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    processing_level TEXT, -- 'raw', 'processed', 'analysis_ready'
    is_public BOOLEAN DEFAULT false,
    access_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GeoAI Results for storing analysis outputs
CREATE TABLE IF NOT EXISTS public.geoai_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.geoai_jobs(id),
    user_id UUID NOT NULL,
    result_type TEXT NOT NULL, -- 'classification_map', 'prediction', 'change_detection', 'statistics'
    result_data JSONB NOT NULL DEFAULT '{}',
    output_files JSONB DEFAULT '[]', -- file paths/URLs
    accuracy_metrics JSONB DEFAULT '{}',
    confidence_scores JSONB DEFAULT '{}',
    visualization_config JSONB DEFAULT '{}',
    export_formats JSONB DEFAULT '["geotiff", "shapefile", "csv"]',
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_geoai_workflows_user_id ON public.geoai_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_geoai_workflows_type ON public.geoai_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_geoai_jobs_user_id ON public.geoai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_geoai_jobs_status ON public.geoai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_geoai_jobs_workflow_id ON public.geoai_jobs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_geoai_usage_tracking_user_month ON public.geoai_usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_geoai_data_layers_user_id ON public.geoai_data_layers(user_id);
CREATE INDEX IF NOT EXISTS idx_geoai_results_job_id ON public.geoai_results(job_id);
CREATE INDEX IF NOT EXISTS idx_geoai_results_user_id ON public.geoai_results(user_id);

-- Enable RLS on all tables
ALTER TABLE public.geoai_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_data_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geoai_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data sources (public read, admin manage)
CREATE POLICY "Anyone can view active data sources" ON public.geoai_data_sources
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage data sources" ON public.geoai_data_sources
    FOR ALL USING (is_admin_secure());

-- RLS Policies for models (public read, admin manage)
CREATE POLICY "Anyone can view active models" ON public.geoai_models
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage models" ON public.geoai_models
    FOR ALL USING (is_admin_secure());

-- RLS Policies for workflows (user owns or public)
CREATE POLICY "Users can view their own or public workflows" ON public.geoai_workflows
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own workflows" ON public.geoai_workflows
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for jobs (user owns)
CREATE POLICY "Users can view their own jobs" ON public.geoai_jobs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own jobs" ON public.geoai_jobs
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for usage tracking (user owns or admin)
CREATE POLICY "Users can view their own usage" ON public.geoai_usage_tracking
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" ON public.geoai_usage_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage records" ON public.geoai_usage_tracking
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage" ON public.geoai_usage_tracking
    FOR SELECT USING (is_admin_secure());

-- RLS Policies for data layers (user owns or public)
CREATE POLICY "Users can view their own or public data layers" ON public.geoai_data_layers
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own data layers" ON public.geoai_data_layers
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for results (user owns or public)
CREATE POLICY "Users can view their own or public results" ON public.geoai_results
    FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own results" ON public.geoai_results
    FOR ALL USING (user_id = auth.uid());