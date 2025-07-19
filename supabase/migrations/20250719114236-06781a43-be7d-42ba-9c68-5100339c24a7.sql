-- Update full names for professional users
UPDATE public.profiles 
SET full_name = CASE 
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'bhumip107@gmail.com') THEN 'Bhumika Parmar'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'kondojukushi10@gmail.com') THEN 'Kushi Kondoju'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'adityapipil35@gmail.com') THEN 'Aditya Pipil'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'mukherjeejayita14@gmail.com') THEN 'Jayita Mukherjee'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'tanishkatyagi7500@gmail.com') THEN 'Tanishka Tyagi'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'kamakshiiit@gmail.com') THEN 'Kamakshi Rayavarapu'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'nareshkumar.tamada@gmail.com') THEN 'Naresh Tamada'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'geospatialshekhar@gmail.com') THEN 'Chandrashekhar Singh'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'ps.priyankasingh26996@gmail.com') THEN 'Priyanka Singh'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'priyankasingh26996@yahoo.com') THEN 'Priyanka Singh'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'madhubalapriya2@gmail.com') THEN 'Madhubala Priya'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'munmund66@gmail.com') THEN 'Moon Moon Das'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'sujansapkota27@gmail.com') THEN 'Sujan Sapkota'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'sanjanaharidasan@gmail.com') THEN 'Sanjana A H'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'ajays301298@gmail.com') THEN 'Ajeeth S'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'jeevanleo2310@gmail.com') THEN 'Jeevan M P'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'geoaiguru@gmail.com') THEN 'Gurudatta K. N.'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'rashidmsdian@gmail.com') THEN 'Mohamed Rashid S'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'bharath.viswakarma@gmail.com') THEN 'Bharath A L'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'shaliniazh@gmail.com') THEN 'Shalini Seralathan'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'sg17122004@gmail.com') THEN 'Shaunak Ghosh'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'veenapoovukal@gmail.com') THEN 'Veena AV'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'asadullahm031@gmail.com') THEN 'Asad Ullah'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'moumitadas19996@gmail.com') THEN 'Moumita Das'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'javvad.rizvi@gmail.com') THEN 'Javvad Hasan Rizvi'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'mandadi.jyothi123@gmail.com') THEN 'Mandadi Gnana Jyothi'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'udaypbrn@gmail.com') THEN 'Rama Paluri'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'anshumanavasthi1411@gmail.com') THEN 'Anshuman Avasthi'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'sruthythulasi2017@gmail.com') THEN 'SREESRUTHY M S'
  WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id AND auth.users.email = 'nagendrasingh1794@gmail.com') THEN 'Nagendra Singh'
  ELSE full_name
END,
updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.id = profiles.id 
  AND auth.users.email IN (
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'priyankasingh26996@yahoo.com', 'madhubalapriya2@gmail.com', 'munmund66@gmail.com',
    'sujansapkota27@gmail.com', 'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com',
    'jeevanleo2310@gmail.com', 'geoaiguru@gmail.com', 'rashidmsdian@gmail.com',
    'bharath.viswakarma@gmail.com', 'shaliniazh@gmail.com', 'sg17122004@gmail.com',
    'veenapoovukal@gmail.com', 'asadullahm031@gmail.com', 'moumitadas19996@gmail.com',
    'javvad.rizvi@gmail.com', 'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com',
    'anshumanavasthi1411@gmail.com', 'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com'
  )
);