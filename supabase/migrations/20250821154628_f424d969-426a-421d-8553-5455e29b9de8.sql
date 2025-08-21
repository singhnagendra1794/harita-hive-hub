-- Add a lock flag to prevent automatic plan changes
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS plan_locked boolean NOT NULL DEFAULT false;

-- Helpful index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_locked
  ON public.user_subscriptions (user_id, plan_locked);
