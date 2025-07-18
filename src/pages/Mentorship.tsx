import { useState } from "react";
import { Calendar, Clock, Users, Video, Star, BookOpen, User, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  specialties: string[];
  experience: number;
  isAvailable: boolean;
  bio: string;
}

interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  type: "1-on-1" | "group" | "ama";
  title: string;
  date: string;
  duration: number;
  participants: number;
  maxParticipants?: number;
  level: "beginner" | "intermediate" | "advanced";
  topics: string[];
  price?: number;
  isBooked?: boolean;
}

const Mentorship = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("sessions");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const { toast } = useToast();

  // Mock mentors data
  const mentors: Mentor[] = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      title: "Senior Remote Sensing Scientist",
      company: "NASA",
      avatar: "/api/placeholder/150/150",
      rating: 4.9,
      reviews: 127,
      hourlyRate: 150,
      specialties: ["Remote Sensing", "Machine Learning", "Climate Analysis"],
      experience: 12,
      isAvailable: true,
      bio: "Leading expert in satellite data analysis and climate modeling with 12+ years at NASA."
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      title: "Lead GIS Developer",
      company: "Esri",
      avatar: "/api/placeholder/150/150",
      rating: 4.8,
      reviews: 94,
      hourlyRate: 120,
      specialties: ["Web GIS", "ArcGIS", "JavaScript", "Python"],
      experience: 8,
      isAvailable: true,
      bio: "Full-stack GIS developer specializing in enterprise web mapping solutions."
    },
    {
      id: "3",
      name: "Dr. Priya Sharma",
      title: "Geospatial Data Scientist",
      company: "Google",
      avatar: "/api/placeholder/150/150",
      rating: 4.9,
      reviews: 156,
      hourlyRate: 180,
      specialties: ["Google Earth Engine", "Big Data", "Spatial Analytics"],
      experience: 10,
      isAvailable: false,
      bio: "Expert in large-scale geospatial analytics and cloud computing platforms."
    }
  ];

  // Mock sessions data
  const sessions: Session[] = [
    {
      id: "1",
      mentorId: "1",
      mentorName: "Dr. Sarah Chen",
      type: "ama",
      title: "Career Paths in Remote Sensing - AMA",
      date: "2024-01-25T18:00:00Z",
      duration: 60,
      participants: 45,
      maxParticipants: 100,
      level: "beginner",
      topics: ["Career Guidance", "Remote Sensing", "Industry Insights"],
      price: 0
    },
    {
      id: "2",
      mentorId: "2",
      mentorName: "Marcus Rodriguez",
      type: "group",
      title: "Building Interactive Web Maps",
      date: "2024-01-26T20:00:00Z",
      duration: 90,
      participants: 12,
      maxParticipants: 20,
      level: "intermediate",
      topics: ["Web Development", "Leaflet", "Mapbox"],
      price: 49
    },
    {
      id: "3",
      mentorId: "3",
      mentorName: "Dr. Priya Sharma",
      type: "1-on-1",
      title: "Google Earth Engine Deep Dive",
      date: "2024-01-27T16:00:00Z",
      duration: 60,
      participants: 1,
      maxParticipants: 1,
      level: "advanced",
      topics: ["Google Earth Engine", "JavaScript", "Cloud Computing"],
      price: 180,
      isBooked: true
    },
    {
      id: "4",
      mentorId: "1",
      mentorName: "Dr. Sarah Chen",
      type: "group",
      title: "Machine Learning for Earth Observation",
      date: "2024-01-28T19:00:00Z",
      duration: 120,
      participants: 8,
      maxParticipants: 15,
      level: "advanced",
      topics: ["Machine Learning", "Python", "Satellite Data"],
      price: 79
    }
  ];

  const filteredSessions = selectedLevel === "all" 
    ? sessions 
    : sessions.filter(session => session.level === selectedLevel);

  const handleBookSession = (sessionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a mentorship session.",
        variant: "destructive"
      });
      return;
    }

    const session = sessions.find(s => s.id === sessionId);
    if (session?.price === 0) {
      toast({
        title: "Session Booked",
        description: "You've successfully registered for the free AMA session!",
      });
    } else {
      toast({
        title: "Redirecting to Payment",
        description: "You'll be redirected to complete your booking...",
      });
    }
  };

  const handleContactMentor = (mentorId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to contact mentors.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Message Sent",
      description: "Your message has been sent to the mentor. They'll respond within 24 hours.",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "1-on-1": return <User className="h-4 w-4" />;
      case "group": return <Users className="h-4 w-4" />;
      case "ama": return <MessageCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Learn with Expert Mentors</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Get personalized guidance from industry professionals and accelerate your geospatial career
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
            <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            {/* Level Filter */}
            <div className="flex gap-2 mb-6">
              <Button 
                variant={selectedLevel === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedLevel("all")}
              >
                All Levels
              </Button>
              <Button 
                variant={selectedLevel === "beginner" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedLevel("beginner")}
              >
                Beginner
              </Button>
              <Button 
                variant={selectedLevel === "intermediate" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedLevel("intermediate")}
              >
                Intermediate
              </Button>
              <Button 
                variant={selectedLevel === "advanced" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedLevel("advanced")}
              >
                Advanced
              </Button>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSessionTypeIcon(session.type)}
                          <Badge variant="outline" className="capitalize">
                            {session.type.replace("-", " ")}
                          </Badge>
                          <Badge className={getLevelColor(session.level)}>
                            {session.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                        <p className="text-primary font-semibold">{session.mentorName}</p>
                      </div>
                      <div className="text-right">
                        {session.price === 0 ? (
                          <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                          <span className="text-lg font-bold">${session.price}</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {session.participants}/{session.maxParticipants || "∞"}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {session.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handleBookSession(session.id)}
                        disabled={session.isBooked}
                      >
                        {session.isBooked ? "Booked" : session.price === 0 ? "Join Free Session" : "Book Session"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} />
                        <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                      <p className="text-primary font-semibold">{mentor.title}</p>
                      <p className="text-muted-foreground text-sm">{mentor.company}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{mentor.rating}</span>
                          <span className="text-muted-foreground text-sm">({mentor.reviews})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">${mentor.hourlyRate}/hr</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {mentor.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-muted-foreground text-sm">{mentor.bio}</p>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleContactMentor(mentor.id)}
                          disabled={!mentor.isAvailable}
                        >
                          {mentor.isAvailable ? "Contact" : "Unavailable"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Booked Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No sessions booked yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Book your first mentorship session to get personalized guidance
                  </p>
                  <Button onClick={() => setActiveTab("sessions")}>
                    Browse Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Mentorship;