
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import TrainingModuleCard from "../components/training/TrainingModuleCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Clock, Award, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CorporateTraining = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const benefits = [
    "Customized curriculum for your team",
    "Expert-led live sessions",
    "Hands-on projects with real data",
    "Completion certificates",
    "Ongoing support and mentorship",
    "Flexible scheduling options"
  ];

  const categories = [
    "ArcGIS Enterprise",
    "QGIS Automation", 
    "GeoAI & Remote Sensing",
    "PostGIS & Spatial Databases",
    "Python for GIS",
    "Web GIS Development"
  ];

  useEffect(() => {
    fetchTrainingModules();
  }, []);

  const fetchTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching training modules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Corporate GIS Training</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your team's geospatial capabilities with our comprehensive corporate training programs. 
            Custom-designed for your organization's specific needs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies Trained</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150+</div>
              <p className="text-xs text-muted-foreground">
                Successful implementations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professionals Trained</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,000+</div>
              <p className="text-xs text-muted-foreground">
                Certified professionals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25,000+</div>
              <p className="text-xs text-muted-foreground">
                Hours delivered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                Client satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Our Corporate Training?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Training Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={index} variant="outline" className="text-sm py-2 px-4">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Training Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Training Modules</h2>
          <p className="text-muted-foreground mb-6">
            Browse our most requested corporate training programs
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <TrainingModuleCard key={module.id} module={module} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Training modules coming soon</h3>
              <p className="text-muted-foreground">
                We're preparing comprehensive training programs for your team.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Custom Training CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Need Custom Training?</h2>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              We can design a completely custom training program tailored to your team's specific needs, 
              technology stack, and business objectives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Request Custom Training
              </Button>
              <Button size="lg" variant="outline">
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CorporateTraining;
