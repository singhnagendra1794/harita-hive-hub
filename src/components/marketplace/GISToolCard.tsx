
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, ExternalLink, Heart } from "lucide-react";
import { useState } from "react";

interface GISToolCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  downloads: number;
  rating: number;
  author: string;
  downloadUrl: string;
  isFeatured?: boolean;
  programmingLanguage?: string;
  compatibleSoftware?: string[];
}

const GISToolCard = ({ 
  id,
  title, 
  description, 
  category, 
  price, 
  downloads, 
  rating, 
  author, 
  downloadUrl,
  isFeatured,
  programmingLanguage,
  compatibleSoftware 
}: GISToolCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleDownload = () => {
    if (price === 0) {
      window.open(downloadUrl, '_blank');
    } else {
      // Handle payment flow
      console.log('Redirect to payment for tool:', id);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative">
      {isFeatured && (
        <Badge className="absolute top-2 right-2 z-10" variant="secondary">
          Featured
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="mt-1">
              by {author}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline">{category}</Badge>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {programmingLanguage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Language:</span>
              <Badge variant="secondary" className="text-xs">{programmingLanguage}</Badge>
            </div>
          )}

          {compatibleSoftware && compatibleSoftware.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Compatible:</span>
              {compatibleSoftware.slice(0, 2).map((software, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {software}
                </Badge>
              ))}
              {compatibleSoftware.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{compatibleSoftware.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {price === 0 ? 'Free' : `$${price}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          {price === 0 ? 'Download' : 'Purchase'}
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GISToolCard;
