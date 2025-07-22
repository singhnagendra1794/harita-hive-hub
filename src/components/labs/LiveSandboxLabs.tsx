import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveSandboxLabs = () => {
  const { toast } = useToast();

  const preloadedEnvironments = [
    {
      id: 'qgis-postgis',
      title: 'QGIS + PostGIS Sandbox',
      description: 'Full-featured GIS environment with spatial database capabilities',
      icon: Database,
      features: ['QGIS Desktop 3.34', 'PostGIS 3.4', 'Pre-loaded OSM data', 'Sample workflows'],
      launchUrl: 'https://qgis-sandbox.haritahive.com', // Dummy URL
      status: 'Ready',
      estimatedLaunch: '30 seconds'
    },
    {
      id: 'jupyter-geo',
      title: 'Jupyter + Geopandas + Rasterio',
      description: 'Python geospatial analysis environment with pre-configured libraries',
      icon: Code2,
      features: ['Python 3.11', 'GeoPandas', 'Rasterio', 'Folium', 'Sample datasets'],
      launchUrl: 'https://jupyter-geo.haritahive.com', // Dummy URL
      status: 'Ready',
      estimatedLaunch: '45 seconds'
    },
    {
      id: 'sentinelhub-eo',
      title: 'SentinelHub + EO Browser',
      description: 'Satellite imagery analysis with European Space Agency data',
      icon: Globe,
      features: ['Sentinel-2 imagery', 'Landsat data', 'Custom processing', 'Export tools'],
      launchUrl: 'https://apps.sentinel-hub.com/eo-browser/', // Real URL
      status: 'Ready',
      estimatedLaunch: '15 seconds'
    }
  ];

  const geoHackMissions = [
    {
      id: 'illegal-mining',
      title: 'Map Illegal Mining Zones',
      description: 'Use satellite imagery to detect unauthorized mining activities in protected areas',
      icon: AlertTriangle,
      skillTags: ['Remote Sensing', 'Change Detection', 'Python'],
      estimatedTime: '2-3 hours',
      difficulty: 'Advanced',
      launchUrl: 'https://colab.research.google.com/mining-detection', // Dummy URL
      realWorldContext: 'Amazon deforestation monitoring',
      objectives: ['Detect surface changes', 'Classify land use', 'Generate alert system']
    },
    {
      id: 'flood-prediction',
      title: 'Predict Flood Zones',
      description: 'Combine DEM data with rainfall patterns to model flood risk areas',
      icon: Waves,
      skillTags: ['Hydrology', 'Modeling', 'Risk Analysis'],
      estimatedTime: '3-4 hours',
      difficulty: 'Intermediate',
      launchUrl: 'https://colab.research.google.com/flood-modeling', // Dummy URL
      realWorldContext: 'Urban flood risk assessment',
      objectives: ['Analyze elevation data', 'Model water flow', 'Create risk maps']
    },
    {
      id: 'ndvi-classification',
      title: 'Land Cover Classification using NDVI',
      description: 'Classify vegetation health and land cover types using satellite-derived NDVI',
      icon: TreePine,
      skillTags: ['NDVI', 'Classification', 'Agriculture'],
      estimatedTime: '1-2 hours',
      difficulty: 'Beginner',
      launchUrl: 'https://colab.research.google.com/ndvi-classification', // Dummy URL
      realWorldContext: 'Agricultural monitoring',
      objectives: ['Calculate NDVI', 'Classify vegetation', 'Track changes over time']
    }
  ];

  const handleLaunchEnvironment = (env: any) => {
    toast({
      title: `Launching ${env.title}`,
      description: `Setting up your sandbox environment... This may take ${env.estimatedLaunch}`,
    });
    
    // In a real implementation, this would open the environment
    // For now, we'll simulate with a delay
    setTimeout(() => {
      window.open(env.launchUrl, '_blank');
    }, 1000);
  };

  const handleLaunchMission = (mission: any) => {
    toast({
      title: `Starting Mission: ${mission.title}`,
      description: "Opening your dedicated lab environment with pre-loaded data and instructions.",
    });
    
    // In a real implementation, this would launch the specific mission environment
    setTimeout(() => {
      window.open(mission.launchUrl, '_blank');
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Live Sandbox Labs
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Real Earth Data</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access industry-standard geospatial tools and tackle real-world missions using live satellite data, 
            environmental datasets, and cloud-based analysis platforms.
          </p>
        </div>

        {/* Preloaded Environments Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Preloaded Environments</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preloadedEnvironments.map((env) => (
              <Card key={env.id} className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <env.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {env.title}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {env.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {env.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Launch time: {env.estimatedLaunch}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Included:</p>
                      <div className="flex flex-wrap gap-1">
                        {env.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleLaunchEnvironment(env)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Launch Environment
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* GeoHack Missions Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">GeoHack Missions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {geoHackMissions.map((mission) => (
              <Card key={mission.id} className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <mission.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {mission.title}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 text-xs ${getDifficultyColor(mission.difficulty)}`}
                        >
                          {mission.difficulty}
                        </Badge>
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
                        <Users className="h-4 w-4" />
                        <span>Solo</span>
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
                      <p className="text-sm font-medium">Real-world Context:</p>
                      <p className="text-xs text-muted-foreground">{mission.realWorldContext}</p>
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
                    
                    <Button 
                      onClick={() => handleLaunchMission(mission)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Launch Lab
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Coming Soon Notice */}
        <div className="mt-16 text-center">
          <Card className="border-dashed border-2 border-muted bg-muted/20">
            <CardContent className="py-12">
              <Satellite className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">More Missions Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're constantly adding new real-world geospatial challenges and updating our sandbox environments 
                with the latest datasets and tools.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveSandboxLabs;