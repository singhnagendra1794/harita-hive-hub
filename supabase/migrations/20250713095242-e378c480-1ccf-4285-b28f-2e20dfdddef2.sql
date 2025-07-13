-- Create increment download count function
CREATE OR REPLACE FUNCTION increment_download_count(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE project_templates 
  SET download_count = download_count + 1 
  WHERE id = template_id;
END;
$$;

-- Add foreign key relationships to fix the profile joins
ALTER TABLE challenge_submissions 
ADD CONSTRAINT challenge_submissions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE student_portfolios 
ADD CONSTRAINT student_portfolios_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;