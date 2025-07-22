-- Update professional users to have proper course enrollment and access
-- Set enrolled_courses to include "Geospatial Technology Unlocked" for professional emails
UPDATE public.profiles 
SET 
  plan = 'professional',
  enrolled_courses = CASE 
    WHEN NOT ('Geospatial Technology Unlocked' = ANY(enrolled_courses)) 
    THEN array_append(enrolled_courses, 'Geospatial Technology Unlocked')
    ELSE enrolled_courses
  END,
  enrolled_courses_count = CASE 
    WHEN enrolled_courses_count < 1 THEN 1
    ELSE enrolled_courses_count
  END,
  updated_at = now()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE public.is_professional_email(au.email)
);

-- Also ensure their subscriptions are set to pro tier
UPDATE public.user_subscriptions 
SET 
  subscription_tier = 'pro',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE public.is_professional_email(au.email)
) AND subscription_tier != 'pro';