-- Update the is_professional_email function to replace ps.priyankasingh26996@gmail.com with priyankasingh26996@yahoo.com
CREATE OR REPLACE FUNCTION public.is_professional_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'priyankasingh26996@yahoo.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com'
  ];
BEGIN
  RETURN LOWER(email_to_check) = ANY(pro_emails);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing users with professional access based on the updated email list
UPDATE public.user_subscriptions 
SET subscription_tier = 'pro', 
    status = 'active', 
    updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE public.is_professional_email(email)
);

UPDATE public.profiles 
SET plan = 'professional', 
    updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE public.is_professional_email(email)
);