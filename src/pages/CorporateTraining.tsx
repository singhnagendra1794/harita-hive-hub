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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Building, Users, Award, CheckCircle, ArrowRight, MessageSquare, Calendar, Star, Clock, Globe, Phone, Mail, CreditCard, Zap, BookOpen, Target, Play, ChevronRight, Monitor, Database, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CorporateTraining = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    teamSize: "",
    areasOfInterest: [] as string[],
    additionalInfo: ""
  });

  // Contact form state for payment
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    participants: "",
    requirements: "",
    timeline: "",
    budget: "",
    isSubmitting: false,
    showSignIn: false
  });

  // Floating CTA visibility
  const [showFloatingCTA, setShowFloatingCTA] = useState(true);

  // 5-Day Curriculum Data
  const curriculumDays = [
    {
      day: 1,
      title: "GIS Foundations",
      topics: [
        "Introduction to Geospatial Intelligence",
        "Understanding coordinate systems and projections",
        "Data types: Vector vs Raster",
        "Basic spatial analysis concepts",
        "Industry applications overview"
      ],
      realWorldExample: "Analyze retail location optimization for a national chain using demographic and competitor data",
      learningOutcomes: [
        "Master fundamental GIS concepts",
        "Navigate professional GIS software",
        "Understand spatial data structures",
        "Complete basic spatial analysis"
      ]
    },
    {
      day: 2,
      title: "GeoAI & Machine Learning",
      topics: [
        "Introduction to AI in Geospatial",
        "Satellite imagery analysis with ML",
        "Predictive modeling with spatial data",
        "Computer vision for mapping",
        "AutoML for geospatial applications"
      ],
      realWorldExample: "Build a crop yield prediction model using satellite data and weather patterns for agricultural planning",
      learningOutcomes: [
        "Implement ML algorithms on spatial data",
        "Process satellite imagery with AI",
        "Create predictive spatial models",
        "Understand GeoAI workflows"
      ]
    },
    {
      day: 3,
      title: "Spatial Data Engineering",
      topics: [
        "Database design for spatial data",
        "ETL processes for geospatial workflows",
        "API integration and data pipelines",
        "Cloud-based spatial computing",
        "Performance optimization techniques"
      ],
      realWorldExample: "Design and implement a real-time tracking system for logistics optimization across multiple cities",
      learningOutcomes: [
        "Design efficient spatial databases",
        "Build automated data pipelines",
        "Integrate multiple data sources",
        "Optimize spatial queries"
      ]
    },
    {
      day: 4,
      title: "Automation & Deployment",
      topics: [
        "Scripting for spatial automation",
        "CI/CD for geospatial applications",
        "Containerization of GIS workflows",
        "Scaling spatial applications",
        "Monitoring and maintenance"
      ],
      realWorldExample: "Deploy an automated disaster response mapping system that updates in real-time during emergencies",
      learningOutcomes: [
        "Automate repetitive GIS tasks",
        "Deploy scalable spatial solutions",
        "Implement monitoring systems",
        "Maintain production workflows"
      ]
    },
    {
      day: 5,
      title: "Custom Tool Showcase",
      topics: [
        "Team project presentations",
        "Custom tool development showcase",
        "Integration with existing systems",
        "ROI measurement and KPIs",
        "Future roadmap planning"
      ],
      realWorldExample: "Present your team's custom geospatial solution addressing a real business challenge in your organization",
      learningOutcomes: [
        "Present technical solutions effectively",
        "Demonstrate custom implementations",
        "Plan future geospatial initiatives",
        "Measure success metrics"
      ]
    }
  ];

  // Areas of Interest options
  const areasOfInterestOptions = [
    "Location Intelligence",
    "Supply Chain Optimization",
    "Market Analysis",
    "Risk Assessment",
    "Urban Planning",
    "Environmental Monitoring",
    "Asset Management",
    "Customer Analytics",
    "Emergency Response",
    "Business Intelligence"
  ];

  const handleAreasOfInterestChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: prev.areasOfInterest.includes(area)
        ? prev.areasOfInterest.filter(item => item !== area)
        : [...prev.areasOfInterest, area]
    }));
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-corporate-inquiry-email', {
        body: {
          name: formData.name,
          organization: formData.organization,
          email: formData.email,
          teamSize: formData.teamSize,
          areasOfInterest: formData.areasOfInterest,
          additionalInfo: formData.additionalInfo
        }
      });

      if (error) throw error;

      toast({
        title: "Inquiry Submitted Successfully!",
        description: "We'll contact you within 24 hours to discuss your training needs.",
      });

      setShowInquiryForm(false);
      setFormData({
        name: "",
        organization: "",
        email: "",
        teamSize: "",
        areasOfInterest: [],
        additionalInfo: ""
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error Submitting Inquiry",
        description: "Please try again or contact us directly at contact@haritahive.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setContactForm({ ...contactForm, showSignIn: true });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create Razorpay order for corporate training
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: 50000, // ₹50,000 for corporate training
          currency: 'INR',
          plan_type: 'corporate_training'
        }
      });

      if (error) throw error;

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Harita Hive',
        description: 'Corporate Training Program',
        order_id: data.order_id,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || '',
        },
        theme: { color: '#3B82F6' },
        handler: function (response: any) {
          toast({
            title: "Payment Successful!",
            description: "Our team will contact you soon to schedule the training.",
          });
          setContactForm({
            name: "",
            email: "",
            company: "",
            participants: "",
            requirements: "",
            timeline: "",
            budget: "",
            isSubmitting: false,
            showSignIn: false
          });
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
    
    // Track payment button click for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'Corporate Training',
        event_label: 'Payment Button'
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Landing Banner */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Zap className="h-4 w-4 mr-2" />
                Enterprise Geospatial Training
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Unlock the full power of geospatial intelligence across your team
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                AI + Human mentorship, custom tools, and hands-on projects for enterprise teams. 
                Transform your organization's spatial capabilities in just 5 days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setShowInquiryForm(true)} className="text-lg px-8">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Request Training
                </Button>
                <Button size="lg" variant="outline" onClick={handlePayment} className="text-lg px-8">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Book Now - $999/week
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-16">
          {/* Curriculum Breakdown */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">5-Day Intensive Curriculum</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Each day builds upon the previous, creating a comprehensive learning journey from foundations to advanced implementation.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {curriculumDays.map((day, index) => (
                <AccordionItem key={index} value={`day-${day.day}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Day {day.day}: {day.title}</h3>
                        <p className="text-sm text-muted-foreground">4 hours • Live instruction + hands-on</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Topics Covered
                        </h4>
                        <ul className="space-y-2">
                          {day.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Real-World Example
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">{day.realWorldExample}</p>
                        
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          Learning Outcomes
                        </h4>
                        <ul className="space-y-1">
                          {day.learningOutcomes.map((outcome, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 text-accent mt-1 flex-shrink-0" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Pricing Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Investment & Pricing</h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive training that delivers immediate ROI for your organization
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Pricing Card */}
              <Card className="lg:col-span-2 border-2 border-primary">
                <CardHeader className="text-center">
                  <Badge className="w-fit mx-auto mb-4">Most Popular</Badge>
                  <CardTitle className="text-2xl">Corporate Training Package</CardTitle>
                  <div className="text-4xl font-bold text-primary">$999 <span className="text-base font-normal text-muted-foreground">/ week</span></div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">What's Included:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Up to 25 participants
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          4 hours/day live sessions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Expert instructor guidance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          All training materials
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Industry certificates
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Support Included:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          30-day post-training support
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Resource library access
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Custom project guidance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Team collaboration tools
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Progress tracking dashboard
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button onClick={handlePayment} className="w-full" size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Book Training Now
                  </Button>
                </CardContent>
              </Card>

              {/* Add-ons Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add-Ons</CardTitle>
                  <CardDescription>Extend your training value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Extended Support</h4>
                        <p className="text-sm text-muted-foreground">3-month mentorship</p>
                      </div>
                      <span className="font-semibold">$299</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Additional Participants</h4>
                        <p className="text-sm text-muted-foreground">Per person over 25</p>
                      </div>
                      <span className="font-semibold">$39</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">AI Copilot License</h4>
                        <p className="text-sm text-muted-foreground">Internal tool access</p>
                      </div>
                      <span className="font-semibold">$199/mo</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">On-site Delivery</h4>
                        <p className="text-sm text-muted-foreground">At your location</p>
                      </div>
                      <span className="font-semibold">$499</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowInquiryForm(true)} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Customize Package
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Benefits Grid */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Harita Hive</h2>
              <p className="text-lg text-muted-foreground">
                Trusted by 500+ organizations across India and globally
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Expert Instructors</h3>
                  <p className="text-sm text-muted-foreground">Industry professionals with 10+ years experience</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Industry Recognition</h3>
                  <p className="text-sm text-muted-foreground">Certified programs recognized by leading organizations</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Enterprise Focus</h3>
                  <p className="text-sm text-muted-foreground">Tailored for business applications and ROI</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Proven Results</h3>
                  <p className="text-sm text-muted-foreground">98% satisfaction rate • 85% implementation success</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <Accordion type="single" collapsible className="max-w-3xl mx-auto">
              <AccordionItem value="delivery">
                <AccordionTrigger>Can training be delivered remotely or on-site?</AccordionTrigger>
                <AccordionContent>
                  We offer both remote and on-site training options. Remote training is conducted via our interactive platform with live instruction, screen sharing, and hands-on labs. On-site training is available for teams of 15+ participants with additional travel costs.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="customization">
                <AccordionTrigger>How much can the curriculum be customized?</AccordionTrigger>
                <AccordionContent>
                  Our curriculum is highly flexible. We can adjust examples to your industry, incorporate your actual data sets, focus on specific use cases relevant to your business, and modify the pace based on your team's experience level.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="prerequisites">
                <AccordionTrigger>What are the prerequisites for participants?</AccordionTrigger>
                <AccordionContent>
                  No prior GIS experience is required. Participants should have basic computer skills and familiarity with data analysis concepts. We'll assess your team's background and adjust the starting level accordingly.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="certification">
                <AccordionTrigger>What certifications do participants receive?</AccordionTrigger>
                <AccordionContent>
                  Participants receive industry-recognized certificates from Harita Hive upon completion. We also provide detailed skill assessments and can arrange for third-party certifications if required by your organization.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="support">
                <AccordionTrigger>What ongoing support is provided after training?</AccordionTrigger>
                <AccordionContent>
                  All packages include 30 days of email support, access to our resource library, and community forums. Extended mentorship packages are available for teams requiring longer-term guidance on implementation projects.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Inquiry Form Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Request Corporate Training</CardTitle>
                <CardDescription>
                  Tell us about your organization and we'll create a customized training program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization *</Label>
                      <Input 
                        id="organization" 
                        value={formData.organization}
                        onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Select value={formData.teamSize} onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 people</SelectItem>
                          <SelectItem value="11-25">11-25 people</SelectItem>
                          <SelectItem value="26-50">26-50 people</SelectItem>
                          <SelectItem value="50+">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Areas of Interest</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select all that apply to your organization</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {areasOfInterestOptions.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={formData.areasOfInterest.includes(area)}
                            onCheckedChange={() => handleAreasOfInterestChange(area)}
                          />
                          <Label htmlFor={area} className="text-sm font-normal cursor-pointer">
                            {area}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea 
                      id="additionalInfo" 
                      placeholder="Tell us about your current challenges, specific goals, preferred timeline, or any special requirements..."
                      rows={4}
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowInquiryForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating CTA */}
        {showFloatingCTA && (
          <div className="fixed bottom-4 right-4 z-40">
            <Card className="shadow-lg border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Button onClick={() => setShowInquiryForm(true)} size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Corporate Training
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFloatingCTA(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CorporateTraining;