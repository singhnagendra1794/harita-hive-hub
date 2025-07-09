
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, Star } from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  price: number;
  is_custom: boolean;
  syllabus?: any;
}

interface TrainingModuleCardProps {
  module: TrainingModule;
}

const TrainingModuleCard = ({ module }: TrainingModuleCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${module.is_custom ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>{module.category}</CardDescription>
            </div>
          </div>
          {module.is_custom && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
              <Star className="h-3 w-3 mr-1" />
              Custom
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{module.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {module.duration_hours} hours
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Corporate Training
            </div>
          </div>
          
          {module.syllabus && (
            <div>
              <h4 className="font-medium mb-2">Topics Covered</h4>
              <div className="text-sm text-muted-foreground">
                {Array.isArray(module.syllabus) ? 
                  module.syllabus.slice(0, 3).map((topic: string, index: number) => (
                    <div key={index}>• {topic}</div>
                  ))
                  : "Comprehensive curriculum available"
                }
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-lg font-bold">
            ${module.price.toLocaleString()}
          </div>
          <Button>Get Quote</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingModuleCard;
