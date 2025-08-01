-- Add YouTube video UqUDI4Kzors to class recordings
INSERT INTO public.class_recordings (
  id,
  title,
  description,
  youtube_url,
  is_public,
  created_by,
  duration_seconds,
  view_count,
  download_count,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Geospatial Technology Session',
  'Professional geospatial technology training session covering advanced concepts and practical applications.',
  'https://www.youtube.com/embed/UqUDI4Kzors?si=A1-PFPklHbOZvVZQ',
  true,
  get_super_admin_user_id(),
  0, -- Duration will be updated when available
  0,
  0,
  now(),
  now()
);