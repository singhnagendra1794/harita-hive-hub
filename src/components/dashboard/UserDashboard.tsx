
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  MapPin, 
  Code, 
  Users, 
  Brain,
  Layers,
  Puzzle,
  TrendingUp,
  Clock,
  Award,
  Play,
  FileText,
  Zap
} from "lucide-react";

const UserDashboard = () => {
  // Mock user progress data
  const userStats = {
    coursesCompleted: 3,
    totalCourses: 12,
    projectsCreated: 7,
    skillLevel: "Intermediate",
    streakDays: 5,
    totalPoints: 2450
  };

  const recentActivity = [
    { id: 1, type: "course", title: "Advanced QGIS Analysis", progress: 85, icon: BookOpen },
    { id: 2, type: "project", title: "Urban Planning Map", status: "In Progress", icon: MapPin },
    { id: 3, type: "geoai", title: "NDVI Analysis", result: "Completed", icon: Brain },
    { id: 4, type: "webgis", title: "Environmental Dashboard", status: "Draft", icon: Layers }
  ];

  const quickActions = [
    {
      title: "Start Learning",
      description: "Continue your GIS education",
      icon: BookOpen,
      href: "/learn",
      color: "bg-blue-500"
    },
    {
      title: "Map Playground",
      description: "Create interactive maps",
      icon: MapPin,
      href: "/map-playground", 
      color: "bg-green-500"
    },
    {
      title: "GeoAI Lab",
      description: "AI-powered spatial analysis",
      icon: Brain,
      href: "/geoai-lab",
      color: "bg-purple-500"
    },
    {
      title: "Web GIS Builder",
      description: "Build GIS applications",
      icon: Layers,
      href: "/webgis-builder",
      color: "bg-orange-500"
    },
    {
      title: "Plugin Store",
      description: "Browse GIS tools & plugins",
      icon: Puzzle,
      href: "/plugin-marketplace",
      color: "bg-pink-500"
    },
    {
      title: "Code Snippets",
      description: "Ready-to-use GIS code",
      icon: Code,
      href: "/code-snippets",
      color: "bg-indigo-500"
    }
  ];

  const achievements = [
    { name: "First Map Created", earned: true, icon: MapPin },
    { name: "Course Completed", earned: true, icon: BookOpen },
    { name: "AI Analysis Expert", earned: false, icon: Brain },
    { name: "Community Contributor", earned: false, icon: Users }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Ready to continue your GIS journey?</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">
                  {userStats.coursesCompleted}/{userStats.totalCourses}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={(userStats.coursesCompleted / userStats.totalCourses) * 100} 
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{userStats.projectsCreated}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{userStats.streakDays} days</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{userStats.skillLevel}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {'progress' in item ? `${item.progress}% complete` : item.status || item.result}
                    </p>
                  </div>
                  {'progress' in item && (
                    <div className="w-20">
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    achievement.earned 
                      ? 'border-green-200 bg-green-50 text-green-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                >
                  <achievement.icon className={`h-8 w-8 mx-auto mb-2 ${
                    achievement.earned ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium">{achievement.name}</p>
                  {achievement.earned && (
                    <Badge variant="secondary" className="mt-1">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Advanced Spatial Analysis</h3>
                <p className="text-sm text-muted-foreground">Chapter 3: Network Analysis</p>
                <Progress value={65} className="w-32 h-2 mt-2" />
              </div>
            </div>
            <Button asChild>
              <Link to="/learn">Continue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
