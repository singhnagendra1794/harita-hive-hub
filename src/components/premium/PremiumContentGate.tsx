
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { Link } from 'react-router-dom';

interface PremiumContentGateProps {
  contentType: string;
  contentId: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const PremiumContentGate: React.FC<PremiumContentGateProps> = ({
  contentType,
  contentId,
  title,
  description,
  children,
  className = ''
}) => {
  const { checkContentAccess, hasPremiumAccess } = usePremiumAccess();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremiumContent, setIsPremiumContent] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await checkContentAccess(contentType, contentId);
        setHasAccess(access);
        
        // If user doesn't have access, it means content is premium
        if (!access && !hasPremiumAccess) {
          setIsPremiumContent(true);
        }
      } catch (error) {
        console.error('Error checking content access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [contentType, contentId, hasPremiumAccess, checkContentAccess]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // If user has access, show the content
  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // If content is not premium, show it anyway (fallback)
  if (!isPremiumContent) {
    return <div className={className}>{children}</div>;
  }

  // Show premium gate
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content preview */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="max-w-md mx-4 shadow-lg border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <Lock className="h-5 w-5" />
                Premium Content
              </CardTitle>
              <CardDescription>
                {title && (
                  <span className="font-medium text-foreground block mb-1">
                    {title}
                  </span>
                )}
                {description || 'This content is available to premium subscribers only.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Unlimited access to premium content</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Downloadable resources and PDFs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Ad-free experience</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Link to="/pricing">
                  <Button className="w-full" size="lg">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    Starting from ₹999/month
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumContentGate;
