-- Add Remote Sensing theoretical class recording
INSERT INTO public.class_recordings (
    title,
    description,
    youtube_url,
    is_public,
    created_by,
    view_count
) VALUES (
    'Remote Sensing - A Theoretical Class',
    'A comprehensive theoretical introduction to remote sensing concepts and applications.',
    'https://www.youtube.com/watch?v=zVqAqkUWZ3I',
    true,
    (SELECT id FROM auth.users WHERE email = 'contact@haritahive.com' LIMIT 1),
    0
);