
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Users, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FreelanceProject {
  id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  required_skills: string[];
  difficulty_level: string;
  applications_count: number;
  created_at: string;
  client: {
    full_name: string;
    avatar_url?: string;
  };
}

interface FreelanceProjectCardProps {
  project: FreelanceProject;
}

const FreelanceProjectCard = ({ project }: FreelanceProjectCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <CardDescription>by {project.client.full_name}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(project.difficulty_level)}>
            {project.difficulty_level}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
          {(project.budget_min || project.budget_max) && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {project.budget_min && project.budget_max 
                ? `$${project.budget_min} - $${project.budget_max}`
                : project.budget_min 
                  ? `From $${project.budget_min}`
                  : `Up to $${project.budget_max}`
              }
            </div>
          )}
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {project.applications_count} proposals
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-1">
              {project.required_skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {project.required_skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{project.required_skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Posted {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </div>
          <Button>Submit Proposal</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreelanceProjectCard;
