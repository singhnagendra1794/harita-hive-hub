import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Building, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  CheckCircle,
  IndianRupee,
  Globe,
  Briefcase
} from 'lucide-react';
import { JobListing } from '@/hooks/useJobListings';

interface JobCardProps extends JobListing {
  isSaved?: boolean;
  isApplied?: boolean;
  onSave?: () => void;
  onApply?: () => void;
  onMarkApplied?: () => void;
}

const getExperienceColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'entry':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'mid':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'senior':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'expert':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getJobTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'full-time':
      return 'bg-blue-100 text-blue-800';
    case 'part-time':
      return 'bg-yellow-100 text-yellow-800';
    case 'contract':
      return 'bg-orange-100 text-orange-800';
    case 'internship':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatSalary = (min?: number, max?: number, currency = 'INR') => {
  if (!min && !max) return null;
  
  const formatAmount = (amount: number) => {
    if (currency === 'INR') {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `${currency} ${(amount / 1000).toFixed(0)}K`;
  };

  if (min && max) {
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  }
  return formatAmount(min || max || 0);
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  job_type,
  experience_level,
  salary_min,
  salary_max,
  currency,
  description,
  requirements,
  skills,
  apply_url,
  source_platform,
  is_remote,
  is_india_focused,
  is_verified,
  posted_date,
  ai_relevance_score,
  isSaved = false,
  isApplied = false,
  onSave,
  onApply,
  onMarkApplied
}) => {
  const salaryRange = formatSalary(salary_min, salary_max, currency);

  const handleApplyClick = () => {
    // Open the external apply URL
    window.open(apply_url, '_blank', 'noopener,noreferrer');
    
    // Mark as applied if callback provided
    if (onMarkApplied) {
      onMarkApplied();
    }
  };

  return (
    <Card className="relative h-full bg-background hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
      {/* Header with badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
        {is_verified && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            ✓ Verified
          </Badge>
        )}
        {is_india_focused && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            🇮🇳 India Focus
          </Badge>
        )}
        {is_remote && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            🌐 Remote
          </Badge>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between pr-24">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 line-clamp-2">{title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Building className="h-4 w-4" />
              <span className="font-medium">{company}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {getTimeAgo(posted_date)}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {source_platform}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getJobTypeColor(job_type)}>
            {job_type}
          </Badge>
          {experience_level && (
            <Badge variant="outline" className={getExperienceColor(experience_level)}>
              {experience_level} level
            </Badge>
          )}
          {salaryRange && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              {salaryRange}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm line-clamp-3">
          {description}
        </CardDescription>

        {/* Skills */}
        <div>
          <h4 className="font-semibold mb-2 text-sm">Required Skills:</h4>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">Key Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {requirements.slice(0, 3).map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button 
            onClick={handleApplyClick}
            className="flex-1"
            disabled={isApplied}
          >
            {isApplied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Applied
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onSave}
            className={isSaved ? 'text-yellow-600 bg-yellow-50' : ''}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* AI Relevance Score */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>AI Match: {ai_relevance_score}%</span>
          <span>via {source_platform}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;