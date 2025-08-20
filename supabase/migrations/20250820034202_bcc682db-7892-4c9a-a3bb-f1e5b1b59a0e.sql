-- Grant Pro plan access to a specific email
DO $$
DECLARE 
  v_user_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE lower(email) = lower('umakundla@gmail.com') 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found for email: %', 'umakundla@gmail.com';
  ELSE
    -- Upsert Pro subscription
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, started_at, expires_at, updated_at)
    VALUES (v_user_id, 'pro', 'active', now(), NULL, now())
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'pro',
      status = 'active',
      expires_at = NULL,
      updated_at = now();

    -- Optionally reflect in profiles.plan when present
    BEGIN
      UPDATE public.profiles 
      SET plan = 'pro', updated_at = now()
      WHERE id = v_user_id;
    EXCEPTION WHEN undefined_table THEN 
      -- If profiles or column doesn't exist, skip without failing
      NULL;
    END;
  END IF;
END $$;