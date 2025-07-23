import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  Search, 
  Bookmark, 
  Star, 
  Filter,
  Play,
  BookOpen,
  MapPin,
  Sprout,
  TreePine,
  Building,
  Truck,
  Shield,
  Radio,
  Heart,
  Home,
  Pickaxe,
  Waves,
  Sun,
  Droplets
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Sector definitions with icons and colors
const sectors = [
  {
    id: 'urban-planning',
    name: 'Urban Planning',
    icon: Building,
    color: 'bg-blue-50 border-blue-200',
    description: 'City planning, zoning, and smart city solutions'
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Sprout,
    color: 'bg-green-50 border-green-200',
    description: 'Precision farming, crop monitoring, and field management'
  },
  {
    id: 'forestry',
    name: 'Forestry & Environment',
    icon: TreePine,
    color: 'bg-emerald-50 border-emerald-200',
    description: 'Forest monitoring, conservation, and environmental analysis'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & Utilities',
    icon: MapPin,
    color: 'bg-gray-50 border-gray-200',
    description: 'Infrastructure mapping, utility networks, and asset management'
  },
  {
    id: 'transportation',
    name: 'Transportation & Logistics',
    icon: Truck,
    color: 'bg-orange-50 border-orange-200',
    description: 'Route optimization, fleet management, and logistics planning'
  },
  {
    id: 'disaster',
    name: 'Disaster Management',
    icon: Shield,
    color: 'bg-red-50 border-red-200',
    description: 'Emergency response, risk assessment, and disaster preparedness'
  },
  {
    id: 'telecom',
    name: 'Telecom',
    icon: Radio,
    color: 'bg-purple-50 border-purple-200',
    description: 'Network planning, coverage analysis, and site optimization'
  },
  {
    id: 'health',
    name: 'Health & Epidemiology',
    icon: Heart,
    color: 'bg-pink-50 border-pink-200',
    description: 'Disease mapping, health facility planning, and epidemiological studies'
  },
  {
    id: 'real-estate',
    name: 'Real Estate & Land Use',
    icon: Home,
    color: 'bg-indigo-50 border-indigo-200',
    description: 'Property valuation, land use analysis, and market research'
  },
  {
    id: 'mining',
    name: 'Mining & Geology',
    icon: Pickaxe,
    color: 'bg-amber-50 border-amber-200',
    description: 'Geological surveys, mineral exploration, and mining operations'
  },
  {
    id: 'marine',
    name: 'Marine & Coastal',
    icon: Waves,
    color: 'bg-cyan-50 border-cyan-200',
    description: 'Coastal monitoring, marine conservation, and oceanographic analysis'
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    icon: Sun,
    color: 'bg-yellow-50 border-yellow-200',
    description: 'Solar/wind site selection, energy potential mapping'
  },
  {
    id: 'water-resources',
    name: 'Water Resources',
    icon: Droplets,
    color: 'bg-teal-50 border-teal-200',
    description: 'Watershed analysis, flood modeling, and water quality monitoring'
  }
];

// Sample tools data
const tools = [
  {
    id: 'urban-analyzer',
    name: 'Urban Growth Analyzer',
    description: 'AI-powered tool for analyzing urban expansion patterns and predicting future growth',
    sector: 'urban-planning',
    type: 'internal',
    url: '/labs/urban-analyzer',
    tags: ['AI', 'Analysis', 'Prediction'],
    featured: true,
    hasGuide: true,
    difficulty: 'intermediate'
  },
  {
    id: 'crop-classifier',
    name: 'Crop Classifier',
    description: 'Classify satellite images by crop type using NDVI & time series analysis',
    sector: 'agriculture',
    type: 'internal',
    url: '/labs/crop-classifier',
    tags: ['Remote Sensing', 'Classification', 'NDVI'],
    featured: true,
    hasGuide: true,
    difficulty: 'beginner'
  },
  {
    id: 'forest-monitor',
    name: 'Forest Change Monitor',
    description: 'Real-time forest cover change detection using satellite imagery',
    sector: 'forestry',
    type: 'internal',
    url: '/labs/forest-monitor',
    tags: ['Change Detection', 'Monitoring'],
    featured: false,
    hasGuide: true,
    difficulty: 'advanced'
  },
  {
    id: 'qgis',
    name: 'QGIS Desktop',
    description: 'Free and open-source geographic information system for all your mapping needs',
    sector: 'urban-planning',
    type: 'external',
    url: 'https://qgis.org',
    tags: ['Desktop GIS', 'Open Source'],
    featured: true,
    hasGuide: false,
    difficulty: 'intermediate'
  },
  {
    id: 'google-earth-engine',
    name: 'Google Earth Engine',
    description: 'Cloud-based platform for planetary-scale geospatial analysis',
    sector: 'agriculture',
    type: 'external',
    url: 'https://earthengine.google.com',
    tags: ['Cloud Computing', 'Big Data'],
    featured: true,
    hasGuide: true,
    difficulty: 'advanced'
  }
];

interface ToolkitCardProps {
  tool: typeof tools[0];
  onBookmark: (toolId: string) => void;
  isBookmarked: boolean;
}

const ToolkitCard = ({ tool, onBookmark, isBookmarked }: ToolkitCardProps) => {
  const { toast } = useToast();

  const handleUseNow = () => {
    if (tool.type === 'external') {
      window.open(tool.url, '_blank');
    } else {
      window.location.href = tool.url;
    }
    
    toast({
      title: "Opening tool...",
      description: `Loading ${tool.name}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {tool.name}
              </CardTitle>
              {tool.featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {tool.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmark(tool.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-blue-600' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Tags and Difficulty */}
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            <Badge className={`text-xs ${getDifficultyColor(tool.difficulty)}`}>
              {tool.difficulty}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleUseNow} className="flex-1">
              {tool.type === 'external' ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open Tool
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Use Now
                </>
              )}
            </Button>
            
            {tool.hasGuide && (
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-1" />
                Guide
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolkitCard;