-- Grant Pro access to a specific user by email
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user by email from profiles (avoids touching auth schema)
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE lower(email) = lower('alisha110bpl@gmail.com')
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No profile found for email %; skipping update', 'alisha110bpl@gmail.com';
    RETURN;
  END IF;

  -- Upsert Pro subscription as active with no expiry
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, expires_at, updated_at)
  VALUES (target_user_id, 'pro', 'active', NULL, now())
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = 'pro',
    status = 'active',
    expires_at = NULL,
    updated_at = now();

  -- Also reflect plan in profiles for consistency
  UPDATE public.profiles
  SET plan = 'pro', updated_at = now()
  WHERE id = target_user_id;
END $$;