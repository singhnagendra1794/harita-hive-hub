-- Create policies for live_recordings (Professional Plan only)
CREATE POLICY "professional_users_can_view_recordings" ON public.live_recordings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND subscription_tier IN ('professional', 'pro', 'enterprise')
      AND status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'contact@haritahive.com'
    )
  );

-- Admins can manage recordings
CREATE POLICY "admins_can_manage_recordings" ON public.live_recordings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'contact@haritahive.com'
    )
  );