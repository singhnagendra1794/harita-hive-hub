
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, BookOpen, DollarSign } from "lucide-react";

interface TrainingModuleCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in hours
  price: number;
  isCustom: boolean;
  features: string[];
  maxParticipants?: number;
  rating?: number;
  onRequestInfo: (id: string) => void;
}

const TrainingModuleCard = ({
  id,
  title,
  description,
  category,
  duration,
  price,
  isCustom,
  features,
  maxParticipants,
  rating,
  onRequestInfo
}: TrainingModuleCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative">
      {isCustom && (
        <Badge className="absolute top-4 right-4 z-10" variant="secondary">
          Custom
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">{category}</Badge>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="mt-2">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{duration}h</span>
            </div>
            {maxParticipants && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Up to {maxParticipants}</span>
              </div>
            )}
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            What's Included
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-xs text-muted-foreground">
                +{features.length - 4} more features
              </li>
            )}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold">
              {price === 0 ? 'Custom Quote' : `$${price.toLocaleString()}`}
            </span>
            {price > 0 && (
              <span className="text-sm text-muted-foreground">/training</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => onRequestInfo(id)} className="flex-1">
            Request Information
          </Button>
          <Button variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingModuleCard;
