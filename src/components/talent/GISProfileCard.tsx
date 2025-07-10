
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, ExternalLink, Mail, Star } from "lucide-react";

interface GISProfileCardProps {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  location: string;
  hourlyRate: number;
  experienceLevel: string;
  skills: string[];
  tools: string[];
  rating: number;
  completedProjects: number;
  availableForHire: boolean;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

const GISProfileCard = ({
  id,
  name,
  title,
  bio,
  avatar,
  location,
  hourlyRate,
  experienceLevel,
  skills,
  tools,
  rating,
  completedProjects,
  availableForHire,
  portfolioUrl,
  linkedinUrl
}: GISProfileCardProps) => {
  const getExperienceBadgeVariant = (level: string) => {
    switch (level) {
      case 'entry': return 'secondary';
      case 'mid': return 'default';
      case 'senior': return 'destructive';
      case 'expert': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <CardDescription className="text-base font-medium">{title}</CardDescription>
              </div>
              {availableForHire && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Available
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{completedProjects} projects</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-2">{bio}</p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Experience Level</span>
              <Badge variant={getExperienceBadgeVariant(experienceLevel)}>
                {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium block mb-2">Skills</span>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 4}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium block mb-2">Tools</span>
            <div className="flex flex-wrap gap-1">
              {tools.slice(0, 3).map((tool, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {tools.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tools.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold">${hourlyRate}/hr</span>
            </div>
            <div className="flex gap-2">
              {portfolioUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(portfolioUrl, '_blank')}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {linkedinUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(linkedinUrl, '_blank')}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GISProfileCard;
