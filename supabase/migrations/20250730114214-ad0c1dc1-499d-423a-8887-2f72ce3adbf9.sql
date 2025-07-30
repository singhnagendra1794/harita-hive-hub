-- Clean up invalid live classes data and improve data quality
-- Remove entries with invalid titles or minimal content
DELETE FROM live_classes 
WHERE title = '0' 
   OR title = '' 
   OR title IS NULL 
   OR (title = 'Live Stream - Auto Detected' AND description IS NULL);

-- Update remaining live classes to have better defaults
UPDATE live_classes 
SET 
  title = CASE 
    WHEN title = 'Live Stream - Auto Detected' THEN 'HaritaHive Live Session'
    WHEN title LIKE '%Live Stream%' AND length(title) < 20 THEN 'HaritaHive Live Training'
    ELSE title 
  END,
  description = CASE 
    WHEN description IS NULL OR description = '' THEN 'Interactive live training session from HaritaHive Studio'
    ELSE description 
  END,
  instructor = CASE 
    WHEN instructor IS NULL OR instructor = '' THEN 'HaritaHive Team'
    ELSE instructor 
  END,
  access_tier = CASE 
    WHEN access_tier IS NULL THEN 'professional'
    ELSE access_tier 
  END
WHERE status = 'live';

-- Ensure all live classes have proper embed URLs if they have YouTube URLs
UPDATE live_classes 
SET embed_url = CASE 
  WHEN youtube_url IS NOT NULL AND embed_url IS NULL THEN 
    CASE 
      WHEN youtube_url LIKE '%youtube.com/watch?v=%' THEN 
        'https://www.youtube-nocookie.com/embed/' || 
        substring(youtube_url from 'v=([^&]+)') || 
        '?autoplay=0&modestbranding=1&rel=0&controls=1'
      WHEN youtube_url LIKE '%youtu.be/%' THEN 
        'https://www.youtube-nocookie.com/embed/' || 
        substring(youtube_url from 'youtu.be/([^?]+)') || 
        '?autoplay=0&modestbranding=1&rel=0&controls=1'
      ELSE embed_url
    END
  ELSE embed_url 
END
WHERE youtube_url IS NOT NULL;