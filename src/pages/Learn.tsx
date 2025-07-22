
import YouTubePlayer from "../components/YouTubePlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Download, Clock } from "lucide-react";

const Learn = () => {
  const courses = [
    {
      title: "Introduction to GIS",
      description: "Learn the fundamentals of Geographic Information Systems",
      duration: "2 hours",
      level: "Beginner",
      type: "video"
    },
    {
      title: "Advanced Spatial Analysis",
      description: "Master complex spatial analysis techniques",
      duration: "4 hours",
      level: "Advanced",
      type: "course"
    },
    {
      title: "QGIS Complete Guide",
      description: "Comprehensive QGIS tutorial from basics to advanced",
      duration: "6 hours",
      level: "Intermediate",
      type: "course"
    },
    {
      title: "ArcGIS Enterprise Mastery",
      description: "Master enterprise-level GIS deployment, configuration, and administration",
      duration: "12 hours",
      level: "Expert",
      type: "course",
      coming_soon: true
    }
  ];

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learn Geospatial Technologies</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master GIS, spatial analysis, and geospatial technologies with our comprehensive learning resources.
          </p>
        </div>

        {/* Featured Video */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Tutorial</h2>
          <YouTubePlayer
            videoId="3w308TTUVco"
            title="Complete GIS Tutorial for Beginners"
            description="Learn the fundamentals of GIS with hands-on examples and practical applications. This comprehensive tutorial covers everything you need to get started with geospatial analysis."
          />
        </div>

        {/* Course Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </div>
              <CardDescription>
                Step-by-step video guides for hands-on learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Videos
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Documentation</CardTitle>
              </div>
              <CardDescription>
                Comprehensive guides and reference materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Read Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Resources</CardTitle>
              </div>
              <CardDescription>
                Download sample data, plugins, and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Download Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Course Listing */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex gap-2">
                      {course.coming_soon && (
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      )}
                      <Badge variant={course.level === 'Beginner' ? 'secondary' : course.level === 'Intermediate' ? 'default' : course.level === 'Expert' ? 'destructive' : 'destructive'}>
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      {course.type === 'video' ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      {course.type}
                    </div>
                  </div>
                  <Button className="w-full" variant={course.coming_soon ? "outline" : "default"}>
                    {course.coming_soon ? "Join Waitlist" : "Start Learning"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trial Notice */}
        <div className="mt-12 p-6 bg-accent/10 rounded-lg border border-accent/20">
          <h3 className="text-lg font-semibold mb-2">🎯 Free 7-Day Trial</h3>
          <p className="text-muted-foreground mb-4">
            Get full access to our Learn section with a 7-day free trial. No credit card required.
          </p>
          <Button size="sm">Start Free Trial</Button>
        </div>
      </div>
  );
};

export default Learn;
