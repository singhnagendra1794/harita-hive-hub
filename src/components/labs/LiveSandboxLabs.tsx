import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Code2, 
  Globe, 
  ExternalLink,
  Play,
  Satellite,
  AlertTriangle,
  Waves,
  TreePine,
  Clock,
  Target,
  Users,
  Zap,
  Search,
  Filter,
  Download,
  FileText,
  Video,
  Copy,
  Upload,
  Folder,
  BookOpen,
  MapPin,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveSandboxLabs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [toolFilter, setToolFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');

  const preloadedEnvironments = [
    {
      id: 'qgis-postgis',
      title: 'QGIS + PostGIS Sandbox',
      description: 'Full-featured GIS environment with spatial database capabilities for urban planning and spatial analysis',
      icon: Database,
      features: ['QGIS Desktop 3.34', 'PostGIS 3.4', 'Pre-loaded OSM data', 'Sample workflows'],
      launchUrl: 'https://qgis-sandbox.haritahive.com',
      status: 'Ready',
      estimatedLaunch: '30 seconds',
      difficulty: 'Intermediate',
      tool: 'QGIS',
      topic: 'GIS',
      resources: [
        { type: 'pdf', name: 'QGIS-PostGIS Urban Planning Guide', url: '/downloads/qgis-postgis-guide.pdf' },
        { type: 'dataset', name: 'City Zoning Project', url: '/downloads/city_zoning_project.gpkg' },
        { type: 'video', name: 'Zoning Analysis in 15 minutes', url: 'https://youtube.com/watch?v=demo' }
      ]
    },
    {
      id: 'jupyter-geo',
      title: 'Python Geo Lab (Jupyter + GeoPandas)',
      description: 'Python geospatial analysis environment with Jupyter, GeoPandas, Rasterio, and Folium for automated workflows',
      icon: Code2,
      features: ['Python 3.11', 'GeoPandas', 'Rasterio', 'Folium', 'Sample datasets'],
      launchUrl: 'https://jupyter-geo.haritahive.com',
      status: 'Ready',
      estimatedLaunch: '45 seconds',
      difficulty: 'Advanced',
      tool: 'Python',
      topic: 'Programming',
      resources: [
        { type: 'notebook', name: 'NDVI Analysis Demo', url: '/downloads/ndvi_analysis_demo.ipynb' },
        { type: 'pdf', name: '10 Geospatial Tasks to Automate', url: '/downloads/python-geo-automation.pdf' },
        { type: 'dataset', name: 'India Flood Risk Rasters', url: '/downloads/india_flood_risk_rasters.zip' }
      ]
    },
    {
      id: 'sentinelhub-eo',
      title: 'Satellite Analysis via SentinelHub',
      description: 'Web-based Sentinel/Landsat visualizer with downloadable image chips and custom script interface',
      icon: Globe,
      features: ['Sentinel-2 imagery', 'Landsat data', 'Custom processing', 'Export tools'],
      launchUrl: 'https://apps.sentinel-hub.com/eo-browser/',
      status: 'Ready',
      estimatedLaunch: '15 seconds',
      difficulty: 'Beginner',
      tool: 'Web Browser',
      topic: 'Remote Sensing',
      resources: [
        { type: 'script', name: 'Sample EO Scripts', url: '/downloads/eo-scripts.json' },
        { type: 'pdf', name: 'NDVI Guide for SentinelHub', url: '/downloads/sentinelhub-ndvi-guide.pdf' },
        { type: 'dataset', name: 'Sample NDVI Chips (Africa/India)', url: '/downloads/sample_ndvi_chips.zip' }
      ]
    }
  ];

  const geoHackMissions = [
    {
      id: 'illegal-mining',
      title: 'Detect Illegal Mining in Forest Zones',
      description: 'Use satellite imagery and change detection algorithms to identify unauthorized mining activities in protected forest areas',
      icon: AlertTriangle,
      skillTags: ['Remote Sensing', 'Change Detection', 'Python'],
      estimatedTime: '2-3 hours',
      difficulty: 'Advanced',
      launchUrl: 'https://colab.research.google.com/mining-detection',
      realWorldContext: 'Amazon deforestation monitoring',
      objectives: ['Perform change detection', 'Generate alerts', 'Classify zones'],
      tool: 'Python',
      topic: 'Environmental',
      outcomeType: 'Alert System',
      resources: [
        { type: 'dataset', name: 'Brazil Rainforest Mining Data 2020-2024', url: '/downloads/brazil_rainforest_mining_area_2020_2024.zip' },
        { type: 'notebook', name: 'Illegal Mine Detector', url: '/downloads/illegal_mine_detector.ipynb' },
        { type: 'pdf', name: 'Change Detection Methods Guide', url: '/downloads/change-detection-guide.pdf' }
      ]
    },
    {
      id: 'flood-prediction',
      title: 'Predict Flood Zones',
      description: 'Combine DEM data with rainfall patterns to create hydrologic models and generate flood risk maps',
      icon: Waves,
      skillTags: ['Hydrology', 'Modeling', 'Risk Analysis'],
      estimatedTime: '3-4 hours',
      difficulty: 'Intermediate',
      launchUrl: 'https://colab.research.google.com/flood-modeling',
      realWorldContext: 'Urban flood risk assessment',
      objectives: ['Hydrologic model (DEM → Flow Accumulation)', 'Risk map export'],
      tool: 'QGIS',
      topic: 'Hydrology',
      outcomeType: 'Risk Map',
      resources: [
        { type: 'project', name: 'India Urban Flood Model', url: '/downloads/india_urban_flood_model.qgz' },
        { type: 'dataset', name: 'DEM & Rainfall Shapefiles', url: '/downloads/flood-dem-rainfall-data.zip' },
        { type: 'pdf', name: 'Flood Zone Modeling Step-by-Step', url: '/downloads/flood-zone-modeling-guide.pdf' }
      ]
    },
    {
      id: 'ndvi-crop-health',
      title: 'NDVI Crop Health Tracker',
      description: 'Calculate NDVI from satellite imagery and classify crop health for agricultural monitoring and yield prediction',
      icon: TreePine,
      skillTags: ['NDVI', 'Classification', 'Agriculture'],
      estimatedTime: '1-2 hours',
      difficulty: 'Beginner',
      launchUrl: 'https://colab.research.google.com/ndvi-classification',
      realWorldContext: 'Agricultural monitoring',
      objectives: ['Calculate NDVI', 'Classify crop health'],
      tool: 'Python',
      topic: 'Agriculture',
      outcomeType: 'Health Report',
      resources: [
        { type: 'dataset', name: 'NDVI-Ready TIFFs', url: '/downloads/ndvi-ready-tiffs.zip' },
        { type: 'script', name: 'NDVI Health Index Calculator', url: '/downloads/ndvi_health_index.py' },
        { type: 'csv', name: 'Crop Health Classification Data', url: '/downloads/crop-health-classification.csv' }
      ]
    }
  ];

  const resourceCategories = [
    {
      name: 'Sample Data',
      icon: Folder,
      items: [
        { name: 'Global Shapefiles Collection', type: '.shp', url: '/downloads/global-shapefiles.zip' },
        { name: 'Satellite Imagery Samples', type: '.tif', url: '/downloads/satellite-samples.zip' },
        { name: 'Urban Planning GeoJSON', type: '.geojson', url: '/downloads/urban-planning.geojson' },
        { name: 'Climate Data CSV', type: '.csv', url: '/downloads/climate-data.csv' }
      ]
    },
    {
      name: 'Python Scripts',
      icon: Code2,
      items: [
        { name: 'Geospatial Automation Toolkit', type: '.py', url: '/downloads/geo-automation-toolkit.py' },
        { name: 'NDVI Calculator Notebook', type: '.ipynb', url: '/downloads/ndvi-calculator.ipynb' },
        { name: 'Spatial Analysis Scripts', type: '.py', url: '/downloads/spatial-analysis-scripts.py' }
      ]
    },
    {
      name: 'QGIS Projects',
      icon: Database,
      items: [
        { name: 'Urban Development Analysis', type: '.qgz', url: '/downloads/urban-development.qgz' },
        { name: 'Environmental Impact Assessment', type: '.qgz', url: '/downloads/environmental-impact.qgz' },
        { name: 'Transportation Network Analysis', type: '.gpkg', url: '/downloads/transport-network.gpkg' }
      ]
    },
    {
      name: 'Cheat Sheets',
      icon: BookOpen,
      items: [
        { name: 'Spatial SQL Quick Reference', type: 'PDF', url: '/downloads/spatial-sql-cheatsheet.pdf' },
        { name: 'NDVI Math Explained', type: 'PDF', url: '/downloads/ndvi-math-guide.pdf' },
        { name: 'GeoAI Basics Handbook', type: 'PDF', url: '/downloads/geoai-basics.pdf' }
      ]
    }
  ];

  const handleLaunchEnvironment = (env: any) => {
    toast({
      title: `Launching ${env.title}`,
      description: `Setting up your sandbox environment... This may take ${env.estimatedLaunch}`,
    });
    
    setTimeout(() => {
      window.open(env.launchUrl, '_blank');
    }, 1000);
  };

  const handleLaunchMission = (mission: any) => {
    toast({
      title: `Starting Mission: ${mission.title}`,
      description: "Opening your dedicated lab environment with pre-loaded data and instructions.",
    });
    
    setTimeout(() => {
      window.open(mission.launchUrl, '_blank');
    }, 1000);
  };

  const handleDownloadResource = (resource: any) => {
    toast({
      title: `Downloading ${resource.name}`,
      description: "Your download will begin shortly.",
    });
    
    // In real implementation, this would trigger actual download
    window.open(resource.url, '_blank');
  };

  const handleCloneLab = (item: any) => {
    toast({
      title: `Cloning ${item.title}`,
      description: "Lab has been copied to your workspace.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter logic
  const filteredEnvironments = useMemo(() => {
    return preloadedEnvironments.filter(env => {
      const matchesSearch = env.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           env.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || env.difficulty === difficultyFilter;
      const matchesTool = toolFilter === 'all' || env.tool === toolFilter;
      const matchesTopic = topicFilter === 'all' || env.topic === topicFilter;
      
      return matchesSearch && matchesDifficulty && matchesTool && matchesTopic;
    });
  }, [searchTerm, difficultyFilter, toolFilter, topicFilter]);

  const filteredMissions = useMemo(() => {
    return geoHackMissions.filter(mission => {
      const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mission.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || mission.difficulty === difficultyFilter;
      const matchesTool = toolFilter === 'all' || mission.tool === toolFilter;
      const matchesTopic = topicFilter === 'all' || mission.topic === topicFilter;
      
      return matchesSearch && matchesDifficulty && matchesTool && matchesTopic;
    });
  }, [searchTerm, difficultyFilter, toolFilter, topicFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              HaritaHive GeoProcessing Lab
            </h1>
            <p className="text-xl text-muted-foreground mb-2">World's Best Browser-Based Spatial Processing Platform</p>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Access industry-standard geospatial tools, tackle real-world missions using live satellite data, 
              and export professional results — all from one unified interface.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 bg-card rounded-lg p-6 border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search environments and missions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={toolFilter} onValueChange={setToolFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tool" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tools</SelectItem>
                    <SelectItem value="QGIS">QGIS</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Web Browser">Web Browser</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="GIS">GIS</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Remote Sensing">Remote Sensing</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Hydrology">Hydrology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preloaded Environments Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Preloaded Environments</h2>
                <Badge variant="outline">{filteredEnvironments.length} Available</Badge>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {filteredEnvironments.map((env) => (
                <Card key={env.id} className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <env.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {env.title}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {env.status}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(env.difficulty)}`}
                            >
                              {env.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {env.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{env.estimatedLaunch}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{env.topic}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Included Tools:</p>
                        <div className="flex flex-wrap gap-1">
                          {env.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Resources:</p>
                        <div className="space-y-1">
                          {env.resources.map((resource, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {resource.type === 'pdf' && <FileText className="h-3 w-3" />}
                                {resource.type === 'dataset' && <Folder className="h-3 w-3" />}
                                {resource.type === 'video' && <Video className="h-3 w-3" />}
                                {resource.type === 'notebook' && <BookOpen className="h-3 w-3" />}
                                {resource.type === 'script' && <Code2 className="h-3 w-3" />}
                                <span className="text-muted-foreground">{resource.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadResource(resource)}
                                className="h-6 w-6 p-0"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleLaunchEnvironment(env)}
                          className="flex-1"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Launch Lab
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleCloneLab(env)}
                          size="sm"
                          className="px-3"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* GeoHack Missions Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">GeoHack Missions</h2>
                <Badge variant="outline">{filteredMissions.length} Available</Badge>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMissions.map((mission) => (
                <Card key={mission.id} className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <mission.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {mission.title}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(mission.difficulty)}`}
                            >
                              {mission.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {mission.outcomeType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {mission.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{mission.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BarChart3 className="h-4 w-4" />
                          <span>{mission.topic}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Skills Required:</p>
                        <div className="flex flex-wrap gap-1">
                          {mission.skillTags.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Mission Objectives:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {mission.objectives.map((objective, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Mission Resources:</p>
                        <div className="space-y-1">
                          {mission.resources.map((resource, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {resource.type === 'pdf' && <FileText className="h-3 w-3" />}
                                {resource.type === 'dataset' && <Folder className="h-3 w-3" />}
                                {resource.type === 'notebook' && <BookOpen className="h-3 w-3" />}
                                {resource.type === 'project' && <Database className="h-3 w-3" />}
                                {resource.type === 'script' && <Code2 className="h-3 w-3" />}
                                {resource.type === 'csv' && <BarChart3 className="h-3 w-3" />}
                                <span className="text-muted-foreground">{resource.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadResource(resource)}
                                className="h-6 w-6 p-0"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleLaunchMission(mission)}
                          className="flex-1"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Launch Mission
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleCloneLab(mission)}
                          size="sm"
                          className="px-3"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Resource Center Sidebar */}
        <div className="w-80 p-6 bg-card border-l">
          <div className="sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <Folder className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Resource Center</h3>
            </div>
            
            <div className="space-y-6">
              {resourceCategories.map((category) => (
                <Card key={category.name} className="border-muted">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground">{item.type}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadResource(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                <CardContent className="py-6 text-center">
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Upload Your Data</p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop files to get started
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveSandboxLabs;