import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  ChevronDown,
  Download,
  MessageCircle,
  CheckCircle,
  BookOpen,
  Code,
  Database,
  Globe,
  Brain,
  Trophy,
  Target,
  Zap
} from "lucide-react";
import { useChatbotIntegration } from "@/hooks/useChatbotIntegration";

interface GeospatialTechUnlockedDetailsProps {
  currencyMode: 'INR' | 'USD';
  isEnrollmentOpen: boolean;
  onEnrollNow: () => void;
}

const GeospatialTechUnlockedDetails = ({ 
  currencyMode, 
  isEnrollmentOpen, 
  onEnrollNow 
}: GeospatialTechUnlockedDetailsProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["track1"]);
  const { askQuestion } = useChatbotIntegration();

  const handleAskAva = () => {
    askQuestion("I want to know more about the Geospatial Technology Unlocked course. Can you tell me about the curriculum, pricing, and enrollment process?");
  };

  const handleDownloadCurriculum = () => {
    // This would typically trigger a PDF download
    console.log("Downloading curriculum PDF...");
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const price = currencyMode === 'INR' ? '₹11,999' : '$149';

  const curriculum = [
    {
      id: "track1",
      title: "🔹 Track 1: Foundations of Geospatial Science",
      duration: "Days 1–25",
      description: "Build your foundation in GIS concepts, data types, and coordinate systems",
      icon: BookOpen,
      lessons: [
        { day: "1", topic: "Intro to Geospatial Tech", objectives: "Understand 'Where' and 'Why there'", tools: "—", project: "Real-world mapping" },
        { day: "2–3", topic: "GIS Concepts & Data Types", objectives: "Vector vs Raster", tools: "QGIS", project: "Load data layers" },
        { day: "4", topic: "Coordinate Systems", objectives: "GCS vs PCS", tools: "QGIS", project: "Reproject + Measure" },
        { day: "5–7", topic: "Spatial Data Management", objectives: "File formats, databases", tools: "QGIS, PostGIS", project: "Data organization" },
        { day: "8–12", topic: "Spatial Analysis Fundamentals", objectives: "Buffers, overlays, queries", tools: "QGIS", project: "Site suitability analysis" },
        { day: "13–18", topic: "Cartography & Visualization", objectives: "Map design principles", tools: "QGIS, Illustrator", project: "Professional map creation" },
        { day: "19–25", topic: "Remote Sensing Basics", objectives: "Satellite imagery analysis", tools: "QGIS, SNAP", project: "Land cover classification" }
      ]
    },
    {
      id: "track2",
      title: "🔹 Track 2: Spatial Programming & Automation",
      duration: "Days 26–50",
      description: "Master Python, R, SQL, and automation for geospatial workflows",
      icon: Code,
      lessons: [
        { day: "26–30", topic: "Python for GIS", objectives: "GeoPandas, Shapely, Fiona", tools: "Python, Jupyter", project: "Automated data processing" },
        { day: "31–35", topic: "SQL & PostGIS", objectives: "Spatial databases", tools: "PostgreSQL, PostGIS", project: "Spatial database design" },
        { day: "36–40", topic: "R for Spatial Analysis", objectives: "SF, Raster packages", tools: "R, RStudio", project: "Statistical analysis" },
        { day: "41–45", topic: "QGIS Automation", objectives: "PyQGIS scripting", tools: "QGIS, Python", project: "Custom QGIS plugins" },
        { day: "46–50", topic: "Workflow Automation", objectives: "Batch processing, APIs", tools: "Python, APIs", project: "Automated reporting system" }
      ]
    },
    {
      id: "track3",
      title: "🔹 Track 3: Web GIS & Cloud Platforms",
      duration: "Days 51–70",
      description: "Build interactive web maps and leverage cloud platforms",
      icon: Globe,
      lessons: [
        { day: "51–55", topic: "Leaflet Web Maps", objectives: "Interactive mapping", tools: "Leaflet, HTML/CSS/JS", project: "Interactive dashboard" },
        { day: "56–60", topic: "Mapbox Integration", objectives: "Custom styling, APIs", tools: "Mapbox Studio", project: "Custom web app" },
        { day: "61–65", topic: "Google Earth Engine", objectives: "Cloud computing", tools: "GEE, JavaScript", project: "Environmental monitoring" },
        { day: "66–70", topic: "ArcGIS Online", objectives: "Enterprise solutions", tools: "ArcGIS Online", project: "Organization portal" }
      ]
    },
    {
      id: "track4",
      title: "🔹 Track 4: GeoAI & Deep Learning",
      duration: "Days 71–100+",
      description: "Apply AI and machine learning to geospatial problems",
      icon: Brain,
      lessons: [
        { day: "71–75", topic: "Machine Learning Fundamentals", objectives: "Classification, regression", tools: "Scikit-learn", project: "Predictive modeling" },
        { day: "76–80", topic: "Deep Learning for RS", objectives: "CNN, YOLO, UNet", tools: "TensorFlow, PyTorch", project: "Object detection" },
        { day: "81–85", topic: "Change Detection", objectives: "Time series analysis", tools: "Python, GEE", project: "Deforestation monitoring" },
        { day: "86–90", topic: "AI Deployment", objectives: "Model serving, APIs", tools: "Flask, Docker", project: "AI-powered web service" },
        { day: "91–100+", topic: "Capstone Projects", objectives: "Portfolio development", tools: "All tools", project: "Industry-ready solutions" }
      ]
    }
  ];

  const deliverables = [
    { icon: Globe, title: "Personal GIS Website", description: "Showcase your projects and skills" },
    { icon: Code, title: "GitHub Repository", description: "Professional code portfolio" },
    { icon: Trophy, title: "Completion Certificate", description: "Industry-recognized credential" },
    { icon: Target, title: "Job-Ready Skills", description: "Internship and employment preparation" }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <CardHeader className="relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
                  🟢 Ongoing
                </Badge>
                <Badge variant="outline">Live Training</Badge>
              </div>
              <CardTitle className="text-3xl lg:text-4xl mb-3">
                Geospatial Technology Unlocked - Batch 1
              </CardTitle>
              <CardDescription className="text-lg mb-4">
                90-Day Advanced Practical Program – GIS, Remote Sensing, Python, SQL, GeoAI
              </CardDescription>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>35 Enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>90+ Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>5.0 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Mon-Sat</span>
                </div>
              </div>
            </div>
            
            <div className="bg-background/80 backdrop-blur p-6 rounded-lg border">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{price}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  ⏳ Enroll before <strong>25th July, 11:59 PM IST</strong>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={onEnrollNow}
                    className="w-full"
                    disabled={!isEnrollmentOpen}
                  >
                    {isEnrollmentOpen ? "Join Now" : "Enrollment Closed"}
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAskAva}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Ask AVA
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadCurriculum}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Format & Outcomes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Learning Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Lectures</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex justify-between">
              <span>Practical Demos + Exercises</span>
              <span className="font-semibold">75%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              4 Major Capstone Projects • Real-World Tools • Portfolio Ready
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✅ Deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {deliverables.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <item.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📚 Full Curriculum</CardTitle>
          <CardDescription>
            Comprehensive 4-track learning path designed to make you job-ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {curriculum.map((track) => (
            <Collapsible 
              key={track.id}
              open={openSections.includes(track.id)}
              onOpenChange={() => toggleSection(track.id)}
            >
              <CollapsibleTrigger className="w-full">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <track.icon className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-semibold">{track.title}</div>
                          <div className="text-sm text-muted-foreground">{track.duration}</div>
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        openSections.includes(track.id) ? 'rotate-180' : ''
                      }`} />
                    </div>
                    <div className="text-sm text-muted-foreground text-left">
                      {track.description}
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <div className="ml-4 border-l-2 border-primary/20 pl-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">Day</th>
                          <th className="text-left py-2 pr-4 font-medium">Topic</th>
                          <th className="text-left py-2 pr-4 font-medium">Objectives</th>
                          <th className="text-left py-2 pr-4 font-medium">Tools</th>
                          <th className="text-left py-2 font-medium">Project</th>
                        </tr>
                      </thead>
                      <tbody>
                        {track.lessons.map((lesson, index) => (
                          <tr key={index} className="border-b border-muted">
                            <td className="py-2 pr-4 font-medium text-primary">{lesson.day}</td>
                            <td className="py-2 pr-4">{lesson.topic}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{lesson.objectives}</td>
                            <td className="py-2 pr-4">
                              <Badge variant="outline" className="text-xs">{lesson.tools}</Badge>
                            </td>
                            <td className="py-2">{lesson.project}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Real-time Course Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">35</div>
              <div className="text-sm text-muted-foreground">Learners Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">Spots Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1.5h</div>
              <div className="text-sm text-muted-foreground">Daily Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">90+</div>
              <div className="text-sm text-muted-foreground">Days Training</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeospatialTechUnlockedDetails;