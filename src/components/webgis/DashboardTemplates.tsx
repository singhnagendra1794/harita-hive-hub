import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Wind, 
  Zap, 
  AlertTriangle, 
  TreePine,
  Building2,
  Factory,
  Gauge,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardTemplatesProps {
  onSelectTemplate: (template: any) => void;
  onClose: () => void;
  open: boolean;
}

export const DashboardTemplates = ({ onSelectTemplate, onClose, open }: DashboardTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { toast } = useToast();

  const templates = [
    {
      id: 'city-planning',
      name: 'City Planning Dashboard',
      description: 'Urban development and zoning visualization with population density, land use, and infrastructure layers.',
      icon: Building2,
      category: 'Urban Planning',
      features: ['Zoning Maps', 'Population Density', 'Infrastructure', 'Traffic Analysis'],
      preview: '/api/placeholder/400/300',
      difficulty: 'Beginner',
      estimatedTime: '15 minutes',
      layers: [
        { name: 'City Boundaries', type: 'geojson', style: { color: '#3b82f6', fillOpacity: 0.1 } },
        { name: 'Zoning Areas', type: 'geojson', style: { color: '#10b981', fillOpacity: 0.3 } },
        { name: 'Roads Network', type: 'geojson', style: { color: '#6b7280', weight: 2 } },
        { name: 'Population Density', type: 'csv', style: { colorScheme: 'Blues' } }
      ],
      widgets: [
        { type: 'legend', position: 'top-left' },
        { type: 'scale', position: 'bottom-right' },
        { type: 'chart', position: 'top-right', config: { chartType: 'bar', title: 'Population by District' } }
      ]
    },
    {
      id: 'air-quality',
      name: 'Air Quality Monitor',
      description: 'Real-time air quality monitoring with pollution sources, sensor data, and health impact zones.',
      icon: Wind,
      category: 'Environmental',
      features: ['Real-time Data', 'Pollution Sources', 'Health Zones', 'Temporal Analysis'],
      preview: '/api/placeholder/400/300',
      difficulty: 'Intermediate',
      estimatedTime: '25 minutes',
      layers: [
        { name: 'Air Quality Sensors', type: 'api', style: { color: '#ef4444', size: 8 } },
        { name: 'Pollution Sources', type: 'geojson', style: { color: '#dc2626', fillOpacity: 0.4 } },
        { name: 'Health Risk Zones', type: 'geojson', style: { colorScheme: 'Reds' } },
        { name: 'Wind Patterns', type: 'api', style: { arrows: true } }
      ],
      widgets: [
        { type: 'chart', position: 'top-left', config: { chartType: 'line', title: 'AQI Trends' } },
        { type: 'coordinates', position: 'bottom-left' },
        { type: 'filter', position: 'top-right', config: { filterBy: 'pollutant_type' } }
      ]
    },
    {
      id: 'utility-dashboard',
      name: 'Utility Infrastructure',
      description: 'Power grid, water systems, and telecommunications infrastructure management dashboard.',
      icon: Zap,
      category: 'Infrastructure',
      features: ['Power Grid', 'Water Systems', 'Outage Management', 'Asset Tracking'],
      preview: '/api/placeholder/400/300',
      difficulty: 'Advanced',
      estimatedTime: '35 minutes',
      layers: [
        { name: 'Power Lines', type: 'geojson', style: { color: '#f59e0b', weight: 3 } },
        { name: 'Substations', type: 'geojson', style: { color: '#dc2626', size: 10 } },
        { name: 'Water Mains', type: 'geojson', style: { color: '#0ea5e9', weight: 2 } },
        { name: 'Service Areas', type: 'geojson', style: { fillOpacity: 0.2 } }
      ],
      widgets: [
        { type: 'gauge', position: 'top-left', config: { metric: 'grid_load', unit: 'MW' } },
        { type: 'chart', position: 'top-right', config: { chartType: 'pie', title: 'Energy Sources' } },
        { type: 'legend', position: 'bottom-left' }
      ]
    },
    {
      id: 'disaster-mapping',
      name: 'Disaster Response',
      description: 'Emergency response coordination with evacuation routes, shelters, and real-time incident tracking.',
      icon: AlertTriangle,
      category: 'Emergency',
      features: ['Evacuation Routes', 'Emergency Shelters', 'Incident Tracking', 'Resource Allocation'],
      preview: '/api/placeholder/400/300',
      difficulty: 'Intermediate',
      estimatedTime: '30 minutes',
      layers: [
        { name: 'Evacuation Routes', type: 'geojson', style: { color: '#f59e0b', weight: 4, dashArray: '5,5' } },
        { name: 'Emergency Shelters', type: 'geojson', style: { color: '#10b981', size: 12 } },
        { name: 'Risk Zones', type: 'geojson', style: { colorScheme: 'Oranges' } },
        { name: 'Active Incidents', type: 'api', style: { color: '#ef4444', pulse: true } }
      ],
      widgets: [
        { type: 'chart', position: 'top-right', config: { chartType: 'bar', title: 'Shelter Capacity' } },
        { type: 'coordinates', position: 'bottom-right' },
        { type: 'filter', position: 'top-left', config: { filterBy: 'incident_type' } }
      ]
    },
    {
      id: 'wildlife-tracking',
      name: 'Wildlife Conservation',
      description: 'Animal migration tracking, habitat monitoring, and conservation area management.',
      icon: TreePine,
      category: 'Conservation',
      features: ['Migration Routes', 'Habitat Zones', 'Species Tracking', 'Conservation Status'],
      preview: '/api/placeholder/400/300',
      difficulty: 'Beginner',
      estimatedTime: '20 minutes',
      layers: [
        { name: 'Protected Areas', type: 'geojson', style: { color: '#22c55e', fillOpacity: 0.3 } },
        { name: 'Migration Routes', type: 'geojson', style: { color: '#8b5cf6', weight: 3 } },
        { name: 'Animal Sightings', type: 'csv', style: { color: '#ef4444', size: 6 } },
        { name: 'Habitat Quality', type: 'geojson', style: { colorScheme: 'Greens' } }
      ],
      widgets: [
        { type: 'chart', position: 'top-left', config: { chartType: 'line', title: 'Species Population' } },
        { type: 'legend', position: 'bottom-left' },
        { type: 'scale', position: 'bottom-right' }
      ]
    }
  ];

  const handleSelectTemplate = (template: any) => {
    onSelectTemplate(template);
    toast({
      title: 'Template applied',
      description: `${template.name} template has been loaded successfully.`
    });
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Dashboard Templates
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gauge className="h-3 w-3" />
                      <span>Setup time: {template.estimatedTime}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Layers ({template.layers.length})
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        {template.layers.slice(0, 3).map((layer, index) => (
                          <li key={index}>• {layer.name}</li>
                        ))}
                        {template.layers.length > 3 && (
                          <li>• +{template.layers.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Widgets ({template.widgets.length})
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        {template.widgets.map((widget, index) => (
                          <li key={index} className="capitalize">• {widget.type}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSelectTemplate(template)}
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};