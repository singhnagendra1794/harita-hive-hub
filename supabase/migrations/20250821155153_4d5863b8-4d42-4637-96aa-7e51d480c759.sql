-- Assign Professional plan and lock for the premium email list
DO $$
DECLARE
  pro_emails TEXT[] := ARRAY[
    'bhumip107@gmail.com',
    'kondojukushi10@gmail.com',
    'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com',
    'tanishkatyagi7500@gmail.com',
    'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com',
    'geospatialshekhar@gmail.com',
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
    'udaypbrn@gmail.com'
  ];
BEGIN
  -- Normalize to lowercase for matching
  UPDATE profiles SET email = lower(email) WHERE email <> lower(email);

  -- Upsert subscriptions to pro and lock
  WITH targets AS (
    SELECT id FROM profiles WHERE email = ANY(pro_emails)
  )
  INSERT INTO user_subscriptions (user_id, subscription_tier, status, plan_locked, updated_at)
  SELECT id, 'pro', 'active', true, now() FROM targets
  ON CONFLICT (user_id) DO UPDATE
  SET subscription_tier = 'pro', status = 'active', plan_locked = true, updated_at = now();

  -- Update profiles plan to professional
  UPDATE profiles p
  SET plan = 'professional', updated_at = now()
  WHERE p.email = ANY(pro_emails);
END $$;

-- Revoke Professional for Kaveri and lock to free
DO $$
DECLARE
  revoke_email TEXT := 'kaverinayar2005@gmail.com';
BEGIN
  -- Ensure lowercase
  revoke_email := lower(revoke_email);

  WITH t AS (
    SELECT id FROM profiles WHERE email = revoke_email
  )
  INSERT INTO user_subscriptions (user_id, subscription_tier, status, plan_locked, updated_at)
  SELECT id, 'free', 'active', true, now() FROM t
  ON CONFLICT (user_id) DO UPDATE
  SET subscription_tier = 'free', status = 'active', plan_locked = true, updated_at = now();

  UPDATE profiles SET plan = 'free', updated_at = now() WHERE email = revoke_email;
END $$;