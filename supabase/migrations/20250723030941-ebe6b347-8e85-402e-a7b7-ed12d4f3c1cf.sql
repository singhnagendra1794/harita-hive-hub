-- Create mentorship-related tables

-- Table for mentor bookings
CREATE TABLE IF NOT EXISTS public.mentor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_name TEXT NOT NULL DEFAULT 'Nagendra Singh',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  query_description TEXT,
  session_duration INTEGER NOT NULL, -- in minutes (60 or 90)
  session_price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  session_date TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for mentor messages
CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  admin_replied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_bookings
CREATE POLICY "Users can view their own bookings"
ON public.mentor_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.mentor_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.mentor_bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON public.mentor_bookings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- RLS Policies for mentor_messages
CREATE POLICY "Users can view their own messages"
ON public.mentor_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.mentor_messages FOR INSERT
WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

CREATE POLICY "Admins can view all messages"
ON public.mentor_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Admins can insert admin messages"
ON public.mentor_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  ) AND sender_type = 'admin'
);

CREATE POLICY "Admins can update messages"
ON public.mentor_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@haritahive.com'
  )
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mentor_bookings_updated_at 
    BEFORE UPDATE ON public.mentor_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_messages_updated_at 
    BEFORE UPDATE ON public.mentor_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();