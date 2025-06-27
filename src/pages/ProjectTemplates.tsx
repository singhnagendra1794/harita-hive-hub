
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProjectTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
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
      sampleData: true
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
      sampleData: true
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
      sampleData: true
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
      sampleData: true
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
      sampleData: true
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
      sampleData: true
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

  const useTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: "Template downloaded!",
        description: `${template.title} project template has been prepared for you.`,
      });
    }
  };

  const previewTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: "Preview opened",
        description: `Viewing ${template.title} template preview.`,
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
                        onClick={() => useTemplate(template.id)}
                      >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => previewTemplate(template.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="icon">
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
      </div>
    </Layout>
  );
};

export default ProjectTemplates;
