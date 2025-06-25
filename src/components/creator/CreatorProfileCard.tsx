
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserMinus, Users, CheckCircle } from 'lucide-react';
import { useCreatorProfile } from '@/hooks/useCreatorProfile';
import { useAuth } from '@/contexts/AuthContext';

interface CreatorProfileCardProps {
  userId: string;
  className?: string;
}

export const CreatorProfileCard: React.FC<CreatorProfileCardProps> = ({
  userId,
  className = ''
}) => {
  const { user } = useAuth();
  const { profile, isFollowing, loading, toggleFollow } = useCreatorProfile(userId);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const canFollow = user && user.id !== userId;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-lg">
                {profile.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {profile.display_name || 'Creator'}
                </h3>
                {profile.is_verified && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {profile.follower_count} followers
                </div>
              </div>
            </div>
          </div>
          {canFollow && (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={toggleFollow}
              className="flex items-center gap-2"
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        )}
        
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.social_links && profile.social_links.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Links</h4>
            <div className="space-y-1">
              {profile.social_links.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block"
                >
                  {link.platform}: {link.handle}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
