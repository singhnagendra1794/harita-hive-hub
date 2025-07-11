import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  className?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  description,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <Card className="max-w-md mx-4 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5" />
            Premium Feature
          </CardTitle>
          <CardDescription>
            {description || `Access to ${feature} is available with a premium subscription.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ Unlock premium tools and features</p>
            <p>🚀 Advanced analysis capabilities</p>
            <p>📚 Full course library access</p>
          </div>
          
          <div className="space-y-2">
            <Link to="/pricing">
              <Button className="w-full" size="lg">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground">
              Starting from ₹3,999/month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePrompt;