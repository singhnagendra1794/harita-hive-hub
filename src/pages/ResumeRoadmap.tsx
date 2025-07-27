import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Upload, Target, Calendar, MapPin, TrendingUp, Brain, Zap, CheckCircle, Clock, AlertCircle } from "lucide-react";

const ResumeRoadmap = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userResumes, setUserResumes] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user resumes
      const { data: resumesData } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch career roadmaps
      const { data: roadmapsData } = await supabase
        .from('career_roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setUserResumes(resumesData || []);
      setRoadmaps(roadmapsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (resumeId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { resumeId, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career roadmap generated successfully!",
      });
      
      fetchUserData(); // Refresh data
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate roadmap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mockRoadmapData = {
    targetRole: "Senior GIS Analyst",
    estimatedTimeToGoal: "6 months",
    skillsToAcquire: ["Advanced Python for GIS", "Machine Learning", "Cloud Computing", "Database Management"],
    certificationTargets: ["GISP Certification", "AWS Cloud Practitioner", "Esri Technical Certification"],
    currentProgress: 35
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your career roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Career Roadmap</h1>
        <p className="text-muted-foreground">
          Build your personalized career path in geospatial technology
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resumes">My Resumes</TabsTrigger>
          <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Career Target</h3>
                    <p className="text-sm text-muted-foreground">{mockRoadmapData.targetRole}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Timeline</h3>
                    <p className="text-sm text-muted-foreground">{mockRoadmapData.estimatedTimeToGoal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Progress</h3>
                    <p className="text-sm text-muted-foreground">{mockRoadmapData.currentProgress}% Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Learning Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{mockRoadmapData.currentProgress}%</span>
                </div>
                <Progress value={mockRoadmapData.currentProgress} className="w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Skills to Acquire</h4>
                  <div className="space-y-2">
                    {mockRoadmapData.skillsToAcquire.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Target Certifications</h4>
                  <div className="space-y-2">
                    {mockRoadmapData.certificationTargets.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Resumes</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>

          {userResumes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Resumes Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your resume to get a personalized career roadmap
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userResumes.map((resume: any) => (
                <Card key={resume.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{resume.file_name || 'Resume'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" onClick={() => handleGenerateRoadmap(resume.id)}>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Roadmap
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roadmaps" className="space-y-6">
          <h2 className="text-2xl font-semibold">Generated Roadmaps</h2>
          
          {roadmaps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Roadmaps Generated</h3>
                <p className="text-muted-foreground">
                  Upload a resume and generate your first career roadmap
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {roadmaps.map((roadmap: any) => (
                <Card key={roadmap.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MapPin className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">Career Roadmap</h3>
                          <p className="text-sm text-muted-foreground">
                            Generated {new Date(roadmap.created_at).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {roadmap.generation_status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Progress</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Learning Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Complete Python for GIS Course</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>AWS Cloud Certification Study</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Complete 3 GIS Projects</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeRoadmap;