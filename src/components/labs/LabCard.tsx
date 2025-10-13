import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Clock, Layers, ChevronRight, Loader2 } from 'lucide-react';
import { useLabSession } from '@/hooks/useLabSession';

interface Lab {
  id: string;
  name: string;
  description: string;
  lab_type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  tools: string[];
  topics: string[];
  thumbnail_url?: string;
}

interface LabCardProps {
  lab: Lab;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
};

export const LabCard: React.FC<LabCardProps> = ({ lab }) => {
  const { launchLab, launching } = useLabSession();
  const isLaunching = launching === lab.id;

  const handleLaunch = async () => {
    await launchLab(lab);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {lab.name}
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground line-clamp-2">
              {lab.description}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={difficultyColors[lab.difficulty]}
          >
            {lab.difficulty}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {lab.tools.slice(0, 3).map((tool, idx) => (
            <Badge 
              key={idx} 
              variant="secondary"
              className="text-xs bg-secondary/50"
            >
              <Layers className="w-3 h-3 mr-1" />
              {tool}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{lab.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            <span>{lab.tools.length} tools</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button
          onClick={handleLaunch}
          disabled={isLaunching}
          className="w-full group/btn bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Launching Lab...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2 group-hover/btn:translate-x-0.5 transition-transform" />
              Launch Lab
              <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};