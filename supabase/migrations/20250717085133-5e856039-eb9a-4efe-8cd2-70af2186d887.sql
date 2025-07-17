-- Update nagendrasingh1794@gmail.com to professional plan and reset stats
UPDATE public.profiles
SET 
  plan = 'professional',
  course_count = 0,
  projects_completed = 0,
  community_posts = 0
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'nagendrasingh1794@gmail.com'
);

-- Add spatial_analyses column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS spatial_analyses integer DEFAULT 0;