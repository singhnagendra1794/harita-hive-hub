-- Add course_title column to live_classes table for course association
ALTER TABLE public.live_classes 
ADD COLUMN IF NOT EXISTS course_title TEXT DEFAULT 'General';

-- Update existing live classes to be part of "Geospatial Technology Unlocked" course
UPDATE public.live_classes 
SET course_title = 'Geospatial Technology Unlocked'
WHERE course_title IS NULL OR course_title = 'General';

-- Create index for better performance when filtering by course
CREATE INDEX IF NOT EXISTS idx_live_classes_course_title ON public.live_classes(course_title);

-- Add 'scheduled' to the existing stream_status enum
ALTER TYPE stream_status ADD VALUE IF NOT EXISTS 'scheduled';