import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GraduationCap, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnrollmentForm } from '@/components/course-enrollment/EnrollmentForm';

interface Course {
  id: string;
  title: string;
  price?: number;
  is_free?: boolean;
}

interface PostSignupCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const PostSignupCourseModal: React.FC<PostSignupCourseModalProps> = ({
  isOpen,
  onClose,
  userName
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, price, is_free')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;

      // Add default course if not in database
      const defaultCourse: Course = {
        id: 'geospatial-tech-unlocked',
        title: 'Geospatial Technology Unlocked',
        price: 14999,
        is_free: false
      };

      const coursesWithDefault: Course[] = (data || []).map(course => ({
        ...course,
        price: course.price || 0,
        is_free: course.is_free || false
      }));
      
      const hasGeospatialCourse = coursesWithDefault.some(
        course => course.title.toLowerCase().includes('geospatial technology unlocked')
      );

      if (!hasGeospatialCourse) {
        coursesWithDefault.unshift(defaultCourse);
      }

      setCourses(coursesWithDefault);
      
      // Pre-select the first course (Geospatial Technology Unlocked)
      if (coursesWithDefault.length > 0) {
        setSelectedCourse(coursesWithDefault[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to default course
      const defaultCourse: Course = {
        id: 'geospatial-tech-unlocked',
        title: 'Geospatial Technology Unlocked',
        price: 14999,
        is_free: false
      };
      setCourses([defaultCourse]);
      setSelectedCourse(defaultCourse.id);
    }
  };

  const handleEnrollClick = () => {
    if (!selectedCourse) {
      toast({
        title: "Course Required",
        description: "Please select a course to continue.",
        variant: "destructive"
      });
      return;
    }
    setShowEnrollmentForm(true);
  };

  const handleNotInterested = () => {
    toast({
      title: "Welcome to Harita Hive!",
      description: "You can always enroll in courses later from your dashboard.",
    });
    onClose();
  };

  const handleEnrollmentSuccess = (enrollmentId: string) => {
    toast({
      title: "Enrollment Successful!",
      description: "You'll be redirected to complete your payment.",
    });
    setShowEnrollmentForm(false);
    onClose();
    // Redirect will be handled by the enrollment form's payment process
  };

  const selectedCourseDetails = courses.find(course => course.id === selectedCourse);
  const isInternational = false; // You can determine this based on user location if needed

  if (showEnrollmentForm && selectedCourseDetails) {
    return (
      <EnrollmentForm
        courseId={selectedCourse}
        courseTitle={selectedCourseDetails.title}
        price={selectedCourseDetails.price?.toString() || '14999'}
        currency="INR"
        isInternational={isInternational}
        onClose={() => {
          setShowEnrollmentForm(false);
          onClose();
        }}
        onSuccess={handleEnrollmentSuccess}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            👉 Would you like to enroll in a course now?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              {userName && `Welcome ${userName}! `}
              Get started with our expert-led courses and accelerate your learning journey.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="course-select" className="text-sm font-medium">
              Select a Course
            </Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course-select">
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{course.title}</span>
                      {course.is_free ? (
                        <span className="text-green-600 text-xs ml-2">FREE</span>
                      ) : (
                        <span className="text-muted-foreground text-xs ml-2">
                          ₹{(course.price || 14999).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleEnrollClick} 
              disabled={!selectedCourse || loading}
              className="w-full"
              size="lg"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Yes, Enroll
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleNotInterested}
              className="w-full"
              size="lg"
            >
              Not Interested
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You can also enroll in courses later from your dashboard
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};