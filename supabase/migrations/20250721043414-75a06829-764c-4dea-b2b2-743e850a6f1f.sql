-- Insert a sample upcoming session for the course
INSERT INTO public.live_classes (
  title,
  description,
  stream_key,
  status,
  start_time,
  end_time,
  created_by,
  thumbnail_url,
  course_title
) VALUES (
  'Advanced GIS Analytics with Python',
  'Learn advanced geospatial analysis techniques using Python libraries like GeoPandas, Folium, and Rasterio. We will cover spatial joins, buffer analysis, and creating interactive maps.',
  'geotech_python_' || encode(gen_random_bytes(8), 'hex'),
  'scheduled',
  now() + INTERVAL '3 days',
  now() + INTERVAL '3 days' + INTERVAL '2 hours',
  (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1),
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'Geospatial Technology Unlocked'
),
(
  'Satellite Image Analysis Workshop',
  'Hands-on workshop covering satellite imagery preprocessing, classification, and analysis using QGIS and Python. Perfect for remote sensing enthusiasts.',
  'geotech_satellite_' || encode(gen_random_bytes(8), 'hex'),
  'scheduled',
  now() + INTERVAL '5 days',
  now() + INTERVAL '5 days' + INTERVAL '90 minutes',
  (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1),
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop',
  'Geospatial Technology Unlocked'
) ON CONFLICT DO NOTHING;