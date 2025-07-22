import { useState } from "react";
import { Bot, User, MessageCircle, Linkedin, Mail, MapPin, Award, ExternalLink, Sparkles, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Mentorship = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "AI Mentor Response",
        description: "Your question has been processed. Check your chat for the response!",
      });
      setAiPrompt("");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Mentorship Journey</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized guidance through our dual mentorship model - expert human insight 
            combined with AI-powered 24/7 support for your geospatial career growth.
          </p>
        </div>

        {/* Two Mentorship Models */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Human Mentor - Nagendra Singh */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <User className="h-3 w-3 mr-1" />
                Human Expert
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/api/placeholder/200/200" alt="Nagendra Singh" />
                  <AvatarFallback className="text-lg font-bold">NS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">Nagendra Singh</CardTitle>
                  <p className="text-primary font-semibold mb-1">Senior Geospatial Solutions Architect</p>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>India • 8+ years experience</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quick Summary */}
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  Expert in geospatial automation, QGIS plugin development, and GeoAI applications. 
                  Specializes in helping professionals transition from traditional GIS to modern 
                  automated workflows and AI-enhanced spatial analysis.
                </p>
              </div>

              {/* Core Strengths */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Core Expertise
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="justify-center py-2">GeoAI & ML</Badge>
                  <Badge variant="outline" className="justify-center py-2">QGIS Plugins</Badge>
                  <Badge variant="outline" className="justify-center py-2">Automation</Badge>
                  <Badge variant="outline" className="justify-center py-2">Remote Sensing</Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-xs text-muted-foreground">Students Mentored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-xs text-muted-foreground">Tools Mastered</div>
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      View Full Profile & Book Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/api/placeholder/200/200" alt="Nagendra Singh" />
                          <AvatarFallback>NS</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>Nagendra Singh</div>
                          <div className="text-sm font-normal text-muted-foreground">
                            Senior Geospatial Solutions Architect
                          </div>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                      <div className="space-y-6">
                        {/* Detailed Bio */}
                        <div>
                          <h4 className="font-semibold mb-2">About</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            Nagendra is a seasoned geospatial professional with over 8 years of experience 
                            in developing innovative GIS solutions. He has led multiple automation projects, 
                            developed 20+ QGIS plugins, and pioneered several GeoAI applications for 
                            environmental monitoring and urban planning.
                          </p>
                        </div>

                        {/* Mentorship Focus */}
                        <div>
                          <h4 className="font-semibold mb-2">Mentorship Focus</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Career transition strategies for GIS professionals</li>
                            <li>• QGIS plugin development and Python automation</li>
                            <li>• Implementing AI/ML in geospatial workflows</li>
                            <li>• Building geospatial products and solutions</li>
                            <li>• Technical interview preparation</li>
                          </ul>
                        </div>

                        {/* Session Types */}
                        <div>
                          <h4 className="font-semibold mb-3">Available Sessions</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">1-on-1 Career Guidance</div>
                                <div className="text-sm text-muted-foreground">60 minutes • Personalized advice</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">$89</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">Technical Deep Dive</div>
                                <div className="text-sm text-muted-foreground">90 minutes • Hands-on coding</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">$129</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button className="w-full">Book Session</Button>
                          <Button variant="outline" className="w-full">Send Message</Button>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href="https://linkedin.com/in/nagendrasingh" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href="mailto:nagendra@haritahive.com">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Mentor - Harita AI Copilot */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-purple-50">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Bot className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    Harita AI Copilot
                    <Sparkles className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <p className="text-primary font-semibold mb-1">24/7 Intelligent Assistant</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Always Available</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* AI Description */}
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  Your intelligent companion for instant career guidance, technical support, and 
                  personalized learning recommendations. Powered by advanced AI trained on geospatial 
                  industry knowledge and best practices.
                </p>
              </div>

              {/* AI Capabilities */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Capabilities
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Career pathway recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Technical troubleshooting & code help</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Learning resource suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Industry insights & trend analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    <span>Skill gap analysis & improvement plans</span>
                  </div>
                </div>
              </div>

              {/* AI Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-primary/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-xs text-muted-foreground">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">&lt;30s</div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-xs text-muted-foreground">Topics Covered</div>
                </div>
              </div>

              {/* AI Interaction */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask me anything about your geospatial career, skills, tools, or learning path..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAskAI}
                  disabled={!aiPrompt.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask AI Mentor
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <Button variant="ghost" size="sm" className="text-primary">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Full Chat Interface
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">How Our Dual Mentorship Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Start with AI</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant answers to technical questions, career guidance, and learning recommendations from our AI mentor.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Human Expert Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  Book 1-on-1 sessions with Nagendra for deep career counseling, technical mentorship, and personalized advice.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Accelerated Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Combine AI efficiency with human expertise for the fastest path to achieving your geospatial career goals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-primary/5 to-purple-50">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Accelerate Your Career?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you need quick answers or deep guidance, our mentorship system is here to support 
              your journey in the geospatial industry.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="min-w-[200px]">
                <Bot className="h-4 w-4 mr-2" />
                Try AI Mentor Free
              </Button>
              <Button size="lg" variant="outline" className="min-w-[200px]">
                <User className="h-4 w-4 mr-2" />
                Book Human Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mentorship;