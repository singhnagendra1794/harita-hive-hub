import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, Globe, Star, Bookmark } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Mock upcoming events data
const upcomingEvents = [
  {
    id: '1',
    title: 'Future of Urban Planning: AI & GIS Integration',
    description: 'Exploring how artificial intelligence is revolutionizing urban planning workflows',
    speaker: 'Dr. Sarah Chen',
    speakerTitle: 'Senior Urban Planner, Smart Cities Initiative',
    date: '2024-02-15',
    time: '14:00',
    duration: 90,
    timezone: 'UTC',
    type: 'Keynote',
    difficulty: 'Intermediate',
    attendees: 234,
    tags: ['AI', 'Urban Planning', 'GIS'],
    isPopular: true
  },
  {
    id: '2', 
    title: 'Satellite Imagery Analysis for Climate Research',
    description: 'Latest techniques in remote sensing for environmental monitoring and climate change studies',
    speaker: 'Prof. Michael Rodriguez',
    speakerTitle: 'Climate Research Institute, NASA',
    date: '2024-02-18',
    time: '16:00',
    duration: 60,
    timezone: 'UTC',
    type: 'Technical Workshop',
    difficulty: 'Advanced',
    attendees: 156,
    tags: ['Remote Sensing', 'Climate', 'Satellite'],
    isPopular: false
  },
  {
    id: '3',
    title: 'Getting Started with QGIS: Complete Beginner Guide',
    description: 'Comprehensive introduction to QGIS for newcomers to geospatial technology',
    speaker: 'Nagendra Singh',
    speakerTitle: 'Lead Instructor, HaritaHive',
    date: '2024-02-20',
    time: '12:00', 
    duration: 120,
    timezone: 'UTC',
    type: 'Beginner Course',
    difficulty: 'Beginner',
    attendees: 445,
    tags: ['QGIS', 'Beginner', 'Tutorial'],
    isPopular: true
  },
  {
    id: '4',
    title: 'GeoAI Applications in Agriculture: Crop Monitoring',
    description: 'Using machine learning and geospatial data for precision agriculture solutions',
    speaker: 'Dr. Priya Sharma',
    speakerTitle: 'Agricultural Technology Specialist',
    date: '2024-02-22',
    time: '10:00',
    duration: 75,
    timezone: 'UTC',
    type: 'Case Study',
    difficulty: 'Intermediate',
    attendees: 189,
    tags: ['Agriculture', 'AI', 'Crop Monitoring'],
    isPopular: false
  }
];

const UpcomingEventsSection: React.FC = () => {
  const { toast } = useToast();

  const handleRegister = (eventId: string, title: string) => {
    toast({
      title: "Registration Successful",
      description: `You've registered for "${title}". We'll send you a reminder before the session starts.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Keynote': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Technical Workshop': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Beginner Course': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Case Study': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          📅 Upcoming Events
        </h2>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View Full Calendar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-all duration-300 relative">
            {event.isPopular && (
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge className={getDifficultyColor(event.difficulty)}>
                      {event.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.time} UTC ({event.duration}min)
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {event.attendees} registered
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Global
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium text-sm mb-1">{event.speaker}</div>
                  <div className="text-xs text-muted-foreground">{event.speakerTitle}</div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleRegister(event.id, event.title)}
                  >
                    Register Free
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-muted-foreground text-sm mb-4">
          All sessions are recorded and available to attendees
        </p>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View More Events
        </Button>
      </div>
    </div>
  );
};

export default UpcomingEventsSection;