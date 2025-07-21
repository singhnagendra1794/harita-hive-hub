-- Update the is_professional_email function with the complete email list
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com', 'maneetsethi954@gmail.com',
    'tharun.ravichandran@gmail.com', 'ankushrathod96@gmail.com', 'dhiman.kashyap24@gmail.com',
    'vanditaujwal8@gmail.com', 'nkbhilbt650@gmail.com', 'singhnagendrageoltech@gmail.com'
  ];
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing users who should have professional access
UPDATE public.user_subscriptions 
SET subscription_tier = 'pro', 
    status = 'active', 
    updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE public.is_professional_email(email)
) AND subscription_tier != 'pro';

-- Update profiles for professional users
UPDATE public.profiles 
SET plan = 'professional', 
    enrolled_courses_count = CASE 
      WHEN enrolled_courses_count = 0 THEN 1 
      ELSE enrolled_courses_count 
    END,
    enrolled_courses = CASE 
      WHEN NOT ('Geospatial Technology Unlocked' = ANY(COALESCE(enrolled_courses, '{}'))) 
      THEN array_append(COALESCE(enrolled_courses, '{}'), 'Geospatial Technology Unlocked')
      ELSE enrolled_courses 
    END,
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE public.is_professional_email(email)
) AND plan != 'professional';