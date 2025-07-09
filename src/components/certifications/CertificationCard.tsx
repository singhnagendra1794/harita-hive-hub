
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Shield, DollarSign } from "lucide-react";

interface Certification {
  id: string;
  title: string;
  description: string;
  badge_url?: string;
  requirements?: any;
  price: number;
  is_blockchain_verified: boolean;
}

interface CertificationCardProps {
  certification: Certification;
}

const CertificationCard = ({ certification }: CertificationCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            {certification.badge_url ? (
              <img src={certification.badge_url} alt={certification.title} className="w-full h-full rounded-lg object-cover" />
            ) : (
              <Award className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{certification.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {certification.is_blockchain_verified && (
                <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
                  <Shield className="h-3 w-3 mr-1" />
                  Blockchain Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{certification.description}</p>
        
        {certification.requirements && (
          <div className="space-y-2 mb-4">
            <h4 className="font-medium">Requirements</h4>
            <div className="text-sm text-muted-foreground">
              {Array.isArray(certification.requirements) ? 
                certification.requirements.slice(0, 3).map((req: string, index: number) => (
                  <div key={index}>• {req}</div>
                ))
                : "Completion of required coursework and assessment"
              }
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-1 text-lg font-bold">
            <DollarSign className="h-5 w-5" />
            {certification.price === 0 ? 'Free' : certification.price}
          </div>
          <Button>
            {certification.price === 0 ? 'Start Certification' : 'Enroll Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationCard;
