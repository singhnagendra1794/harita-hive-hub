
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, Play } from "lucide-react";

const LiveClasses = () => {
  const upcomingClasses = [
    {
      id: 1,
      title: "Advanced QGIS Techniques",
      description: "Learn advanced spatial analysis and automation in QGIS",
      instructor: "Nagendra Singh",
      date: "2024-06-25",
      time: "10:00 AM IST",
      duration: "2 hours",
      enrolled: 45,
      maxCapacity: 100,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Python for GIS Automation",
      description: "Automate GIS workflows using Python and ArcPy",
      instructor: "Nagendra Singh",
      date: "2024-06-27",
      time: "2:00 PM IST",
      duration: "1.5 hours",
      enrolled: 32,
      maxCapacity: 50,
      status: "upcoming"
    }
  ];

  const pastClasses = [
    {
      id: 3,
      title: "Introduction to Remote Sensing",
      description: "Fundamentals of satellite imagery and analysis",
      instructor: "Nagendra Singh",
      date: "2024-06-20",
      recordingUrl: "#",
      duration: "2 hours",
      status: "completed"
    }
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live Classes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join interactive live sessions with expert instructors and fellow learners
          </p>
        </div>

        {/* Upcoming Classes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Upcoming Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingClasses.map((class_) => (
              <Card key={class_.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{class_.title}</CardTitle>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <CardDescription>{class_.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {class_.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {class_.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {class_.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {class_.enrolled}/{class_.maxCapacity} enrolled
                      </div>
                    </div>
                    <p className="text-sm">Instructor: <span className="font-medium">{class_.instructor}</span></p>
                    <Button className="w-full">
                      Join Live Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Classes (Recordings) */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Play className="h-6 w-6" />
            Recorded Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastClasses.map((class_) => (
              <Card key={class_.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{class_.title}</CardTitle>
                    <Badge variant="outline">Recorded</Badge>
                  </div>
                  <CardDescription>{class_.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {class_.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {class_.duration}
                      </div>
                    </div>
                    <p className="text-sm">Instructor: <span className="font-medium">{class_.instructor}</span></p>
                    <Button variant="outline" className="w-full">
                      Watch Recording
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/20">
          <h3 className="text-lg font-semibold mb-2">🎥 Live Streaming Integration</h3>
          <p className="text-muted-foreground mb-4">
            Classes are streamed using industry-standard platforms for the best experience. Automatic recording available for all sessions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <span>HD Video Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Interactive Q&A</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <span>Auto Recording</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveClasses;
