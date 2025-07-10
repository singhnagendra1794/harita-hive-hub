
import { useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrainingModuleCard from "../components/training/TrainingModuleCard";
import { Building, Users, Award, CheckCircle, ArrowRight, MessageSquare, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CorporateTraining = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Mock data - replace with real data from Supabase
  const trainingModules = [
    {
      id: "1",
      title: "GIS Fundamentals for Business",
      description: "Comprehensive introduction to GIS concepts and applications for business teams and decision makers.",
      category: "Fundamentals",
      duration: 16,
      price: 2500,
      isCustom: false,
      features: [
        "Introduction to GIS concepts",
        "Hands-on exercises with ArcGIS",
        "Real-world business case studies",
        "Certificate of completion",
        "30-day post-training support"
      ],
      maxParticipants: 20,
      rating: 4.8
    },
    {
      id: "2",
      title: "Advanced Spatial Analysis Workshop",
      description: "Deep-dive into advanced spatial analysis techniques for experienced GIS professionals.",
      category: "Advanced",
      duration: 24,
      price: 3500,
      isCustom: false,
      features: [
        "Advanced spatial statistics",
        "Python scripting for GIS",
        "Machine learning applications",
        "Performance optimization",
        "Expert instructor guidance"
      ],
      maxParticipants: 15,
      rating: 4.9
    },
    {
      id: "3",
      title: "Web GIS Development Bootcamp",
      description: "Complete web-based GIS application development training for development teams.",
      category: "Development",
      duration: 32,
      price: 4200,
      isCustom: false,
      features: [
        "Modern web mapping APIs",
        "React + Leaflet integration",
        "PostGIS database design",
        "Deployment strategies",
        "Code review sessions"
      ],
      maxParticipants: 12,
      rating: 4.7
    },
    {
      id: "4",
      title: "Custom Enterprise Training",
      description: "Tailored training program designed specifically for your organization's needs and workflows.",
      category: "Custom",
      duration: 0,
      price: 0,
      isCustom: true,
      features: [
        "Customized curriculum",
        "Your data and workflows",
        "On-site or remote delivery",
        "Flexible scheduling",
        "Ongoing support included"
      ]
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience"
    },
    {
      icon: Award,
      title: "Certification",
      description: "Receive industry-recognized certificates upon completion"
    },
    {
      icon: Building,
      title: "Enterprise Focus",
      description: "Training designed specifically for business applications"
    },
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "98% satisfaction rate from over 500+ organizations"
    }
  ];

  const categories = ["Fundamentals", "Advanced", "Development", "Custom"];
  
  const filteredModules = selectedCategory === "all" 
    ? trainingModules 
    : trainingModules.filter(module => module.category === selectedCategory);

  const handleRequestInfo = (moduleId: string) => {
    const module = trainingModules.find(m => m.id === moduleId);
    toast({
      title: "Information Request Sent",
      description: `We'll contact you soon about "${module?.title}" training.`,
    });
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Quote Request Submitted",
      description: "Our team will contact you within 24 hours with a custom quote.",
    });
    setShowQuoteForm(false);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Corporate GIS Training</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empower your team with professional GIS training. Custom programs designed for your organization's specific needs and workflows.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Team?</h2>
                <p className="text-muted-foreground">
                  Get a custom training quote tailored to your organization's specific needs and goals.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowQuoteForm(true)} size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Get Custom Quote
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Modules */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Programs</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="custom">Custom Training</TabsTrigger>
            </TabsList>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModules.map(module => (
                <TrainingModuleCard 
                  key={module.id} 
                  {...module} 
                  onRequestInfo={handleRequestInfo}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainingModules.filter(m => m.rating && m.rating > 4.7).map(module => (
                <TrainingModuleCard 
                  key={module.id} 
                  {...module} 
                  onRequestInfo={handleRequestInfo}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainingModules.filter(m => m.isCustom).map(module => (
                <TrainingModuleCard 
                  key={module.id} 
                  {...module} 
                  onRequestInfo={handleRequestInfo}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Request Custom Training Quote</CardTitle>
                <CardDescription>
                  Tell us about your organization and training needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" required />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contact Person</Label>
                      <Input id="contact" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="participants">Number of Participants</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 people</SelectItem>
                          <SelectItem value="11-25">11-25 people</SelectItem>
                          <SelectItem value="26-50">26-50 people</SelectItem>
                          <SelectItem value="50+">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeline">Preferred Timeline</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">ASAP</SelectItem>
                          <SelectItem value="1-month">Within 1 month</SelectItem>
                          <SelectItem value="3-months">Within 3 months</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Training Requirements & Goals</Label>
                    <Textarea 
                      id="requirements" 
                      placeholder="Describe your team's current GIS knowledge level, specific training goals, and any custom requirements..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      Submit Request
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowQuoteForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">How long are the training programs?</h4>
              <p className="text-muted-foreground">Training duration varies from 16 to 32 hours, typically delivered over several days or weeks to accommodate work schedules.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Can you provide on-site training?</h4>
              <p className="text-muted-foreground">Yes, we offer both on-site and remote training options. On-site training is available for groups of 8 or more participants.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Do you provide training materials?</h4>
              <p className="text-muted-foreground">All training includes comprehensive materials, software access during training, and reference guides for future use.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What kind of support is included?</h4>
              <p className="text-muted-foreground">All programs include 30 days of post-training email support and access to our resource library.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CorporateTraining;
