import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

interface CourseCardProps {
  course: {
    id: string | number;
    title: string;
    description: string;
    instructor: string;
    timeline: string;
    duration: string;
    level: string;
    category: string;
    icon: any;
    priceINR: string;
    priceUSD: string;
    enrolled: number;
    maxStudents: number;
    rating: number;
    isLive?: boolean;
    isUpcoming?: boolean;
    isPriority?: boolean;
    courseUrl?: string;
  };
  currencyMode: 'INR' | 'USD';
  isEnrollmentOpen: boolean;
  onEnrollNow: (course: any) => void;
  onJoinWaitlist: (course: any) => void;
}

const CourseCard = memo(({ course, currencyMode, isEnrollmentOpen, onEnrollNow, onJoinWaitlist }: CourseCardProps) => {
  const { ref, shouldLoad } = useLazyLoad({ rootMargin: '100px' });
  const IconComponent = course.icon;
  
  const formatPrice = () => {
    return currencyMode === 'INR' ? course.priceINR : course.priceUSD;
  };

  return (
    <Card 
      ref={ref}
      className={`hover:shadow-lg transition-shadow ${course.isPriority ? 'border-primary shadow-md' : ''}`}
    >
      {course.isPriority && shouldLoad && (
        <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-lg">
          <span className="text-sm font-medium">⭐ FEATURED COURSE</span>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="mt-1">
                {course.description}
              </CardDescription>
            </div>
          </div>
          {shouldLoad && (
            <>
              {course.isLive ? (
                <Badge className="bg-green-500 text-white">
                  LIVE TRAINING
                </Badge>
              ) : course.isUpcoming ? (
                <Badge className="bg-blue-500 text-white">
                  LAUNCHING 2025
                </Badge>
              ) : (
                <Badge variant="outline">
                  COMING SOON
                </Badge>
              )}
            </>
          )}
        </div>
        
        {shouldLoad && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              {"★".repeat(Math.floor(course.rating))}
              <span className="text-sm text-muted-foreground ml-1">
                {course.rating}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {course.enrolled}/{course.maxStudents} enrolled
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      {shouldLoad && (
        <CardContent>
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800">
                {formatPrice()}
              </div>
              <div className="text-sm text-green-600">Course Price</div>
            </div>

            {course.isLive && course.id === "geospatial-technology-unlocked" ? (
              isEnrollmentOpen ? (
                <Button 
                  className="w-full"
                  onClick={() => onEnrollNow(course)}
                >
                  Enroll Now
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  disabled
                  variant="outline"
                >
                  Enrollment Closed
                </Button>
              )
            ) : course.isLive && course.courseUrl ? (
              <a href={course.courseUrl}>
                <Button className="w-full">
                  View Course Details
                </Button>
              </a>
            ) : (
              <Button 
                className="w-full"
                onClick={() => onJoinWaitlist(course)}
              >
                Join Waitlist - Get Early Access
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;