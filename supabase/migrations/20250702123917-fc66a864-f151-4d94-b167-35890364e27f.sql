
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[],
  difficulty_level TEXT DEFAULT 'beginner',
  status TEXT DEFAULT 'draft', -- draft, published, coming_soon
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true
);

-- Create course modules table
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  document_url TEXT,
  lesson_type TEXT DEFAULT 'video', -- video, document, text, quiz
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Create lesson progress table
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time INTEGER DEFAULT 0, -- in seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create bookmarked lessons table
CREATE TABLE public.bookmarked_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create course analytics table
CREATE TABLE public.course_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, metric_name, date_recorded)
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarked_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for course modules
CREATE POLICY "Anyone can view published course modules" ON public.course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND status = 'published'
    )
  );

CREATE POLICY "Admins can manage all modules" ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Anyone can view published lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.course_modules m ON c.id = m.course_id
      WHERE m.id = module_id AND c.status = 'published'
    )
  );

CREATE POLICY "Admins can manage all lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lesson progress
CREATE POLICY "Users can manage their own progress" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bookmarked lessons
CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarked_lessons
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for course analytics
CREATE POLICY "Admins can manage analytics" ON public.course_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- Create function to update course progress
CREATE OR REPLACE FUNCTION public.update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update course enrollment progress when lesson progress changes
  UPDATE public.course_enrollments
  SET progress_percentage = (
    SELECT ROUND((COUNT(CASE WHEN lp.completed THEN 1 END) * 100.0) / COUNT(*))
    FROM public.lessons l
    JOIN public.course_modules m ON l.module_id = m.id
    LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = NEW.user_id
    WHERE m.course_id = (
      SELECT m2.course_id 
      FROM public.course_modules m2
      JOIN public.lessons l2 ON m2.id = l2.module_id
      WHERE l2.id = NEW.lesson_id
    )
  ),
  completed_at = CASE 
    WHEN (
      SELECT ROUND((COUNT(CASE WHEN lp.completed THEN 1 END) * 100.0) / COUNT(*))
      FROM public.lessons l
      JOIN public.course_modules m ON l.module_id = m.id
      LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = NEW.user_id
      WHERE m.course_id = (
        SELECT m2.course_id 
        FROM public.course_modules m2
        JOIN public.lessons l2 ON m2.id = l2.module_id
        WHERE l2.id = NEW.lesson_id
      )
    ) = 100 THEN now()
    ELSE NULL
  END
  WHERE user_id = NEW.user_id
  AND course_id = (
    SELECT m2.course_id 
    FROM public.course_modules m2
    JOIN public.lessons l2 ON m2.id = l2.module_id
    WHERE l2.id = NEW.lesson_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating course progress
CREATE OR REPLACE TRIGGER update_course_progress_trigger
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_progress();

-- Create storage bucket for course content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Admins can upload course content" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-content' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view course content" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-content');

CREATE POLICY "Admins can update course content" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-content' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete course content" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-content' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
