-- Insert sample industry intelligence packs
INSERT INTO public.industry_intelligence_packs (
  name, category, description, long_description, tier, models_count, templates_count, datasets_count, 
  rating, users_count, is_featured, features, use_cases, color_scheme
) VALUES 
(
  'Urban Development Intelligence',
  'planning',
  'Smart city planning and urban growth analysis',
  'Comprehensive urban planning toolkit with AI-powered zoning recommendations, traffic flow optimization, and sustainable development insights.',
  'pro',
  15, 8, 12,
  4.8, 1250, true,
  '["Smart Zoning Recommendations", "Traffic Flow Simulation", "Urban Growth Forecasting", "Population Density Analysis", "Infrastructure Impact Assessment", "Green Space Optimization"]'::jsonb,
  '["City Master Planning", "Transit Route Optimization", "Housing Development Analysis", "Environmental Impact Studies"]'::jsonb,
  'bg-blue-500/20 text-blue-400 border-blue-500/30'
),
(
  'Agriculture Intelligence',
  'agriculture',
  'Precision farming and crop optimization suite',
  'Advanced agricultural analytics combining satellite imagery, IoT sensors, and AI models for optimal crop management and yield prediction.',
  'pro',
  12, 10, 15,
  4.9, 890, true,
  '["Crop Yield Prediction", "Soil Health Monitoring", "Water Usage Optimization", "Pest & Disease Detection", "Weather Pattern Analysis", "Harvest Timing Optimization"]'::jsonb,
  '["Precision Agriculture", "Irrigation Management", "Crop Insurance Assessment", "Supply Chain Planning"]'::jsonb,
  'bg-green-500/20 text-green-400 border-green-500/30'
),
(
  'Disaster Management',
  'emergency',
  'Real-time hazard detection and emergency response',
  'Comprehensive disaster preparedness and response system with real-time monitoring, predictive modeling, and automated alert systems.',
  'enterprise',
  18, 6, 20,
  4.7, 450, true,
  '["Flood Risk Assessment", "Wildfire Spread Modeling", "Earthquake Impact Analysis", "Evacuation Route Planning", "Resource Allocation Optimization", "Real-time Alert Systems"]'::jsonb,
  '["Emergency Response Planning", "Risk Assessment Studies", "Insurance Claims Processing", "Public Safety Management"]'::jsonb,
  'bg-red-500/20 text-red-400 border-red-500/30'
),
(
  'Climate & ESG Intelligence',
  'environment',
  'Carbon accounting and climate risk analysis',
  'Environmental, Social, and Governance analytics with carbon footprint tracking, climate risk assessment, and sustainability reporting.',
  'enterprise',
  10, 12, 18,
  4.6, 320, true,
  '["Carbon Footprint Tracking", "Climate Risk Scoring", "Biodiversity Impact Assessment", "ESG Compliance Reporting", "Renewable Energy Analysis", "Sustainability Metrics"]'::jsonb,
  '["Corporate ESG Reporting", "Climate Risk Assessment", "Carbon Trading", "Sustainable Investment Analysis"]'::jsonb,
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
);

-- Insert sample marketplace items
INSERT INTO public.marketplace_items (
  name, category, description, provider_name, price, currency, rating, download_count, 
  file_size_bytes, file_format, accuracy_score, features, tags, is_featured, is_free
) VALUES 
(
  'Global Land Cover Dataset 2024',
  'dataset',
  'High-resolution global land cover classification dataset with 30m spatial resolution',
  'Earth Observation Institute',
  0, 'USD',
  4.8, 12500,
  2500000000000, 'GeoTIFF, Shapefile', null,
  '["30m Resolution", "Global Coverage", "12 Land Cover Classes", "Quarterly Updates"]'::jsonb,
  '["land-cover", "classification", "satellite", "global"]'::jsonb,
  true, true
),
(
  'Crop Yield Prediction Model',
  'model',
  'AI model for predicting crop yields using satellite imagery and weather data',
  'AgriTech Solutions',
  50, 'credits',
  4.9, 890,
  null, null, 0.94,
  '["Multi-crop Support", "Weather Integration", "94% Accuracy", "API Access"]'::jsonb,
  '["agriculture", "yield-prediction", "ai-model", "satellite"]'::jsonb,
  true, false
),
(
  'Urban Heat Island Analysis Plugin',
  'plugin',
  'Advanced plugin for analyzing urban heat island effects and thermal patterns',
  'Urban Analytics Lab',
  29.99, 'USD',
  4.6, 2340,
  null, null, null,
  '["Thermal Analysis", "Heat Mapping", "Temporal Trends", "Export Tools"]'::jsonb,
  '["urban", "heat-island", "thermal", "analysis"]'::jsonb,
  false, false
),
(
  'Flood Risk Assessment Template',
  'template',
  'Complete workflow template for flood risk assessment and mapping',
  'Disaster Analytics Corp',
  25, 'credits',
  4.7, 1560,
  null, null, null,
  '["DEM Processing", "Hydrological Modeling", "Risk Mapping", "Report Generation"]'::jsonb,
  '["flood", "risk-assessment", "hydrology", "disaster"]'::jsonb,
  false, false
);

-- Initialize user credits for existing users (give them 150 credits each)
INSERT INTO public.user_credits (user_id, balance, earned_total)
SELECT 
  id as user_id,
  150 as balance,
  150 as earned_total
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET
  balance = GREATEST(user_credits.balance, 150),
  earned_total = GREATEST(user_credits.earned_total, 150);

-- Insert sample credit transactions for the initial credits
INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
SELECT 
  id as user_id,
  150 as amount,
  'reward' as transaction_type,
  'Welcome bonus - Phase 4 launch credits' as description
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.credit_transactions WHERE transaction_type = 'reward' AND description LIKE '%Welcome bonus%');