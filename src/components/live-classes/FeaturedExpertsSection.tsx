import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, ExternalLink, Calendar, Award, Star } from "lucide-react";
import LazyImage from '@/components/ui/lazy-image';

// Mock featured experts data
const featuredExperts = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    title: 'Director of Geospatial Intelligence',
    organization: 'Indian Space Research Organisation (ISRO)',
    location: 'Bangalore, India',
    avatar: '/api/placeholder/150/150',
    bio: 'Leading expert in satellite remote sensing with 15+ years in space applications. Pioneer in developing AI-powered crop monitoring systems used across rural India.',
    specialties: ['Remote Sensing', 'Agricultural Monitoring', 'AI/ML in GIS'],
    followers: 12400,
    sessions: 8,
    rating: 4.9,
    nextSession: 'Feb 22, 2024',
    achievements: ['Padma Shri Recipient', 'IEEE Fellow', 'Author of 120+ Papers'],
    profileUrl: '/experts/priya-sharma',
    linkedIn: 'https://linkedin.com/in/priyasharma-isro',
    isVerified: true,
    isTopRated: true
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    title: 'Professor of Urban Geography',
    organization: 'MIT Department of Urban Studies',
    location: 'Boston, USA',
    avatar: '/api/placeholder/150/150',
    bio: 'Renowned urban planner and smart cities researcher. Leading the development of next-generation urban simulation models using advanced GIS techniques.',
    specialties: ['Smart Cities', 'Urban Modeling', 'Spatial Analytics'],
    followers: 18900,
    sessions: 12,
    rating: 4.8,
    nextSession: 'Feb 18, 2024',
    achievements: ['UN-Habitat Advisor', 'Smart Cities Pioneer', 'TED Speaker'],
    profileUrl: '/experts/michael-chen',
    linkedIn: 'https://linkedin.com/in/michaelchen-mit',
    isVerified: true,
    isTopRated: true
  },
  {
    id: '3',
    name: 'Dr. Sarah Johnson',
    title: 'Climate Data Scientist',
    organization: 'NASA Goddard Space Flight Center',
    location: 'Maryland, USA',
    avatar: '/api/placeholder/150/150',
    bio: 'Climate researcher specializing in satellite data analysis for global warming studies. Expert in processing large-scale environmental datasets.',
    specialties: ['Climate Science', 'Satellite Data', 'Environmental GIS'],
    followers: 15600,
    sessions: 6,
    rating: 4.9,
    nextSession: 'Feb 25, 2024',
    achievements: ['NASA Excellence Award', 'IPCC Contributor', 'Nature Publications'],
    profileUrl: '/experts/sarah-johnson', 
    linkedIn: 'https://linkedin.com/in/sarahjohnson-nasa',
    isVerified: true,
    isTopRated: false
  },
  {
    id: '4',
    name: 'Eng. Ahmed Al-Rashid',
    title: 'Head of Digital Infrastructure',
    organization: 'Dubai Smart City Initiative',
    location: 'Dubai, UAE',
    avatar: '/api/placeholder/150/150',
    bio: 'Leading Dubai\'s transformation into a smart city through innovative GIS solutions. Expert in IoT integration and real-time urban monitoring systems.',
    specialties: ['Smart Infrastructure', 'IoT Integration', 'Real-time GIS'],
    followers: 9800,
    sessions: 4,
    rating: 4.7,
    nextSession: 'Mar 2, 2024',
    achievements: ['Smart City Award Winner', 'Innovation Leader', 'UAE National Program'],
    profileUrl: '/experts/ahmed-alrashid',
    linkedIn: 'https://linkedin.com/in/ahmed-alrashid-dubai',
    isVerified: true,
    isTopRated: false
  }
];

const FeaturedExpertsSection: React.FC = () => {
  const handleViewProfile = (expert: typeof featuredExperts[0]) => {
    // Navigate to expert profile page
    window.open(expert.profileUrl, '_blank');
  };

  const handleLinkedInProfile = (linkedInUrl: string) => {
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          🧑‍💼 Featured Experts
        </h2>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          View All Experts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredExperts.map((expert) => (
          <Card key={expert.id} className="hover:shadow-lg transition-all duration-300 relative">
            {expert.isTopRated && (
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Top Rated
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <LazyImage
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                    width={80}
                    height={80}
                  />
                  {expert.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                      <Award className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-xl">{expert.name}</h3>
                    {expert.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-primary mb-1">{expert.title}</p>
                  <p className="text-sm text-muted-foreground mb-2">{expert.organization}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {expert.location}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {expert.bio}
              </p>

              <div className="flex flex-wrap gap-1">
                {expert.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-y">
                <div className="text-center">
                  <div className="font-bold text-lg">{expert.followers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{expert.sessions}</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg flex items-center justify-center gap-1">
                    {expert.rating}
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Session:</span>
                  <span className="font-medium">{expert.nextSession}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium">Key Achievements:</div>
                  <div className="text-xs text-muted-foreground">
                    {expert.achievements.join(' • ')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleViewProfile(expert)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleLinkedInProfile(expert.linkedIn)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Connect with world-class geospatial professionals and industry leaders
        </p>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Join Expert Network
        </Button>
      </div>
    </div>
  );
};

export default FeaturedExpertsSection;