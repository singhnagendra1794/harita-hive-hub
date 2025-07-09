
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, ExternalLink, Github, Linkedin } from "lucide-react";

interface GISProfile {
  id: string;
  title: string;
  bio: string;
  skills: string[];
  tools: string[];
  location: string;
  experience_level: string;
  hourly_rate: number;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
}

interface GISProfileCardProps {
  profile: GISProfile;
}

const GISProfileCard = ({ profile }: GISProfileCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {profile.user.avatar_url ? (
              <img src={profile.user.avatar_url} alt={profile.user.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {profile.user.full_name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{profile.user.full_name}</CardTitle>
            <CardDescription className="text-lg font-medium">{profile.title}</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              {profile.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile.hourly_rate && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  ${profile.hourly_rate}/hr
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{profile.bio}</p>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {profile.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Tools</h4>
            <div className="flex flex-wrap gap-1">
              {profile.tools.slice(0, 4).map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex gap-2">
            {profile.linkedin_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.github_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.portfolio_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <Button>Contact</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GISProfileCard;
