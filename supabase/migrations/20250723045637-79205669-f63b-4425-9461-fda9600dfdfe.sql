-- Portfolio Builder Enhancement Tables

-- User portfolios table
CREATE TABLE IF NOT EXISTS user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Portfolio',
  description TEXT,
  template_id UUID,
  is_public BOOLEAN DEFAULT false,
  public_url TEXT UNIQUE,
  theme_config JSONB DEFAULT '{}',
  layout_config JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  last_exported_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio templates table
CREATE TABLE IF NOT EXISTS portfolio_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'geoai', 'remote-sensing', 'planning', 'analyst', 'developer'
  preview_image_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resume generations table
CREATE TABLE IF NOT EXISTS resume_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
  format TEXT NOT NULL, -- 'pdf', 'docx', 'markdown', 'html'
  template_type TEXT NOT NULL, -- 'geoai', 'remote-sensing', etc.
  file_url TEXT,
  file_size INTEGER,
  generation_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio analytics table
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'download', 'share', 'export'
  visitor_country TEXT,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio sections table (modular layout)
CREATE TABLE IF NOT EXISTS portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES user_portfolios(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'profile', 'skills', 'projects', 'certificates', 'experience', 'custom'
  section_data JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI enhancement history
CREATE TABLE IF NOT EXISTS ai_portfolio_enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
  enhancement_type TEXT NOT NULL, -- 'summary', 'skills', 'experience', 'projects'
  original_content TEXT,
  enhanced_content TEXT NOT NULL,
  applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Career match scores
CREATE TABLE IF NOT EXISTS career_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  match_percentage INTEGER NOT NULL,
  missing_skills JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_portfolio_enhancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_match_scores ENABLE ROW LEVEL SECURITY;

-- Portfolio policies
CREATE POLICY "Users can manage their own portfolios" ON user_portfolios
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public portfolios" ON user_portfolios
  FOR SELECT USING (is_public = true);

-- Template policies
CREATE POLICY "Anyone can view templates" ON portfolio_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON portfolio_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Resume generation policies
CREATE POLICY "Users can manage their own resumes" ON resume_generations
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Portfolio owners can view analytics" ON portfolio_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics" ON portfolio_analytics
  FOR INSERT WITH CHECK (true);

-- Section policies
CREATE POLICY "Users can manage their portfolio sections" ON portfolio_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_sections.portfolio_id AND user_id = auth.uid()
    )
  );

-- AI enhancement policies
CREATE POLICY "Users can manage their AI enhancements" ON ai_portfolio_enhancements
  FOR ALL USING (auth.uid() = user_id);

-- Career match policies
CREATE POLICY "Users can view their career matches" ON career_match_scores
  FOR ALL USING (auth.uid() = user_id);

-- Insert default portfolio templates
INSERT INTO portfolio_templates (name, description, category, template_config, is_premium) VALUES
('GeoAI Specialist', 'Perfect for AI/ML professionals in geospatial field', 'geoai', '{"sections": ["profile", "skills", "projects", "research"], "theme": "modern", "color": "blue"}', false),
('Remote Sensing Expert', 'Showcase satellite imagery and earth observation skills', 'remote-sensing', '{"sections": ["profile", "experience", "projects", "certifications"], "theme": "satellite", "color": "green"}', false),
('Urban Planner', 'Highlight planning and policy analysis expertise', 'planning', '{"sections": ["profile", "experience", "projects", "skills"], "theme": "urban", "color": "purple"}', false),
('GIS Analyst', 'Traditional analyst role template', 'analyst', '{"sections": ["profile", "skills", "experience", "projects"], "theme": "classic", "color": "teal"}', false),
('Geospatial Developer', 'For full-stack geo developers', 'developer', '{"sections": ["profile", "projects", "skills", "github"], "theme": "code", "color": "orange"}', false),
('Enterprise Consultant', 'Professional consulting template', 'consultant', '{"sections": ["profile", "experience", "projects", "certifications", "testimonials"], "theme": "executive", "color": "navy"}', true);

-- Functions
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON user_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_portfolio_updated_at();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON portfolio_sections
  FOR EACH ROW EXECUTE FUNCTION update_portfolio_updated_at();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resume_generations
  FOR EACH ROW EXECUTE FUNCTION update_portfolio_updated_at();

-- Generate unique public URL function
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
$$ LANGUAGE plpgsql;

-- Track portfolio views
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
$$ LANGUAGE plpgsql;