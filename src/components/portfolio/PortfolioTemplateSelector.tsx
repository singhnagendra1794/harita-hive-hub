import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Check, Palette, Code, Brain, Satellite, Building, BarChart3 } from "lucide-react";

interface PortfolioTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  preview_image_url?: string;
  template_config: any;
  is_premium: boolean;
  download_count: number;
}

interface PortfolioTemplateSelectorProps {
  templates: PortfolioTemplate[];
  currentTemplate?: string;
  onSelectTemplate: (templateId: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

const categoryIcons = {
  geoai: Brain,
  'remote-sensing': Satellite,
  planning: Building,
  analyst: BarChart3,
  developer: Code,
  consultant: Crown
};

const categoryColors = {
  geoai: 'bg-blue-500',
  'remote-sensing': 'bg-green-500',
  planning: 'bg-purple-500',
  analyst: 'bg-teal-500',
  developer: 'bg-orange-500',
  consultant: 'bg-indigo-500'
};

export const PortfolioTemplateSelector = ({
  templates,
  currentTemplate,
  onSelectTemplate,
  isModal = false,
  onClose
}: PortfolioTemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'geoai', label: 'GeoAI Specialist' },
    { value: 'remote-sensing', label: 'Remote Sensing' },
    { value: 'planning', label: 'Urban Planning' },
    { value: 'analyst', label: 'GIS Analyst' },
    { value: 'developer', label: 'Developer' },
    { value: 'consultant', label: 'Consultant' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    if (isModal && onClose) {
      onClose();
    }
  };

  const renderTemplateCard = (template: PortfolioTemplate) => {
    const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || Palette;
    const colorClass = categoryColors[template.category as keyof typeof categoryColors] || 'bg-gray-500';
    const isSelected = currentTemplate === template.id;

    return (
      <Card 
        key={template.id} 
        className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => handleSelectTemplate(template.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {template.is_premium && (
                <Badge variant="secondary" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Pro
                </Badge>
              )}
              {isSelected && (
                <div className="p-1 bg-primary rounded-full">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {template.description}
          </p>
          
          {/* Template Preview */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-primary/30 to-primary/10 rounded w-3/4"></div>
              <div className="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
              <div className="space-y-1">
                <div className="h-2 bg-muted-foreground/10 rounded w-full"></div>
                <div className="h-2 bg-muted-foreground/10 rounded w-2/3"></div>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="h-1.5 w-8 bg-primary/40 rounded"></div>
                <div className="h-1.5 w-6 bg-primary/30 rounded"></div>
                <div className="h-1.5 w-10 bg-primary/20 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{template.download_count} downloads</span>
            <span className="capitalize">{template.category.replace('-', ' ')}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose Your Portfolio Template</h2>
        <p className="text-muted-foreground">
          Select a template that best matches your geospatial career focus
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(renderTemplateCard)}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates found for this category</p>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Portfolio Template</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
};