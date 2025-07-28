-- Create functions to manage viewer counts for live streams
CREATE OR REPLACE FUNCTION increment_viewer_count(stream_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE live_classes 
  SET viewer_count = COALESCE(viewer_count, 0) + 1
  WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_viewer_count(stream_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE live_classes 
  SET viewer_count = GREATEST(COALESCE(viewer_count, 0) - 1, 0)
  WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql;