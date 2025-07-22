import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { toast } from '@/hooks/use-toast';

interface CourseRedirectHandlerProps {
  courseId?: string;
}

const CourseRedirectHandler = ({ courseId }: CourseRedirectHandlerProps) => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access enrolled courses.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Check if user has premium access for course content
    if (!hasAccess('pro')) {
      toast({
        title: "Premium Access Required",
        description: "This course requires a professional subscription.",
        variant: "destructive"
      });
      navigate('/pricing');
      return;
    }

    // Navigate to the specific course or default course
    const targetCourse = courseId || 'geospatial-technology-unlocked';
    navigate(`/courses/${targetCourse}`);
  }, [user, hasAccess, navigate, courseId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default CourseRedirectHandler;