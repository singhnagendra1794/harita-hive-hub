import { useState } from "react";
import { Upload, Video, Mic, Settings, Play, Download, Share, Globe, FileText, Camera } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CreatedContent {
  id: string;
  title: string;
  type: "tutorial" | "walkthrough" | "analysis" | "demo";
  thumbnail: string;
  duration: string;
  views: number;
  createdAt: string;
  status: "processing" | "ready" | "error";
}

const Studio = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Mock content data
  const [myContent, setMyContent] = useState<CreatedContent[]>([
    {
      id: "1",
      title: "QGIS Buffer Analysis Tutorial",
      type: "tutorial",
      thumbnail: "/api/placeholder/300/200",
      duration: "12:34",
      views: 1245,
      createdAt: "2024-01-15",
      status: "ready"
    },
    {
      id: "2",
      title: "Google Earth Engine Landsat Analysis",
      type: "analysis",
      thumbnail: "/api/placeholder/300/200",
      duration: "18:22",
      views: 832,
      createdAt: "2024-01-12",
      status: "ready"
    },
    {
      id: "3",
      title: "Web Map Walkthrough",
      type: "walkthrough",
      thumbnail: "/api/placeholder/300/200",
      duration: "8:45",
      views: 0,
      createdAt: "2024-01-18",
      status: "processing"
    }
  ]);

  const handleStartRecording = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create content.",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Your screen recording has begun. Click stop when finished.",
    });

    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Recording Complete",
        description: "Your video is being processed and will be available soon.",
      });
    }, 5000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload content.",
        variant: "destructive"
      });
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Upload Complete",
            description: "Your video has been uploaded successfully!",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleAIVoiceover = () => {
    toast({
      title: "AI Voiceover",
      description: "AI voiceover generation will be available soon!",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-600";
      case "processing": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready": return "Ready";
      case "processing": return "Processing...";
      case "error": return "Error";
      default: return "Unknown";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Content Creation Studio</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Create, upload, and share your geospatial knowledge with the world
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
            <TabsTrigger value="my-content">My Content</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Screen Recording */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Screen Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Record your screen to create tutorials and demonstrations
                  </p>
                  <Button 
                    onClick={handleStartRecording}
                    className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    disabled={isRecording}
                  >
                    {isRecording ? 'Recording...' : 'Start Recording'}
                  </Button>
                  {isRecording && (
                    <div className="mt-4 text-center">
                      <div className="animate-pulse text-red-600">● REC</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Walkthrough */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Map Walkthrough
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create guided tours of your maps with voiceover
                  </p>
                  <Button className="w-full" onClick={() => toast({ title: "Feature Coming Soon", description: "Map walkthrough creator is in development." })}>
                    Create Walkthrough
                  </Button>
                </CardContent>
              </Card>

              {/* Before/After Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Before/After Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Showcase temporal changes using satellite imagery
                  </p>
                  <Button className="w-full" onClick={() => toast({ title: "Feature Coming Soon", description: "Before/after analysis tool is in development." })}>
                    Create Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Recording Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Recording Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="framerate">Frame Rate</Label>
                    <Select defaultValue="30fps">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24fps">24 FPS</SelectItem>
                        <SelectItem value="30fps">30 FPS</SelectItem>
                        <SelectItem value="60fps">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audio">Audio Source</Label>
                    <Select defaultValue="microphone">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Audio</SelectItem>
                        <SelectItem value="microphone">Microphone</SelectItem>
                        <SelectItem value="system">System Audio</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Video Content</CardTitle>
                <p className="text-muted-foreground">
                  Upload your existing videos, screen recordings, or presentations
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">Drop your video files here</p>
                    <p className="text-muted-foreground mb-4">
                      Supports MP4, MOV, AVI, and more. Max file size: 2GB
                    </p>
                    <div className="flex justify-center">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button asChild>
                          <span>Choose Files</span>
                        </Button>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </Label>
                    </div>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Video Title</Label>
                      <Input id="title" placeholder="Enter video title..." />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="walkthrough">Map Walkthrough</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="demo">Project Demo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe your video content..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full">
                    Upload and Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Voiceover */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    AI Voiceover Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Generate professional voiceovers for your videos using AI
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voice-text">Script</Label>
                      <Textarea 
                        id="voice-text"
                        placeholder="Enter your script here..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voice-type">Voice Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional-male">Professional Male</SelectItem>
                          <SelectItem value="professional-female">Professional Female</SelectItem>
                          <SelectItem value="casual-male">Casual Male</SelectItem>
                          <SelectItem value="casual-female">Casual Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAIVoiceover} className="w-full">
                      Generate Voiceover
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Auto Subtitles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Auto Subtitles & Translation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Automatically generate subtitles and translate to multiple languages
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="source-lang">Source Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="target-langs">Target Languages</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select languages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Major Languages</SelectItem>
                          <SelectItem value="european">European Languages</SelectItem>
                          <SelectItem value="asian">Asian Languages</SelectItem>
                          <SelectItem value="custom">Custom Selection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={() => toast({ title: "Feature Coming Soon", description: "Auto subtitles feature is in development." })}>
                      Generate Subtitles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="my-content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Content</h2>
              <Button onClick={() => setActiveTab("create")}>
                Create New Content
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myContent.map((content) => (
                <Card key={content.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                      {content.duration}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(content.status)}`}>
                        {getStatusText(content.status)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{content.title}</h3>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                      <span>{content.views} views</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myContent.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating your first video to share your geospatial knowledge
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  Create Your First Video
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Studio;