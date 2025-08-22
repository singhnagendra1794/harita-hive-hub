-- Ensure Pro access for correct email variant(s)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id FROM public.profiles 
    WHERE lower(email) IN (
      lower('alisha1110bpl@gmail.com'),
      lower('alisha110bpl@gmail.com')
    )
  LOOP
    -- Upsert Pro subscription as active with no expiry
    INSERT INTO public.user_subscriptions (user_id, subscription_tier, status, expires_at, updated_at)
    VALUES (rec.id, 'pro', 'active', NULL, now())
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_tier = 'pro',
      status = 'active',
      expires_at = NULL,
      updated_at = now();

    -- Reflect plan in profiles for consistency
    UPDATE public.profiles
    SET plan = 'pro', updated_at = now()
    WHERE id = rec.id;
  END LOOP;
END $$;