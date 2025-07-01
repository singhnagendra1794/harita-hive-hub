
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to HaritaHive! 🎉',
    description: 'Your journey into geospatial learning starts here. Let us show you around!',
    position: 'bottom'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your progress, access saved content, and manage your learning path.',
    position: 'bottom'
  },
  {
    id: 'learn',
    title: 'Learning Resources',
    description: 'Explore tutorials, courses, and hands-on projects to enhance your GIS skills.',
    position: 'bottom'
  },
  {
    id: 'map-playground',
    title: 'Interactive Maps',
    description: 'Create and visualize geospatial data with our interactive mapping tools.',
    position: 'bottom'
  },
  {
    id: 'community',
    title: 'Join the Community',
    description: 'Connect with fellow learners, share projects, and get help from experts.',
    position: 'bottom'
  }
];

const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Show tour for new users
    if (user) {
      const hasSeenTour = localStorage.getItem(`onboarding-tour-${user.id}`);
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }
  }, [user]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    if (user) {
      localStorage.setItem(`onboarding-tour-${user.id}`, 'completed');
    }
    setIsOpen(false);
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isOpen || !user) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary mr-2" />
            <CardTitle className="text-xl">{currentTourStep.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription className="text-center text-base leading-relaxed">
            {currentTourStep.description}
          </CardDescription>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button onClick={nextStep} className="flex items-center">
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={skipTour} className="text-muted-foreground">
              Skip tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;
