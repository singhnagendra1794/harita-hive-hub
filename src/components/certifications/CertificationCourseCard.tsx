import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Clock, Users, Shield, CheckCircle } from 'lucide-react';
import { CourseWaitlistForm } from '@/components/CourseWaitlistForm';
import type { CertificationCourse } from '@/hooks/useCertificationCourses';

interface CertificationCourseCardProps extends CertificationCourse {}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const CertificationCourseCard: React.FC<CertificationCourseCardProps> = ({
  title,
  description,
  duration,
  difficulty,
  requirements,
  price,
  is_blockchain_verified,
  rating,
  students_enrolled,
  estimated_launch,
  features,
}) => {
  return (
    <Card className="relative h-full bg-gradient-to-br from-background to-secondary/5 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      {/* Certificate Icon */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1 text-yellow-600">
          <Award className="h-5 w-5" />
          <span className="text-sm font-medium">🎖</span>
        </div>
      </div>

      {/* Coming Soon Badge */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          Coming {estimated_launch}
        </Badge>
      </div>

      <CardHeader className="pb-4 pt-12">
        <div className="flex items-center gap-3 mb-4">
          <Badge 
            className={getDifficultyColor(difficulty)} 
            variant="outline"
          >
            {difficulty}
          </Badge>
          {is_blockchain_verified && (
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">Blockchain</span>
            </div>
          )}
        </div>

        <CardTitle className="text-xl mb-3 flex items-center gap-2">
          {title}
        </CardTitle>
        
        <CardDescription className="text-sm mb-4 line-clamp-3">
          {description}
        </CardDescription>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {students_enrolled.toLocaleString()} enrolled
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">What you'll learn:</h4>
          <div className="space-y-2">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h4 className="font-semibold mb-2 text-sm">Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{req}</span>
              </li>
            ))}
            {requirements.length > 3 && (
              <li className="text-xs text-muted-foreground/70">
                +{requirements.length - 3} more requirements
              </li>
            )}
          </ul>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Price:</span>
          <span className="text-lg font-bold text-primary">
            {price === 0 ? 'Free' : `$${price}`}
          </span>
        </div>

        {/* Waitlist Form */}
        <div className="pt-4 border-t">
          <CourseWaitlistForm 
            courseTitle={title}
            buttonText="Join Waitlist"
            buttonClassName="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationCourseCard;