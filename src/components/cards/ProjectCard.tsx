import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, MapPin, DollarSign, Clock, Bookmark } from "lucide-react";
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    client_name?: string;
    client_rating?: number;
    budget_min?: number;
    budget_max?: number;
    budget_type: string;
    currency: string;
    duration?: string;
    location?: string;
    skills: string[];
    difficulty: string;
    source?: string;
    is_remote: boolean;
    is_internal?: boolean;
    apply_url?: string;
    posted_date: string;
    applicants_count: number;
  };
  onSave?: (project: any) => void;
  onApply?: (project: any) => void;
}

const ProjectCard = memo(({ project, onSave, onApply }: ProjectCardProps) => {
  const { ref, shouldLoad } = useLazyLoad({ rootMargin: '50px' });

  const formatBudget = () => {
    const currency = project.currency === 'INR' ? '₹' : '$';
    if (project.budget_type === "hourly") {
      return `${currency}${project.budget_min}-${project.budget_max}/hr`;
    }
    return `${currency}${project.budget_min?.toLocaleString()}-${project.budget_max?.toLocaleString()}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Upwork": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Freelancer": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Guru": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "PeoplePerHour": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Harita Hive": return "bg-primary/10 text-primary";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <Card 
      ref={ref}
      className={`hover:shadow-lg transition-all duration-300 ${project.is_internal ? 'border-primary/30 bg-primary/5' : ''}`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              {shouldLoad && (
                <>
                  <Badge className={getPlatformColor(project.source || 'Unknown')}>
                    {project.source}
                  </Badge>
                  {project.is_internal && <Badge variant="default">Verified Client</Badge>}
                  {project.is_remote && <Badge variant="outline">Remote</Badge>}
                  <Badge className={getDifficultyColor(project.difficulty)}>
                    {project.difficulty}
                  </Badge>
                </>
              )}
            </div>
            {project.client_name && (
              <p className="text-lg font-semibold text-primary">{project.client_name}</p>
            )}
            {shouldLoad && project.client_rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{project.client_rating}</span>
              </div>
            )}
            {shouldLoad && (
              <div className="flex items-center gap-4 text-muted-foreground mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatBudget()}
                </div>
                {project.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {project.duration}
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </div>
                )}
              </div>
            )}
          </div>
          {shouldLoad && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSave?.(project)}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              {project.is_internal ? (
                <Button onClick={() => onApply?.(project)}>
                  Apply Now
                </Button>
              ) : (
                <Button 
                  onClick={() => onApply?.(project)}
                  variant="outline"
                >
                  Apply on {project.source}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
        {shouldLoad && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
              ))}
              {project.skills.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.skills.length - 6} more
                </Badge>
              )}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Posted {new Date(project.posted_date).toLocaleDateString()}</span>
              <span>{project.applicants_count} applicant{project.applicants_count !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;