-- Fix security definer functions by adding search_path

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION generate_portfolio_url(p_user_id UUID, p_portfolio_title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT;
  counter INTEGER := 0;
  final_url TEXT;
BEGIN
  -- Create base URL from portfolio title
  base_url := lower(regexp_replace(p_portfolio_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_url := trim(both '-' from base_url);
  
  -- Ensure uniqueness
  final_url := base_url;
  WHILE EXISTS (SELECT 1 FROM user_portfolios WHERE public_url = final_url) LOOP
    counter := counter + 1;
    final_url := base_url || '-' || counter;
  END LOOP;
  
  RETURN final_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION track_portfolio_view(p_portfolio_id UUID, p_visitor_ip TEXT DEFAULT NULL, p_user_agent TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Update view count
  UPDATE user_portfolios 
  SET view_count = view_count + 1 
  WHERE id = p_portfolio_id;
  
  -- Insert analytics
  INSERT INTO portfolio_analytics (portfolio_id, user_id, event_type, visitor_ip, user_agent)
  SELECT p_portfolio_id, user_id, 'view', p_visitor_ip, p_user_agent
  FROM user_portfolios 
  WHERE id = p_portfolio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';