
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Clock, CheckCircle, Lock, Star, Shield } from "lucide-react";

interface CertificationCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  difficulty: string;
  requirements: string[];
  badgeUrl?: string;
  isBlockchainVerified: boolean;
  isEarned?: boolean;
  progress?: number;
  rating?: number;
  studentsEnrolled?: number;
}

const CertificationCard = ({
  id,
  title,
  description,
  price,
  duration,
  difficulty,
  requirements,
  badgeUrl,
  isBlockchainVerified,
  isEarned,
  progress = 0,
  rating,
  studentsEnrolled
}: CertificationCardProps) => {
  const getDifficultyVariant = (level: string) => {
    switch (level) {
      case 'beginner': return 'secondary';
      case 'intermediate': return 'default';
      case 'advanced': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 relative ${isEarned ? 'ring-2 ring-green-500' : ''}`}>
      {isEarned && (
        <Badge className="absolute top-4 right-4 z-10 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Earned
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
            {badgeUrl ? (
              <img src={badgeUrl} alt="Certificate badge" className="w-12 h-12" />
            ) : (
              <Award className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={getDifficultyVariant(difficulty)}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              {isBlockchainVerified && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Blockchain Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {progress > 0 && !isEarned && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{duration}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            {studentsEnrolled && (
              <div className="text-muted-foreground">
                {studentsEnrolled.toLocaleString()} enrolled
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Requirements</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {req}
              </li>
            ))}
            {requirements.length > 3 && (
              <li className="text-xs text-muted-foreground">
                +{requirements.length - 3} more requirements
              </li>
            )}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {price === 0 ? 'Free' : `$${price}`}
            </span>
            {isBlockchainVerified && (
              <span className="text-xs text-blue-600">+ Blockchain Certificate</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {isEarned ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1">
                View Certificate
              </Button>
              <Button variant="outline">
                Share
              </Button>
            </div>
          ) : progress > 0 ? (
            <Button className="w-full">
              Continue Learning
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button className="flex-1">
                {price === 0 ? 'Start Certification' : 'Enroll Now'}
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationCard;
