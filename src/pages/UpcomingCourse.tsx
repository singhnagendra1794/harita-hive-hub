import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, BookOpen, Brain, Target, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ScheduleItem {
  id: string;
  day: number;
  week: number;
  topic: string;
  description: string;
  learning_goal: string;
  phase: string;
  estimated_duration: string;
}

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  enrollment_deadline: string;
  price: number;
  max_students: number;
  current_enrollments: number;
}

const UpcomingCourse: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [motivation, setMotivation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduleData();
    fetchCohortData();
  }, []);

  useEffect(() => {
    if (cohort) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(cohort.enrollment_deadline).getTime();
        const difference = deadline - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cohort]);

  const fetchScheduleData = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_course_schedule')
        .select('*')
        .eq('is_active', true)
        .order('day');

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchCohortData = async () => {
    try {
      const { data, error } = await supabase
        .from('course_cohorts')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCohort(data);
    } catch (error) {
      console.error('Error fetching cohort:', error);
    }
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('upcoming_course_waitlist')
        .insert({
          email: email.trim(),
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          experience_level: experienceLevel || 'beginner',
          motivation: motivation.trim() || null,
          referral_source: 'website'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already registered",
            description: "You're already on our waitlist! We'll notify you when enrollment opens.",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Successfully joined waitlist!",
        description: "We'll notify you when enrollment opens for the next cohort.",
      });

      // Reset form
      setEmail('');
      setFullName('');
      setPhone('');
      setExperienceLevel('');
      setMotivation('');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'fundamentals': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ml': return 'bg-green-100 text-green-800 border-green-300';
      case 'geoai': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'webgis': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'fundamentals': return <BookOpen className="h-4 w-4" />;
      case 'ml': return <Brain className="h-4 w-4" />;
      case 'geoai': return <Target className="h-4 w-4" />;
      case 'webgis': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const phaseDescriptions = {
    fundamentals: "Master the core concepts of GIS, spatial thinking, and Python programming",
    ml: "Learn to apply machine learning techniques to geospatial data and problems",
    geoai: "Dive deep into AI-powered geospatial analysis and computer vision",
    webgis: "Build and deploy modern web GIS applications and services"
  };

  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.phase]) {
      acc[item.phase] = [];
    }
    acc[item.phase].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HH</span>
            </div>
            <span className="font-bold text-xl">Harita Hive</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/auth">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            GeoAI Mastery Program
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your career with our comprehensive 8-week program that combines 
            Geographic Information Systems, Artificial Intelligence, and Machine Learning
          </p>
          
          {cohort && (
            <div className="bg-primary/10 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">Next Cohort Starts</h3>
              <p className="text-3xl font-bold text-primary mb-4">
                {new Date(cohort.start_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              
              {/* Countdown Timer */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.days}</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.hours}</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Enrollment deadline: {new Date(cohort.enrollment_deadline).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {cohort.current_enrollments}/{cohort.max_students} spots filled
              </p>
            </div>
          )}
        </div>

        {/* Program Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Program Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">8 Weeks</p>
              <p className="text-muted-foreground">
                Intensive hands-on learning with real-world projects and industry mentorship
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">3-6 hours/day</p>
              <p className="text-muted-foreground">
                Flexible schedule with live sessions, recorded content, and self-paced learning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Phases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Learning Journey</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(phaseDescriptions).map(([phase, description], index) => (
              <Card key={phase} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getPhaseColor(phase)} variant="outline">
                      <div className="flex items-center gap-1">
                        {getPhaseIcon(phase)}
                        <span className="capitalize">{phase}</span>
                      </div>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Week{phase === 'fundamentals' ? 's 1-2' : 
                           phase === 'ml' ? 's 3-4' :
                           phase === 'geoai' ? 's 5-6' : 's 7-8'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{description}</p>
                </CardContent>
                {index < 3 && (
                  <ArrowRight className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hidden lg:block" />
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Schedule */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Detailed Course Schedule</h2>
          <div className="space-y-8">
            {Object.entries(groupedSchedule).map(([phase, items]) => (
              <div key={phase}>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  {getPhaseIcon(phase)}
                  <span className="capitalize">{phase} Phase</span>
                  <Badge className={getPhaseColor(phase)} variant="outline">
                    {items.length} sessions
                  </Badge>
                </h3>
                <div className="grid gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">Day {item.day}</Badge>
                            <Badge variant="outline">Week {item.week}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.estimated_duration}
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold mb-2">{item.topic}</h4>
                        <p className="text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="font-medium">Goal:</span>
                          <span>{item.learning_goal}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Join the Waitlist</CardTitle>
            <CardDescription className="text-center">
              Be the first to know when enrollment opens for the next cohort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitWaitlist} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Experience Level
                  </label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  What motivates you to learn GeoAI?
                </label>
                <Textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Tell us about your goals and what you hope to achieve..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpcomingCourse;