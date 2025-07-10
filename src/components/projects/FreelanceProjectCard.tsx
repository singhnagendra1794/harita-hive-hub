
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, DollarSign, MapPin, Users, Calendar, Star } from "lucide-react";

interface FreelanceProjectCardProps {
  id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
  };
  deadline: string;
  difficulty: string;
  skills: string[];
  client: {
    name: string;
    avatar?: string;
    rating: number;
    location: string;
    completedProjects: number;
  };
  applicationsCount: number;
  postedDate: string;
  isUrgent?: boolean;
  projectType: string;
}

const FreelanceProjectCard = ({
  id,
  title,
  description,
  budget,
  deadline,
  difficulty,
  skills,
  client,
  applicationsCount,
  postedDate,
  isUrgent,
  projectType
}: FreelanceProjectCardProps) => {
  const getDifficultyVariant = (level: string) => {
    switch (level) {
      case 'entry': return 'secondary';
      case 'intermediate': return 'default';
      case 'expert': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative">
      {isUrgent && (
        <Badge className="absolute top-4 right-4 z-10 bg-red-100 text-red-800">
          Urgent
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{projectType}</Badge>
              <Badge variant={getDifficultyVariant(difficulty)}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-3">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget and Timeline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold">
              ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{daysUntilDeadline} days left</span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{client.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{client.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{client.completedProjects} projects</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{applicationsCount} applicants</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Posted {formatDate(postedDate)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1">
            Apply Now
          </Button>
          <Button variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreelanceProjectCard;
