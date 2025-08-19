-- Grant Professional plan access to user by email
DO $$
DECLARE 
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE lower(email) = lower('alisha110bpl@gmail.com')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users', 'alisha110bpl@gmail.com';
  END IF;

  -- Upsert Pro subscription
  INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, started_at, expires_at, created_at, updated_at)
  VALUES (v_user_id, 'pro', 'active', now(), NULL, now(), now())
  ON CONFLICT (user_id) DO UPDATE
    SET subscription_tier = 'pro',
        status = 'active',
        expires_at = NULL,
        updated_at = now();

  -- Also reflect plan at profile level if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plan'
  ) THEN
    UPDATE public.profiles 
    SET plan = 'pro', updated_at = now()
    WHERE id = v_user_id;
  END IF;
END $$;