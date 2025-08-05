-- Insert default data sources
INSERT INTO public.geoai_data_sources (name, source_type, api_endpoint, data_formats, coverage_area, temporal_range, bands_available, resolution_meters, update_frequency, usage_limits, metadata) VALUES
('Sentinel Hub', 'sentinel_hub', 'https://services.sentinel-hub.com/api/v1/', 
 '["geotiff", "png", "jp2"]', 
 '{"type": "Polygon", "coordinates": [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]}',
 '{"start": "2016-01-01", "end": "2024-12-31"}',
 '["B02", "B03", "B04", "B08", "B11", "B12"]',
 10, 'daily',
 '{"requests_per_month": 1000, "data_gb_per_month": 10}',
 '{"provider": "ESA", "satellites": ["Sentinel-2A", "Sentinel-2B"]}'),

('NASA Earthdata', 'nasa_earthdata', 'https://earthdata.nasa.gov/api/v1/',
 '["hdf", "netcdf", "geotiff"]',
 '{"type": "Polygon", "coordinates": [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]}',
 '{"start": "2000-01-01", "end": "2024-12-31"}',
 '["MODIS_Terra", "MODIS_Aqua", "Landsat_8", "Landsat_9"]',
 30, 'daily',
 '{"requests_per_month": 500, "data_gb_per_month": 20}',
 '{"provider": "NASA", "missions": ["MODIS", "Landsat", "VIIRS"]}'),

('Copernicus Climate Data Store', 'copernicus', 'https://cds.climate.copernicus.eu/api/v2/',
 '["netcdf", "grib"]',
 '{"type": "Polygon", "coordinates": [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]}',
 '{"start": "1979-01-01", "end": "2024-12-31"}',
 '["temperature", "precipitation", "wind", "humidity"]',
 25000, 'monthly',
 '{"requests_per_month": 200, "data_gb_per_month": 50}',
 '{"provider": "ECMWF", "type": "reanalysis"}')

ON CONFLICT (name) DO NOTHING;

-- Insert default GeoAI models
INSERT INTO public.geoai_models (name, model_type, category, description, model_config, input_requirements, output_format, accuracy_metrics, is_gpu_required, processing_time_estimate) VALUES
('Urban Growth Predictor', 'regression', 'urban_growth', 'Predicts urban expansion using satellite imagery and demographic data',
 '{"algorithm": "Random Forest", "parameters": {"n_estimators": 100, "max_depth": 10}}',
 '{"bands": ["red", "green", "blue", "nir"], "resolution": "<=30m", "temporal": "multi-year"}',
 '{"type": "raster", "format": "geotiff", "values": "growth_probability"}',
 '{"accuracy": 0.89, "precision": 0.85, "recall": 0.92}',
 false, 300),

('Flood Risk Assessment', 'classification', 'flood_risk', 'Classifies areas by flood risk using DEM, rainfall, and land use data',
 '{"algorithm": "CNN", "architecture": "U-Net", "epochs": 50}',
 '{"elevation": "DEM", "precipitation": "rainfall_data", "land_cover": "classification"}',
 '{"type": "raster", "format": "geotiff", "classes": ["low", "medium", "high", "extreme"]}',
 '{"accuracy": 0.93, "f1_score": 0.91}',
 true, 600),

('Crop Yield Prediction', 'regression', 'crop_yield', 'Predicts crop yields using NDVI time series and weather data',
 '{"algorithm": "LSTM", "layers": 3, "neurons": 128}',
 '{"ndvi": "time_series", "weather": "temperature_precipitation", "soil": "properties"}',
 '{"type": "tabular", "format": "csv", "unit": "tons_per_hectare"}',
 '{"rmse": 0.12, "r2": 0.87}',
 true, 450),

('Heat Island Detection', 'classification', 'heat_islands', 'Identifies urban heat islands using thermal satellite imagery',
 '{"algorithm": "Support Vector Machine", "kernel": "rbf", "C": 1.0}',
 '{"thermal": "land_surface_temperature", "land_cover": "classification", "population": "density"}',
 '{"type": "vector", "format": "shapefile", "attribute": "heat_intensity"}',
 '{"accuracy": 0.86, "precision": 0.83}',
 false, 240),

('Groundwater Depletion Monitor', 'time_series', 'groundwater', 'Monitors groundwater levels using GRACE data and well measurements',
 '{"algorithm": "ARIMA", "order": [2, 1, 2], "seasonal": true}',
 '{"grace": "gravity_anomaly", "wells": "water_level", "precipitation": "historical"}',
 '{"type": "time_series", "format": "csv", "unit": "cm_equivalent"}',
 '{"mae": 2.3, "mape": 8.5}',
 false, 180),

('Change Detection Analysis', 'change_detection', 'environmental', 'Detects land cover changes using multi-temporal satellite imagery',
 '{"algorithm": "Deep Learning", "architecture": "Siamese Network"}',
 '{"before": "satellite_image", "after": "satellite_image", "bands": ["rgb", "nir"]}',
 '{"type": "raster", "format": "geotiff", "values": "change_probability"}',
 '{"accuracy": 0.91, "change_detection_rate": 0.94}',
 true, 720),

('Vegetation Health Monitor', 'regression', 'environmental', 'Monitors vegetation health using spectral indices and climate data',
 '{"algorithm": "Gradient Boosting", "n_estimators": 200}',
 '{"spectral": "multispectral_indices", "climate": "temperature_precipitation"}',
 '{"type": "raster", "format": "geotiff", "values": "health_index"}',
 '{"r2": 0.82, "rmse": 0.15}',
 false, 360),

('Deforestation Alert System', 'classification', 'environmental', 'Real-time deforestation detection using high-resolution imagery',
 '{"algorithm": "CNN", "architecture": "ResNet-50", "transfer_learning": true}',
 '{"imagery": "high_resolution", "bands": ["rgb", "nir", "swir"], "temporal": "near_real_time"}',
 '{"type": "vector", "format": "geojson", "attribute": "deforestation_confidence"}',
 '{"accuracy": 0.95, "false_positive_rate": 0.03}',
 true, 900)

ON CONFLICT (name) DO NOTHING;