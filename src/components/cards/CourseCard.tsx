import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Calendar, Star, AlertCircle, CheckCircle } from "lucide-react";
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
    enrollmentDeadline?: string;
    launchDate?: string;
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
      className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col"
    >
      {course.isPriority && shouldLoad && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 text-center">
          🔥 LIMITED TIME OFFER
        </div>
      )}
      
      {course.enrollmentDeadline && course.isLive && shouldLoad && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 mx-4 mt-4 rounded">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">
              ⏳ Enroll before {course.enrollmentDeadline}
            </span>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-3">
            <IconComponent className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {course.level}
            </Badge>
            {shouldLoad && (
              <>
                {course.isLive && (
                  <Badge variant="default" className="bg-red-500 hover:bg-red-600 text-xs">
                    🔴 LIVE
                  </Badge>
                )}
                {course.isUpcoming && (
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold leading-tight">
          {course.title}
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      {shouldLoad && (
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {course.isUpcoming ? course.launchDate : 'Live Now'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{course.enrolled}/{course.maxStudents} enrolled</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-muted-foreground">{course.rating}</span>
              </div>
            </div>

            {course.enrolled > 0 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(course.enrolled / course.maxStudents) * 100}%` }}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                {formatPrice()}
              </span>
              {course.isLive && course.enrollmentDeadline && (
                <span className="text-xs text-muted-foreground">
                  Live cohort in progress
                </span>
              )}
            </div>

            {course.isLive && isEnrollmentOpen ? (
              <Button 
                onClick={() => onEnrollNow(course)} 
                className="w-full"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Enroll Now
              </Button>
            ) : course.isUpcoming ? (
              <Button 
                onClick={() => onJoinWaitlist(course)} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Join Waitlist
              </Button>
            ) : (
              <Button 
                onClick={() => onJoinWaitlist(course)} 
                variant="secondary" 
                className="w-full"
                size="lg"
              >
                Join Waitlist
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