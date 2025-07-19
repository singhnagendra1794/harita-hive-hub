-- Enhance project submissions table with new features
ALTER TABLE project_submissions 
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS file_attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES project_templates(id),
ADD COLUMN IF NOT EXISTS collaborators jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS activity_log jsonb DEFAULT '[]'::jsonb;

-- Create project collaborators table for better collaboration management
CREATE TABLE IF NOT EXISTS project_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'collaborator',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  permissions jsonb DEFAULT '{"can_edit": false, "can_comment": true, "can_download": true}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Create project ratings table
CREATE TABLE IF NOT EXISTS project_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project activity logs table
CREATE TABLE IF NOT EXISTS project_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}'::jsonb,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create project file attachments table
CREATE TABLE IF NOT EXISTS project_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  uploaded_by uuid NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_collaborators
CREATE POLICY "Users can view collaborations they're part of" 
ON project_collaborators FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = invited_by OR
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage collaborators" 
ON project_collaborators FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own collaboration status" 
ON project_collaborators FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for project_ratings
CREATE POLICY "Anyone can view public project ratings" 
ON project_ratings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND ps.is_public = true
  )
);

CREATE POLICY "Users can rate projects" 
ON project_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON project_ratings FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for project_activities
CREATE POLICY "Users can view activities for projects they have access to" 
ON project_activities FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND (
      ps.user_id = auth.uid() OR 
      ps.is_public = true OR
      EXISTS (
        SELECT 1 FROM project_collaborators pc 
        WHERE pc.project_id = ps.id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can create activities for projects they have access to" 
ON project_activities FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND (
      ps.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM project_collaborators pc 
        WHERE pc.project_id = ps.id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
      )
    )
  )
);

-- RLS Policies for project_files
CREATE POLICY "Users can view files for projects they have access to" 
ON project_files FOR SELECT 
USING (
  is_public = true OR
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND (
      ps.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM project_collaborators pc 
        WHERE pc.project_id = ps.id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can upload files to projects they have access to" 
ON project_files FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM project_submissions ps 
    WHERE ps.id = project_id AND (
      ps.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM project_collaborators pc 
        WHERE pc.project_id = ps.id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
        AND (pc.permissions->>'can_edit')::boolean = true
      )
    )
  )
);

-- Function to update project rating aggregates
CREATE OR REPLACE FUNCTION update_project_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE project_submissions
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating::DECIMAL), 2)
      FROM project_ratings
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM project_ratings
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS update_project_rating_trigger ON project_ratings;
CREATE TRIGGER update_project_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON project_ratings
FOR EACH ROW EXECUTE FUNCTION update_project_rating();

-- Function to log project activities
CREATE OR REPLACE FUNCTION log_project_activity(
  p_project_id uuid,
  p_user_id uuid,
  p_activity_type text,
  p_description text,
  p_activity_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO project_activities (project_id, user_id, activity_type, description, activity_data)
  VALUES (p_project_id, p_user_id, p_activity_type, p_description, p_activity_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing project_submissions RLS policies to include privacy controls
DROP POLICY IF EXISTS "Anyone can view public projects" ON project_submissions;
CREATE POLICY "Anyone can view public projects" 
ON project_submissions FOR SELECT 
USING (
  is_public = true OR 
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = id AND pc.user_id = auth.uid() AND pc.status = 'accepted'
  )
);

-- Super admin access for contact@haritahive.com
CREATE POLICY "Super admin can manage all projects" 
ON project_submissions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage all collaborators" 
ON project_collaborators FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage all ratings" 
ON project_ratings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can view all activities" 
ON project_activities FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);

CREATE POLICY "Super admin can manage all files" 
ON project_files FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = 'contact@haritahive.com'
  )
);