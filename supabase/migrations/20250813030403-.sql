-- Update is_professional_email to include the new email
CREATE OR REPLACE FUNCTION public.is_professional_email(email_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if email is in the professional list or from academic/research domains
  RETURN email_input ~* '\\.(edu|ac\\.|gov|org)$' 
    OR email_input ~* '@(university|college|institute|research|academic)'
    OR email_input = ANY(ARRAY[
        'bhumip107@gmail.com',
        'kondojukushi10@gmail.com',
        'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com',
        'Tanishkatyagi7500@gmail.com',
        'kamakshiiit@gmail.com',
        'Nareshkumar.tamada@gmail.com',
        'Geospatialshekhar@gmail.com',
        'ps.priyankasingh26996@gmail.com',
        'madhubalapriya2@gmail.com',
        'munmund66@gmail.com',
        'sujansapkota27@gmail.com',
        'sanjanaharidasan@gmail.com',
        'ajays301298@gmail.com',
        'jeevanleo2310@gmail.com',
        'geoaiguru@gmail.com',
        'rashidmsdian@gmail.com',
        'bharath.viswakarma@gmail.com',
        'shaliniazh@gmail.com',
        'sg17122004@gmail.com',
        'veenapoovukal@gmail.com',
        'asadullahm031@gmail.com',
        'moumitadas19996@gmail.com',
        'javvad.rizvi@gmail.com',
        'mandadi.jyothi123@gmail.com',
        'udaypbrn@gmail.com',
        'alisha110bpl@gmail.com'
    ]);
END;
$function$;