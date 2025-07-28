-- Update RLS policies to allow super admin deletes across key tables

-- Admin uploads table
DROP POLICY IF EXISTS "Admins can manage all uploads" ON public.admin_uploads;
CREATE POLICY "Admins can manage all uploads" 
ON public.admin_uploads 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

-- Marketplace tools table
DROP POLICY IF EXISTS "Admins can manage all tools" ON public.marketplace_tools;
CREATE POLICY "Admins can manage all tools" 
ON public.marketplace_tools 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

-- Class recordings table
DROP POLICY IF EXISTS "Admins can manage all recordings" ON public.class_recordings;
CREATE POLICY "Admins can manage all recordings" 
ON public.class_recordings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

-- Live streams table
DROP POLICY IF EXISTS "Admins can manage all streams" ON public.live_streams;
CREATE POLICY "Admins can manage all streams" 
ON public.live_streams 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

-- User portfolios for portfolio items
CREATE POLICY "Super admin can delete portfolios" 
ON public.user_portfolios 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

-- Community posts
CREATE POLICY "Super admin can delete posts" 
ON public.community_posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

-- Notes table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notes') THEN
    EXECUTE 'CREATE POLICY "Super admin can delete notes" ON public.notes FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND email = ''contact@haritahive.com''
      )
    )';
  END IF;
END $$;

-- Storage policies for super admin
CREATE POLICY "Super admin can delete from marketplace-tools" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'marketplace-tools' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can delete from admin-uploads" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'admin-uploads' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);