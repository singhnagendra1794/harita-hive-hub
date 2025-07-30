-- Enable realtime for live_classes table for immediate updates
ALTER TABLE public.live_classes REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'live_classes'
    ) 
    THEN 'live_classes already in realtime publication'
    ELSE (
      SELECT 'Adding live_classes to realtime publication' ||
      (SELECT pg_sleep(0.1)) ||
      (SELECT pg_publication.pubname FROM pg_publication WHERE pubname = 'supabase_realtime' LIMIT 1)
    )
  END as realtime_status;

-- Ensure table is in publication (this is idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'live_classes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_classes;
  END IF;
END $$;