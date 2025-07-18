import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatorApplicationFormProps {
  trigger?: React.ReactNode;
}

export const CreatorApplicationForm: React.FC<CreatorApplicationFormProps> = ({ trigger }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio_url: '',
    github_url: '',
    areas_of_interest: [] as string[]
  });

  const interestAreas = [
    'GIS Software Development',
    'Remote Sensing',
    'Cartography & Map Design',
    'Spatial Analysis',
    'GeoAI & Machine Learning',
    'Web Mapping',
    'Mobile GIS',
    'Drone/UAV Mapping',
    '3D Visualization',
    'Surveying & GPS',
    'Environmental Analysis',
    'Urban Planning'
  ];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_interest: prev.areas_of_interest.includes(interest)
        ? prev.areas_of_interest.filter(area => area !== interest)
        : [...prev.areas_of_interest, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email address",
        variant: "destructive"
      });
      return;
    }

    if (formData.areas_of_interest.length === 0) {
      toast({
        title: "Areas of interest required",
        description: "Please select at least one area of interest",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Insert creator application
      const { error: insertError } = await supabase
        .from('creator_applications')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          portfolio_url: formData.portfolio_url.trim() || null,
          github_url: formData.github_url.trim() || null,
          areas_of_interest: formData.areas_of_interest
        });

      if (insertError) throw insertError;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-creator-application-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          areas_of_interest: formData.areas_of_interest
        }
      });

      if (emailError) {
        console.warn('Email sending failed, but application was saved:', emailError);
      }

      toast({
        title: "Application submitted! 🎉",
        description: "We'll review your application and get back to you soon. Check your email for confirmation."
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        portfolio_url: '',
        github_url: '',
        areas_of_interest: []
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting creator application:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button className="w-full">
      Apply to Become a Creator
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Become a Harita Hive Creator</DialogTitle>
        </DialogHeader>
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold">Recognition</h4>
              <p className="text-xs text-muted-foreground">Featured content & profile visibility</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold">Community</h4>
              <p className="text-xs text-muted-foreground">Connect with industry experts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold">Growth</h4>
              <p className="text-xs text-muted-foreground">Build your professional brand</p>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <Input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          {/* Portfolio Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Portfolio & Links</h3>
            
            <Input
              type="url"
              placeholder="Portfolio/Website URL (Optional)"
              value={formData.portfolio_url}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
            />
            
            <Input
              type="url"
              placeholder="GitHub Profile URL (Optional)"
              value={formData.github_url}
              onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
            />
          </div>

          {/* Areas of Interest */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Areas of Interest *</h3>
            <p className="text-sm text-muted-foreground">
              Select the areas where you'd like to create content and share knowledge:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestAreas.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.areas_of_interest.includes(area)}
                    onCheckedChange={() => toggleInterest(area)}
                  />
                  <label
                    htmlFor={area}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {area}
                  </label>
                </div>
              ))}
            </div>
            
            {formData.areas_of_interest.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <p className="text-sm font-medium w-full">Selected areas:</p>
                {formData.areas_of_interest.map((area) => (
                  <Badge key={area} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};