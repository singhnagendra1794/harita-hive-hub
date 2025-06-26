
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Rocket, 
  Users, 
  Code, 
  GraduationCap, 
  Bot, 
  StickyNote, 
  Video,
  Star,
  ArrowRight,
  CheckCircle,
  Mail
} from 'lucide-react';
import { useBetaSignup } from '@/hooks/useBetaSignup';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const Beta = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const { signupForBeta } = useBetaSignup();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    
    setLoading(true);
    try {
      await signupForBeta(email, fullName);
      setSignedUp(true);
      toast({
        title: 'Welcome to the Beta!',
        description: 'Check your email for next steps and exclusive access.',
      });
    } catch (error) {
      toast({
        title: 'Signup Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <StickyNote className="h-6 w-6" />,
      title: 'Personal Notes',
      description: 'Create, organize, and sync your learning notes across devices'
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Code Library',
      description: 'Access curated GIS and geospatial code snippets and examples'
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: 'Live Classes',
      description: 'Join interactive live sessions with industry experts'
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI Tutor',
      description: 'Get personalized help and explanations from our AI assistant'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Hub',
      description: 'Connect with fellow learners and share knowledge'
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: 'Learning Paths',
      description: 'Structured courses from beginner to advanced levels'
    }
  ];

  if (signedUp) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Welcome to HaritaHive Beta! 🎉</h1>
                <p className="text-xl text-muted-foreground">
                  You're now part of our exclusive beta community.
                </p>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Check Your Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We've sent you a welcome email with:</p>
                  <ul className="text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Quick start guide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Video walkthrough
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Community access invite
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Your beta tester badge
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
                Start Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Rocket className="h-4 w-4 mr-1" />
                Public Beta Now Open
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HaritaHive Beta
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                An AI-powered learning & coding platform for geospatial and tech learners
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge variant="outline">🌍 GIS Learning</Badge>
                <Badge variant="outline">🤖 AI-Powered</Badge>
                <Badge variant="outline">👥 Community-Driven</Badge>
                <Badge variant="outline">📚 Comprehensive Resources</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Preview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-primary to-accent p-4">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="ml-4 text-sm">haritahive.com/dashboard</span>
                  </div>
                </div>
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <GraduationCap className="h-16 w-16 mx-auto text-primary" />
                    <p className="text-lg font-medium">Interactive Dashboard Preview</p>
                    <p className="text-muted-foreground">Your personalized learning hub</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Learners</h2>
                <p className="text-xl text-muted-foreground">
                  Everything you need to master geospatial technology
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {feature.icon}
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Beta Signup Form */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">Join the Beta Today</CardTitle>
                  <p className="text-muted-foreground">
                    Get early access to all features and help shape the future of geospatial learning
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">What you'll get:</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Beta tester badge and early access</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Direct influence on feature development</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Exclusive community access</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Priority support and updates</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? 'Joining Beta...' : 'Join Beta for Free'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Join the Growing Community</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Beta Testers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-muted-foreground">Code Snippets</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Live Classes</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Beta;
