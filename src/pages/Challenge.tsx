import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Calendar, 
  Users, 
  Trophy, 
  CheckCircle,
  ExternalLink,
  Github,
  Youtube,
  FileText,
  Clock,
  MapPin,
  Code,
  Brain,
  Target,
  Award,
  Lightbulb,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Challenge = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [challengeStarted, setChallengeStarted] = useState(false);

  // Challenge start date: October 6, 2025
  const challengeStartDate = new Date('2025-10-06T00:00:00');
  const now = new Date();

  useEffect(() => {
    if (user) {
      checkRegistrationStatus();
    }
    
    // Check if challenge has started
    setChallengeStarted(now >= challengeStartDate);
    
    // Update countdown timer
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = challengeStartDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setChallengeStarted(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, challengeStartDate]);

  const checkRegistrationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('status')
        .eq('user_id', user.id)
        .eq('challenge_name', 'geoai-dashboard-challenge')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          email: email.toLowerCase(),
          full_name: fullName,
          user_id: user?.id || null,
          challenge_name: 'geoai-dashboard-challenge',
          status: 'registered'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Registered",
            description: "You're already registered for this challenge!",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setIsRegistered(true);
        toast({
          title: "Successfully Registered!",
          description: "You're all set for the GeoAI Dashboard Challenge.",
        });
        setEmail('');
        setFullName('');
      }
    } catch (error) {
      console.error('Error registering for challenge:', error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const tools = [
    { name: 'Python', icon: Code, description: 'Core programming language' },
    { name: 'GeoPandas', icon: MapPin, description: 'Geospatial data manipulation' },
    { name: 'Folium', icon: MapPin, description: 'Interactive map visualization' },
    { name: 'Streamlit/Dash', icon: Brain, description: 'Dashboard framework' }
  ];

  const features = [
    'Live map using OpenStreetMap',
    'Interactive layers and popups',
    'Filters and analytics views',
    'Real-time data visualization',
    'Professional dashboard layout'
  ];

  const audience = [
    { title: 'GIS Students', description: 'Perfect for students wanting hands-on experience' },
    { title: 'GIS Professionals', description: 'Enhance your Python and mapping skills' },
    { title: 'Data Scientists', description: 'Learn geospatial visualization techniques' },
    { title: 'Developers', description: 'Build your first geospatial application' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <div className="text-left">
            <Badge className="mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              💡 First Community Challenge
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              ⚡ Your 1-Hour GeoAI Dashboard Challenge
            </h1>
          </div>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Create a real-time dashboard with OSM + Python tools. 
          {challengeStarted ? (
            <span className="text-green-600 font-semibold"> Challenge is now live!</span>
          ) : (
            <span> Starts Friday, October 6, 2025</span>
          )}
        </p>

        {/* Countdown Timer */}
        {!challengeStarted && (
          <div className="mb-8">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5" />
                  Challenge Countdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Registration Form */}
        {!isRegistered ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">
                {challengeStarted ? 'Join the Challenge' : 'Register for Challenge'}
              </CardTitle>
              <CardDescription>
                {challengeStarted 
                  ? 'Challenge is live! Register now to participate.'
                  : 'Get notified when the challenge goes live'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {challengeStarted ? 'Join Challenge' : 'Register Now'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">You're registered!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                {challengeStarted 
                  ? 'Ready to start building your dashboard!'
                  : 'We\'ll notify you when the challenge begins.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* What You'll Build Section */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              What You'll Build
            </CardTitle>
            <CardDescription className="text-lg">
              Create a professional GeoAI dashboard in just 1 hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Dashboard Features
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-500" />
                  Tools & Technologies
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {tools.map((tool) => (
                    <div key={tool.name} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <tool.icon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{tool.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Who This Is For Section */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" />
              Who This Is For
            </CardTitle>
            <CardDescription className="text-lg">
              Challenge-friendly for all skill levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {audience.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Section */}
      {challengeStarted && (
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Challenge Instructions
                <Badge className="bg-green-500 text-white">Live Now!</Badge>
              </CardTitle>
              <CardDescription className="text-lg">
                Step-by-step guide to building your GeoAI dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Github className="h-8 w-8 mx-auto mb-3 text-gray-700 dark:text-gray-300" />
                        <h3 className="font-semibold mb-2">GitHub Repository</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get the starter code and detailed instructions
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View on GitHub
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Youtube className="h-8 w-8 mx-auto mb-3 text-red-500" />
                        <h3 className="font-semibold mb-2">Video Tutorial</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Follow along with our step-by-step video guide
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Watch Tutorial
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                        <h3 className="font-semibold mb-2">Challenge Rules</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Submission guidelines and deadlines
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Rules
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Challenge Rewards
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Certificate of completion for all participants
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Featured showcase on Harita Hive community
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Exclusive access to advanced GeoAI tutorials
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenge Not Started */}
      {!challengeStarted && (
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Challenge Instructions Coming Soon</h3>
              <p className="text-muted-foreground">
                Detailed instructions, GitHub repository, and tutorial videos will be available when the challenge goes live on October 6, 2025.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Challenge;