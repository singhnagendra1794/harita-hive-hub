-- Create AVA conversations table to store chat history
CREATE TABLE IF NOT EXISTS public.ava_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  context_type TEXT DEFAULT 'general',
  context_data JSONB DEFAULT '[]',
  feedback INTEGER, -- -1, 0, 1 for thumbs down, neutral, thumbs up
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AVA user memory table to store user context and preferences
CREATE TABLE IF NOT EXISTS public.ava_user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  context_type TEXT NOT NULL,
  key_topics TEXT[] DEFAULT '{}',
  user_intent TEXT,
  solution_provided TEXT,
  frequency_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ava_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ava_user_memory ENABLE ROW LEVEL SECURITY;

-- Create policies for ava_conversations
CREATE POLICY "Users can manage their own AVA conversations"
ON public.ava_conversations
FOR ALL
USING (auth.uid() = user_id);

-- Create policies for ava_user_memory  
CREATE POLICY "Users can manage their own AVA memory"
ON public.ava_user_memory
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ava_conversations_user_id ON public.ava_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ava_conversations_conversation_id ON public.ava_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ava_conversations_created_at ON public.ava_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ava_user_memory_user_id ON public.ava_user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ava_user_memory_context_type ON public.ava_user_memory(context_type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_ava_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ava_conversations_updated_at
  BEFORE UPDATE ON public.ava_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ava_conversations_updated_at();