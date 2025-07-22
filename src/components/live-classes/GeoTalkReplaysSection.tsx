import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Users, Eye, BookOpen, Shield, Lock } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/lazy-image';

// Mock replay data
const geoTalkReplays = [
  {
    id: '1',
    title: 'The Future of Geospatial Intelligence in Defense',
    description: 'Exploring cutting-edge GIS applications in military and security operations',
    speaker: 'Col. James Mitchell (Ret.)',
    speakerTitle: 'Former Director, Defense Intelligence Agency',
    duration: 85,
    viewCount: 2341,
    recordedDate: '2024-02-10',
    thumbnail: '/api/placeholder/640/360',
    category: 'Defense & Security',
    difficulty: 'Advanced',
    isPremium: true,
    attendedLive: false,
    tags: ['Defense', 'Intelligence', 'Security']
  },
  {
    id: '2',
    title: 'Building Smart Cities with Open Source GIS',
    description: 'Case studies from successful smart city implementations using QGIS and PostGIS',
    speaker: 'Dr. Elena Vasquez',
    speakerTitle: 'Smart Cities Program Director, Barcelona',
    duration: 72,
    viewCount: 4567,
    recordedDate: '2024-02-08',
    thumbnail: '/api/placeholder/640/360',
    category: 'Urban Planning',
    difficulty: 'Intermediate',
    isPremium: false,
    attendedLive: true,
    tags: ['Smart Cities', 'Open Source', 'Urban Planning']
  },
  {
    id: '3',
    title: 'Climate Change Monitoring: Satellite Data Analysis',
    description: 'Advanced techniques for processing and analyzing satellite imagery for climate research',
    speaker: 'Prof. Rajesh Kumar',
    speakerTitle: 'Climate Research Institute, IIT Delhi',
    duration: 95,
    viewCount: 3892,
    recordedDate: '2024-02-05',
    thumbnail: '/api/placeholder/640/360',
    category: 'Climate Science',
    difficulty: 'Advanced',
    isPremium: true,
    attendedLive: false,
    tags: ['Climate', 'Satellite', 'Remote Sensing']
  },
  {
    id: '4',
    title: 'GIS for Disaster Management: Real-world Applications',
    description: 'How geospatial technology is transforming emergency response and disaster preparedness',
    speaker: 'Dr. Maria Santos',
    speakerTitle: 'UN Office for Disaster Risk Reduction',
    duration: 68,
    viewCount: 5234,
    recordedDate: '2024-02-03',
    thumbnail: '/api/placeholder/640/360',
    category: 'Disaster Management',
    difficulty: 'Intermediate', 
    isPremium: false,
    attendedLive: false,
    tags: ['Disaster Management', 'Emergency Response', 'UN']
  },
  {
    id: '5',
    title: 'Precision Agriculture: IoT and GIS Integration',
    description: 'Combining Internet of Things sensors with GIS for optimized crop management',
    speaker: 'Dr. Lisa Zhang',
    speakerTitle: 'Agricultural Technology Research Center',
    duration: 78,
    viewCount: 2876,
    recordedDate: '2024-01-30',
    thumbnail: '/api/placeholder/640/360',
    category: 'Agriculture',
    difficulty: 'Intermediate',
    isPremium: true,
    attendedLive: true,
    tags: ['Agriculture', 'IoT', 'Precision Farming']
  },
  {
    id: '6',
    title: 'Web GIS Development: From Concept to Deployment',
    description: 'Complete guide to building modern web-based geospatial applications',
    speaker: 'Alex Thompson',
    speakerTitle: 'Senior GIS Developer, Esri',
    duration: 105,
    viewCount: 6789,
    recordedDate: '2024-01-25',
    thumbnail: '/api/placeholder/640/360',
    category: 'Web Development',
    difficulty: 'Advanced',
    isPremium: false,
    attendedLive: false,
    tags: ['Web GIS', 'Development', 'JavaScript']
  }
];

const GeoTalkReplaysSection: React.FC = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  const handleWatchReplay = (replay: typeof geoTalkReplays[0]) => {
    // Check access permissions
    const canWatch = !replay.isPremium || replay.attendedLive || hasAccess('pro');
    
    if (!canWatch) {
      toast({
        title: "Premium Content",
        description: "This session recording is available to PRO subscribers or users who attended the live session.",
        variant: "destructive",
      });
      return;
    }

    // Create proper video page URL (fix the about:blank issue)
    const recordingUrl = `https://stream.haritahive.com/recordings/${replay.id}.mp4`;
    const videoPageUrl = `/watch-recording?url=${encodeURIComponent(recordingUrl)}&title=${encodeURIComponent(replay.title)}&speaker=${encodeURIComponent(replay.speaker)}`;
    
    // Open in new tab without about:blank
    const newTab = window.open(videoPageUrl, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Defense & Security': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Urban Planning': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Climate Science': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Disaster Management': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Agriculture': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Web Development': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';  
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const canWatchReplay = (replay: typeof geoTalkReplays[0]) => {
    return !replay.isPremium || replay.attendedLive || hasAccess('pro');
  };

  const filteredReplays = filter === 'available' 
    ? geoTalkReplays.filter(canWatchReplay)
    : geoTalkReplays;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          🧠 GeoTalk Replays
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Sessions
          </Button>
          <Button 
            variant={filter === 'available' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setFilter('available')}
          >
            Available to Watch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReplays.map((replay) => {
          const hasAccess = canWatchReplay(replay);
          
          return (
            <Card key={replay.id} className="hover:shadow-lg transition-all duration-300 relative group">
              {replay.isPremium && (
                <div className="absolute top-3 right-3 z-10">
                  {hasAccess ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              )}
              
              <CardHeader className="p-0">
                <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                  <LazyImage
                    src={replay.thumbnail}
                    alt={replay.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={640}
                    height={360}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 rounded-full p-3">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {replay.duration}min
                  </div>
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-black/80 rounded-lg p-4 text-center text-white">
                        <Lock className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm">Premium Content</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={getCategoryColor(replay.category)} variant="secondary">
                          {replay.category}
                        </Badge>
                        <Badge className={getDifficultyColor(replay.difficulty)} variant="outline">
                          {replay.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg leading-tight mb-2">
                        {replay.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {replay.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 bg-muted/50 rounded-lg">
                    <div className="font-medium text-sm">{replay.speaker}</div>
                    <div className="text-xs text-muted-foreground">{replay.speakerTitle}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {replay.viewCount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(replay.recordedDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {replay.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handleWatchReplay(replay)}
                    disabled={!hasAccess}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {hasAccess ? 'Watch Recording' : 'Upgrade to Watch'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Access to premium recordings included with PRO subscription
        </p>
        <Button variant="outline">
          <BookOpen className="h-4 w-4 mr-2" />
          Browse All Sessions
        </Button>
      </div>
    </div>
  );
};

export default GeoTalkReplaysSection;