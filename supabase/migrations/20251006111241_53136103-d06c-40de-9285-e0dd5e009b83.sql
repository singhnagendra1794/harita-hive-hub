
-- Revoke pro access for users not in the allowed list
UPDATE user_subscriptions
SET 
  subscription_tier = 'free',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT us.user_id
  FROM user_subscriptions us
  JOIN auth.users au ON us.user_id = au.id
  WHERE us.subscription_tier = 'pro'
    AND au.email NOT IN (
      'kondojukushi10@gmail.com',
      'adityapipil35@gmail.com',
      'mukherjeejayita14@gmail.com',
      'tanishkatyagi7500@gmail.com',
      'kamakshiiit@gmail.com',
      'nareshkumar.tamada@gmail.com',
      'geospatialshekhar@gmail.com',
      'madhubalapriya2@gmail.com',
      'munmund66@gmail.com',
      'sujansapkota27@gmail.com',
      'sanjanaharidasan@gmail.com',
      'ajays301298@gmail.com',
      'jeevanleo2310@gmail.com',
      'geoaiguru@gmail.com',
      'veenapoovukal@gmail.com',
      'asadullahm031@gmail.com',
      'moumitadas19996@gmail.com',
      'javvad.rizvi@gmail.com',
      'jyothimandadi8@gmail.com',
      'anshumanavasthi1411@gmail.com',
      'sruthythulasi2017@gmail.com',
      'tharun.ravichandran@gmail.com',
      'vanditaujwal8@gmail.com',
      'betweenlinesengineering@gmail.com',
      'vishwajrathod@gmail.com',
      'alisha110bpl@gmail.com',
      'vivekmalik0357@gmail.com',
      'syedarshiya2110@gmail.com',
      'maneetsethi954@gmail.com',
      'warriorrockz@gmail.com',
      'umakundla@gmail.com',
      'kowshika199810@gmail.com'
    )
);

-- Also update the profiles table plan column
UPDATE profiles
SET 
  plan = 'free',
  updated_at = now()
WHERE id IN (
  SELECT us.user_id
  FROM user_subscriptions us
  JOIN auth.users au ON us.user_id = au.id
  WHERE us.subscription_tier = 'free'
    AND au.email NOT IN (
      'kondojukushi10@gmail.com',
      'adityapipil35@gmail.com',
      'mukherjeejayita14@gmail.com',
      'tanishkatyagi7500@gmail.com',
      'kamakshiiit@gmail.com',
      'nareshkumar.tamada@gmail.com',
      'geospatialshekhar@gmail.com',
      'madhubalapriya2@gmail.com',
      'munmund66@gmail.com',
      'sujansapkota27@gmail.com',
      'sanjanaharidasan@gmail.com',
      'ajays301298@gmail.com',
      'jeevanleo2310@gmail.com',
      'geoaiguru@gmail.com',
      'veenapoovukal@gmail.com',
      'asadullahm031@gmail.com',
      'moumitadas19996@gmail.com',
      'javvad.rizvi@gmail.com',
      'jyothimandadi8@gmail.com',
      'anshumanavasthi1411@gmail.com',
      'sruthythulasi2017@gmail.com',
      'tharun.ravichandran@gmail.com',
      'vanditaujwal8@gmail.com',
      'betweenlinesengineering@gmail.com',
      'vishwajrathod@gmail.com',
      'alisha110bpl@gmail.com',
      'vivekmalik0357@gmail.com',
      'syedarshiya2110@gmail.com',
      'maneetsethi954@gmail.com',
      'warriorrockz@gmail.com',
      'umakundla@gmail.com',
      'kowshika199810@gmail.com'
    )
  AND plan != 'free'
);
