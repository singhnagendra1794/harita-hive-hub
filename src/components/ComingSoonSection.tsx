
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Bell, CheckCircle, MapPin, Code, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComingSoonCourse {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedLaunch: string;
  features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const upcomingCourses: ComingSoonCourse[] = [
  {
    id: 'advanced-python-gis',
    title: 'Advanced Python for GIS Automation',
    description: 'Master Python scripting for complex geospatial workflows, including ArcPy, GDAL, and custom tool development.',
    icon: Code,
    estimatedLaunch: 'March 2025',
    features: ['ArcPy Mastery', 'GDAL/OGR Deep Dive', 'Custom Tool Development', 'Workflow Automation'],
    difficulty: 'Advanced'
  },
  {
    id: 'drone-mapping',
    title: 'Drone Mapping & Photogrammetry',
    description: 'Learn to process drone imagery, create orthomosaics, and generate 3D models for various applications.',
    icon: MapPin,
    estimatedLaunch: 'April 2025',
    features: ['Flight Planning', 'Image Processing', '3D Modeling', 'Precision Agriculture'],
    difficulty: 'Intermediate'
  },
  {
    id: 'gis-data-science',
    title: 'GIS Data Science & Machine Learning',
    description: 'Apply machine learning techniques to geospatial data for predictive modeling and pattern recognition.',
    icon: BarChart3,
    estimatedLaunch: 'May 2025',
    features: ['Spatial Statistics', 'ML Algorithms', 'Predictive Modeling', 'Big Data Processing'],
    difficulty: 'Advanced'
  }
];

const ComingSoonSection: React.FC = () => {
  const [interestedCourses, setInterestedCourses] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleInterest = async (courseId: string) => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email to get notified about this course.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setInterestedCourses(prev => new Set([...prev, courseId]));
    
    toast({
      title: "You're on the list! 🎉",
      description: "We'll notify you as soon as this course is available.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Clock className="h-4 w-4 mr-2" />
            Coming Soon
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Upcoming Courses</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get early access to our most anticipated courses. Be the first to know when they launch!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {upcomingCourses.map((course) => (
            <Card key={course.id} className="relative bg-background hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <course.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.estimatedLaunch}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {course.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">What you'll learn:</h4>
                  <ul className="space-y-1">
                    {course.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  {interestedCourses.has(course.id) ? (
                    <div className="flex items-center justify-center py-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">
                        You'll be notified!
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        onClick={() => handleInterest(course.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notify Me
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Have a course suggestion? Let us know what you'd like to learn next!
          </p>
          <Button variant="outline">
            Suggest a Course Topic
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;
