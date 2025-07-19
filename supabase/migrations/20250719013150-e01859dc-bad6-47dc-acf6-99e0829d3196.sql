-- Fix the RLS policy for job_listings
DROP POLICY IF EXISTS "Anyone can view active job listings" ON job_listings;

CREATE POLICY "Anyone can view active job listings"
ON job_listings FOR SELECT
USING (true); -- Allow all active jobs to be viewed publicly

-- Update the existing sample data to ensure they're marked as active
UPDATE job_listings SET is_active = true WHERE is_active IS NULL;