import React, { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Target, Award, Globe, Lightbulb } from 'lucide-react';
import Layout from '../components/Layout';

interface AboutSection {
  id: string;
  title: string;
  content: string;
  section_type: string;
  order_index: number;
  image_url?: string;
  is_active: boolean;
}

const About = () => {
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutSections();
  }, []);

  const fetchAboutSections = async () => {
    try {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setAboutSections(data || []);
    } catch (error) {
      console.error('Error fetching about sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'mission': return <Target className="h-8 w-8 text-primary" />;
      case 'values': return <Award className="h-8 w-8 text-primary" />;
      case 'features': return <Lightbulb className="h-8 w-8 text-primary" />;
      case 'team': return <Users className="h-8 w-8 text-primary" />;
      case 'global': return <Globe className="h-8 w-8 text-primary" />;
      default: return <MapPin className="h-8 w-8 text-primary" />;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'mission': return 'bg-blue-50 border-blue-200';
      case 'values': return 'bg-green-50 border-green-200';
      case 'features': return 'bg-purple-50 border-purple-200';
      case 'team': return 'bg-orange-50 border-orange-200';
      case 'global': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container py-12 max-w-6xl">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="h-12 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group sections by type for better organization
  const heroSections = aboutSections.filter(s => s.section_type === 'hero');
  const missionSections = aboutSections.filter(s => s.section_type === 'mission');
  const valuesSections = aboutSections.filter(s => s.section_type === 'values');
  const featureSections = aboutSections.filter(s => s.section_type === 'features');
  const otherSections = aboutSections.filter(s => 
    !['hero', 'mission', 'values', 'features'].includes(s.section_type)
  );

  return (
    <Layout>
      <div className="container py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 flex items-center justify-center gap-4">
            <MapPin className="h-12 w-12 text-primary" />
            About Harita Hive
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering the next generation of geospatial professionals through innovative education and cutting-edge technology
          </p>
        </div>

        {/* Hero Content */}
        {heroSections.length > 0 && (
          <div className="mb-16">
            {heroSections.map((section) => (
              <Card key={section.id} className="text-center py-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent>
                  <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                  <div className="prose prose-lg mx-auto text-muted-foreground">
                    {section.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center py-8 bg-blue-50 border-blue-200">
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-sm font-medium text-blue-800">Active Learners</div>
            </CardContent>
          </Card>
          <Card className="text-center py-8 bg-green-50 border-green-200">
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-sm font-medium text-green-800">Expert Courses</div>
            </CardContent>
          </Card>
          <Card className="text-center py-8 bg-purple-50 border-purple-200">
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-sm font-medium text-purple-800">Success Rate</div>
            </CardContent>
          </Card>
          <Card className="text-center py-8 bg-orange-50 border-orange-200">
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm font-medium text-orange-800">Support</div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Section */}
        {missionSections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {missionSections.map((section) => (
                <Card key={section.id} className={getSectionColor(section.section_type)}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      {getSectionIcon(section.section_type)}
                      <div>
                        <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                        <div className="text-muted-foreground">
                          {section.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Values Section */}
        {valuesSections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {valuesSections.map((section) => (
                <Card key={section.id} className={getSectionColor(section.section_type)}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      {getSectionIcon(section.section_type)}
                      <div>
                        <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                        <div className="text-muted-foreground">
                          {section.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        {featureSections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Makes Us Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featureSections.map((section) => (
                <Card key={section.id} className={getSectionColor(section.section_type)}>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {getSectionIcon(section.section_type)}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      {section.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Sections */}
        {otherSections.length > 0 && (
          <div className="space-y-8">
            {otherSections.map((section) => (
              <Card key={section.id} className={getSectionColor(section.section_type)}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    {getSectionIcon(section.section_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xl font-semibold">{section.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {section.section_type}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {section.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <Card className="mt-16 bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your GIS Journey?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of professionals who have transformed their careers with Harita Hive
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/auth"
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Today
              </a>
              <a 
                href="/contact"
                className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
