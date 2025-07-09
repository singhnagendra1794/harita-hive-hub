
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Building, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  location?: string;
  remote_allowed: boolean;
  salary_min?: number;
  salary_max?: number;
  required_skills: string[];
  experience_level?: string;
  employment_type: string;
  is_premium: boolean;
  created_at: string;
  company: {
    name: string;
    logo?: string;
  };
}

interface JobPostingCardProps {
  job: JobPosting;
}

const JobPostingCard = ({ job }: JobPostingCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${job.is_premium ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {job.company.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-full h-full rounded-lg object-cover" />
              ) : (
                <Building className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription className="font-medium">{job.company.name}</CardDescription>
            </div>
          </div>
          {job.is_premium && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
              {job.remote_allowed && " (Remote OK)"}
            </div>
          )}
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {job.salary_min && job.salary_max 
                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                : job.salary_min 
                  ? `From $${job.salary_min.toLocaleString()}`
                  : `Up to $${job.salary_max?.toLocaleString()}`
              }
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {job.employment_type}
            </Badge>
            {job.experience_level && (
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-1">
              {job.required_skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.required_skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{job.required_skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Button variant="outline">View Details</Button>
          <Button>Apply Now</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobPostingCard;
