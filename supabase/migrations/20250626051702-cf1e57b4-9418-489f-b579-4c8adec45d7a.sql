
-- Add foreign key constraint to link discussions.user_id to profiles.id
ALTER TABLE public.discussions 
ADD CONSTRAINT discussions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON public.discussions(user_id);
