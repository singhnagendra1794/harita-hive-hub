
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FolderPlus, 
  Download, 
  Eye, 
  MapPin, 
  BarChart3, 
  Trees, 
  Building, 
  Truck, 
  Activity,
  Clock,
  Users,
  ExternalLink,
  Copy,
  Github
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProjectTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewModal, setPreviewModal] = useState({ open: false, template: null });
  const [useTemplateModal, setUseTemplateModal] = useState({ open: false, template: null });
  const { toast } = useToast();

  const templates = [
    {
      id: 1,
      title: "Urban Planning Analysis",
      description: "Comprehensive template for urban development planning with zoning analysis, population density mapping, and infrastructure assessment.",
      category: "urban",
      difficulty: "intermediate",
      estimatedTime: "4-6 hours",
      icon: Building,
      features: [
        "Zoning map creation",
        "Population density analysis",
        "Infrastructure assessment",
        "Land use classification",
        "Transportation network analysis"
      ],
      files: [
        "urban_planning_workflow.py",
        "sample_census_data.csv",
        "zoning_boundaries.geojson",
        "infrastructure_points.shp",
        "analysis_templates.qgz"
      ],
      downloads: 234,
      rating: 4.8,
      sampleData: true,
      githubUrl: "https://github.com/haritahive/urban-planning-template",
      colabUrl: "https://colab.research.google.com/github/haritahive/urban-planning-template",
      downloadUrl: "/templates/urban-planning.zip",
      longDescription: "This comprehensive urban planning template provides a complete workflow for analyzing urban development patterns. It includes advanced spatial analysis techniques, demographic data integration, and visualization tools specifically designed for urban planners and policy makers. The template covers everything from initial data preparation to final report generation.",
      tags: ["Urban Planning", "Zoning", "Demographics", "QGIS", "Python"]
    },
    {
      id: 2,
      title: "Environmental Monitoring",
      description: "Track environmental changes over time with satellite imagery analysis, vegetation indices, and water quality assessment.",
      category: "environmental",
      difficulty: "advanced",
      estimatedTime: "6-8 hours",
      icon: Trees,
      features: [
        "NDVI calculation",
        "Water quality monitoring",
        "Deforestation analysis",
        "Air quality mapping",
        "Climate data visualization"
      ],
      files: [
        "environmental_analysis.py",
        "satellite_imagery_processing.py",
        "water_quality_data.csv",
        "vegetation_polygons.geojson",
        "climate_stations.shp"
      ],
      downloads: 189,
      rating: 4.9,
      sampleData: true,
      githubUrl: "https://github.com/haritahive/environmental-monitoring-template",
      colabUrl: "https://colab.research.google.com/github/haritahive/environmental-monitoring-template",
      downloadUrl: "/templates/environmental-monitoring.zip",
      longDescription: "Advanced environmental monitoring template using satellite imagery analysis and machine learning techniques. This template includes workflows for vegetation health assessment, water quality monitoring, and climate change impact analysis using remote sensing data.",
      tags: ["Environmental", "Remote Sensing", "NDVI", "Python", "Machine Learning"]
    },
    {
      id: 3,
      title: "Business Location Analysis",
      description: "Find optimal business locations using demographic analysis, competitor mapping, and accessibility scoring.",
      category: "business",
      difficulty: "beginner",
      estimatedTime: "2-3 hours",
      icon: MapPin,
      features: [
        "Demographic analysis",
        "Competitor location mapping",
        "Accessibility scoring",
        "Market area definition",
        "Site suitability analysis"
      ],
      files: [
        "business_analysis.py",
        "demographic_data.csv",
        "competitor_locations.geojson",
        "transportation_network.shp",
        "market_boundaries.kml"
      ],
      downloads: 312,
      rating: 4.7,
      sampleData: true,
      githubUrl: "https://github.com/haritahive/business-location-template",
      colabUrl: "https://colab.research.google.com/github/haritahive/business-location-template",
      downloadUrl: "/templates/business-location.zip",
      longDescription: "Strategic business location analysis template designed for retail and service businesses. Includes demographic analysis, competitor mapping, foot traffic analysis, and market penetration modeling to identify optimal business locations.",
      tags: ["Business Analysis", "Demographics", "Site Selection", "Market Research", "GIS"]
    },
    {
      id: 4,
      title: "Transportation Network Analysis",
      description: "Analyze transportation systems, optimize routes, and assess network connectivity and accessibility.",
      category: "transportation",
      difficulty: "advanced",
      estimatedTime: "5-7 hours",
      icon: Truck,
      features: [
        "Route optimization",
        "Network connectivity analysis",
        "Service area calculation",
        "Traffic flow modeling",
        "Public transit accessibility"
      ],
      files: [
        "network_analysis.py",
        "road_network.shp",
        "traffic_data.csv",
        "transit_stops.geojson",
        "service_areas.gpkg"
      ],
      downloads: 156,
      rating: 4.6,
      sampleData: true,
      githubUrl: "https://github.com/haritahive/transportation-network-template",
      colabUrl: "https://colab.research.google.com/github/haritahive/transportation-network-template",
      downloadUrl: "/templates/transportation-network.zip",
      longDescription: "Comprehensive transportation network analysis template covering route optimization, accessibility analysis, and network connectivity assessment. Perfect for transportation planners and logistics companies.",
      tags: ["Transportation", "Network Analysis", "Route Optimization", "Accessibility", "GTFS"]
    },
    {
      id: 5,
      title: "Agricultural Precision Farming",
      description: "Optimize crop management with field analysis, soil mapping, and yield prediction using remote sensing data.",
      category: "agriculture",
      difficulty: "intermediate",
      estimatedTime: "3-5 hours",
      icon: Activity,
      features: [
        "Soil fertility mapping",
        "Crop health monitoring",
        "Yield prediction modeling",
        "Irrigation planning",
        "Pest risk assessment"
      ],
      files: [
        "precision_farming.py",
        "field_boundaries.shp",
        "soil_samples.csv",
        "crop_imagery.tif",
        "weather_data.json"
      ],
      downloads: 198,
      rating: 4.5,
      sampleData: true,
      githubUrl: "https://github.com/haritahive/precision-farming-template",
      colabUrl: "https://colab.research.google.com/github/haritahive/precision-farming-template",
      downloadUrl: "/templates/precision-farming.zip",
      longDescription: "Modern precision farming template utilizing drone imagery, IoT sensor data, and machine learning for crop optimization. Includes soil health mapping, yield prediction, and irrigation planning workflows.",
      tags: ["Agriculture", "Precision Farming", "Drones", "IoT", "Crop Monitoring"]
    },
    {
      id: 6,
      title: "Disaster Risk Assessment",
      description: "Assess and map natural disaster risks including flood zones, earthquake vulnerability, and evacuation planning.",
      category: "emergency",
      difficulty: "advanced",
      estimatedTime: "6-9 hours",
      icon: BarChart3,
      features: [
        "Flood risk modeling",
        "Vulnerability assessment",
        "Evacuation route planning",
        "Emergency facility mapping",
        "Population exposure analysis"
      ],
      files: [
        "disaster_risk_analysis.py",
        "elevation_model.tif",
        "historical_disasters.csv",
        "emergency_facilities.geojson",
        "population_grid.shp"
      ],
      downloads: 145,
      rating: 4.8,
      sampleData: true,
      githubUrl: "https://github.com/haritahive/disaster-risk-template",
      colabUrl: "https://colab.research.google.com/github/haritahive/disaster-risk-template",
      downloadUrl: "/templates/disaster-risk.zip",
      longDescription: "Advanced disaster risk assessment template for emergency management professionals. Includes flood modeling, vulnerability mapping, evacuation planning, and real-time risk monitoring capabilities.",
      tags: ["Disaster Management", "Risk Assessment", "Emergency Planning", "Flood Modeling", "GIS"]
    }
  ];

  const categories = [
    { value: "all", label: "All Categories", count: templates.length },
    { value: "urban", label: "Urban Planning", count: templates.filter(t => t.category === "urban").length },
    { value: "environmental", label: "Environmental", count: templates.filter(t => t.category === "environmental").length },
    { value: "business", label: "Business", count: templates.filter(t => t.category === "business").length },
    { value: "transportation", label: "Transportation", count: templates.filter(t => t.category === "transportation").length },
    { value: "agriculture", label: "Agriculture", count: templates.filter(t => t.category === "agriculture").length },
    { value: "emergency", label: "Emergency", count: templates.filter(t => t.category === "emergency").length }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === "all" || template.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const openPreview = (template) => {
    setPreviewModal({ open: true, template });
  };

  const openUseTemplate = (template) => {
    setUseTemplateModal({ open: true, template });
  };

  const handleDownload = (template) => {
    window.open(template.downloadUrl, '_blank');
    toast({
      title: "Download Started",
      description: `${template.title} template is being downloaded.`,
    });
  };

  const handleGitHub = (template) => {
    window.open(template.githubUrl, '_blank');
    toast({
      title: "GitHub Opened",
      description: `Viewing ${template.title} on GitHub.`,
    });
  };

  const handleColab = (template) => {
    window.open(template.colabUrl, '_blank');
    toast({
      title: "Google Colab Opened",
      description: `Running ${template.title} in Google Colab.`,
    });
  };

  const handleCopyGitHub = async (template) => {
    try {
      await navigator.clipboard.writeText(template.githubUrl);
      toast({
        title: "Copied to Clipboard",
        description: "GitHub URL copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Project Templates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready-to-use project templates with sample data, code, and step-by-step workflows for common GIS applications
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.downloads} downloads
                    </Badge>
                    <div className="flex items-center">
                      {"★".repeat(Math.floor(template.rating))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {template.rating}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-2">What's Included:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Files */}
                    <div>
                      <h4 className="font-medium mb-2">Template Files:</h4>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="grid grid-cols-1 gap-1">
                          {template.files.map((file, index) => (
                            <div key={index} className="text-xs text-muted-foreground font-mono">
                              📄 {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={() => openUseTemplate(template)}
                      >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => openPreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDownload(template)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates found for the selected category.</p>
          </div>
        )}

        {/* Getting Started */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Getting Started with Templates</CardTitle>
            <CardDescription>
              How to use project templates effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-medium mb-2">Choose Template</h3>
                <p className="text-sm text-muted-foreground">
                  Select a template that matches your project needs and skill level
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-medium mb-2">Download & Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Download the template files and follow the included setup instructions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-medium mb-2">Customize & Run</h3>
                <p className="text-sm text-muted-foreground">
                  Adapt the template to your data and requirements, then execute the workflow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Modal */}
        <Dialog open={previewModal.open} onOpenChange={(open) => setPreviewModal({ open, template: null })}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {previewModal.template && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <previewModal.template.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{previewModal.template.title}</DialogTitle>
                      <DialogDescription className="mt-1">
                        {previewModal.template.description}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(previewModal.template.difficulty)}>
                      {previewModal.template.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {previewModal.template.estimatedTime}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {previewModal.template.downloads} downloads
                    </Badge>
                    <div className="flex items-center">
                      {"★".repeat(Math.floor(previewModal.template.rating))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {previewModal.template.rating}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {previewModal.template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Long Description */}
                  <div>
                    <h4 className="font-medium mb-2">About This Template:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {previewModal.template.longDescription}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-2">What's Included:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {previewModal.template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <h4 className="font-medium mb-2">Template Files:</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {previewModal.template.files.map((file, index) => (
                          <div key={index} className="text-sm text-muted-foreground font-mono">
                            📄 {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setPreviewModal({ open: false, template: null });
                        openUseTemplate(previewModal.template);
                      }}
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDownload(previewModal.template)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Use Template Modal */}
        <Dialog open={useTemplateModal.open} onOpenChange={(open) => setUseTemplateModal({ open, template: null })}>
          <DialogContent className="max-w-md">
            {useTemplateModal.template && (
              <>
                <DialogHeader>
                  <DialogTitle>Use Template: {useTemplateModal.template.title}</DialogTitle>
                  <DialogDescription>
                    Choose how you'd like to access this template
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => {
                      handleDownload(useTemplateModal.template);
                      setUseTemplateModal({ open: false, template: null });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download ZIP Archive
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleGitHub(useTemplateModal.template);
                      setUseTemplateModal({ open: false, template: null });
                    }}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Open in GitHub
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleColab(useTemplateModal.template);
                      setUseTemplateModal({ open: false, template: null });
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Run in Google Colab
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleCopyGitHub(useTemplateModal.template);
                      setUseTemplateModal({ open: false, template: null });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy GitHub URL
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProjectTemplates;
