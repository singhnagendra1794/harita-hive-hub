-- Create comprehensive marketplace and pricing system

-- Regional pricing table
CREATE TABLE public.regional_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tool marketplace table
CREATE TABLE public.marketplace_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  tool_type TEXT NOT NULL, -- 'qgis_plugin', 'python_script', 'gee_app', 'web_component'
  tech_stack TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  download_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  documentation_url TEXT,
  license_type TEXT DEFAULT 'MIT',
  version TEXT DEFAULT '1.0.0',
  qgis_min_version TEXT,
  python_version TEXT,
  file_size_mb DECIMAL(8,2),
  is_free BOOLEAN DEFAULT true,
  base_price_usd DECIMAL(10,2) DEFAULT 0,
  base_price_inr DECIMAL(10,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  author_id UUID,
  created_by UUID,
  status TEXT DEFAULT 'active', -- 'active', 'pending', 'disabled'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tool purchases table
CREATE TABLE public.tool_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id UUID NOT NULL REFERENCES marketplace_tools(id),
  purchase_price DECIMAL(10,2) NOT NULL,
  currency_code TEXT NOT NULL,
  payment_method TEXT, -- 'stripe', 'razorpay'
  transaction_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  invoice_url TEXT,
  download_attempts INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Tool reviews and ratings
CREATE TABLE public.tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES marketplace_tools(id),
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tool_id, user_id)
);

-- User download history
CREATE TABLE public.user_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id UUID NOT NULL REFERENCES marketplace_tools(id),
  download_type TEXT NOT NULL, -- 'free', 'purchased', 'preview'
  ip_address INET,
  user_agent TEXT,
  download_url TEXT,
  file_hash TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- Regional pricing policies
CREATE POLICY "Anyone can view regional pricing" ON public.regional_pricing
FOR SELECT USING (is_active = true);

-- Marketplace tools policies
CREATE POLICY "Anyone can view active tools" ON public.marketplace_tools
FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage their tools" ON public.marketplace_tools
FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all tools" ON public.marketplace_tools
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Tool purchases policies
CREATE POLICY "Users can view their purchases" ON public.tool_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.tool_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tool reviews policies
CREATE POLICY "Anyone can view reviews" ON public.tool_reviews
FOR SELECT USING (true);

CREATE POLICY "Users can manage their reviews" ON public.tool_reviews
FOR ALL USING (auth.uid() = user_id);

-- Download history policies
CREATE POLICY "Users can view their downloads" ON public.user_downloads
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create download records" ON public.user_downloads
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample regional pricing
INSERT INTO public.regional_pricing (country_code, currency_code, exchange_rate, tax_rate) VALUES
('US', 'USD', 1.0000, 0.0875),
('IN', 'INR', 83.0000, 0.1800),
('GB', 'GBP', 0.7800, 0.2000),
('EU', 'EUR', 0.9200, 0.2100),
('CA', 'CAD', 1.3500, 0.1300),
('AU', 'AUD', 1.5200, 0.1000);

-- Create indexes for performance
CREATE INDEX idx_marketplace_tools_category ON public.marketplace_tools(category);
CREATE INDEX idx_marketplace_tools_featured ON public.marketplace_tools(is_featured);
CREATE INDEX idx_marketplace_tools_rating ON public.marketplace_tools(rating DESC);
CREATE INDEX idx_tool_purchases_user ON public.tool_purchases(user_id);
CREATE INDEX idx_tool_reviews_tool ON public.tool_reviews(tool_id);
CREATE INDEX idx_user_downloads_user ON public.user_downloads(user_id);

-- Function to update tool ratings
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_tools
  SET 
    rating = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM tool_reviews
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM tool_reviews
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings
CREATE TRIGGER update_tool_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tool_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_rating();

-- Function to get user's regional pricing
CREATE OR REPLACE FUNCTION get_regional_price(
  p_base_price_usd DECIMAL,
  p_country_code TEXT DEFAULT 'US'
)
RETURNS TABLE(
  local_price DECIMAL,
  currency_code TEXT,
  tax_rate DECIMAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(p_base_price_usd * rp.exchange_rate, 2) as local_price,
    rp.currency_code,
    rp.tax_rate
  FROM regional_pricing rp
  WHERE rp.country_code = p_country_code
    AND rp.is_active = true
  LIMIT 1;
END;
$$;