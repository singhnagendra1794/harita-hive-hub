-- Create tool orders table for marketplace purchases
CREATE TABLE public.tool_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES marketplace_tools(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  payment_method TEXT DEFAULT 'razorpay',
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own orders" 
ON public.tool_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Insert orders for authenticated users" 
ON public.tool_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" 
ON public.tool_orders 
FOR ALL 
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_tool_orders_updated_at
BEFORE UPDATE ON public.tool_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create download tracking table
CREATE TABLE public.tool_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES tool_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES marketplace_tools(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on downloads
ALTER TABLE public.tool_downloads ENABLE ROW LEVEL SECURITY;

-- RLS for downloads
CREATE POLICY "Users can view their own downloads" 
ON public.tool_downloads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all downloads" 
ON public.tool_downloads 
FOR ALL 
USING (true);

-- Add index for better performance
CREATE INDEX idx_tool_orders_user_id ON tool_orders(user_id);
CREATE INDEX idx_tool_orders_tool_id ON tool_orders(tool_id);
CREATE INDEX idx_tool_orders_status ON tool_orders(status);
CREATE INDEX idx_tool_downloads_order_id ON tool_downloads(order_id);