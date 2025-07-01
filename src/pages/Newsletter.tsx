
import Layout from "../components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, Sparkles, TrendingUp, Users, BookOpen } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const interestOptions = [
    { id: 'gis-tutorials', label: 'GIS Tutorials & Tips' },
    { id: 'new-courses', label: 'New Course Announcements' },
    { id: 'job-opportunities', label: 'Job Opportunities' },
    { id: 'community-highlights', label: 'Community Highlights' },
    { id: 'tool-updates', label: 'Tool Updates & Features' },
    { id: 'industry-news', label: 'Industry News & Trends' }
  ];

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interestId]);
    } else {
      setInterests(interests.filter(id => id !== interestId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Simulate API call - in production, integrate with ConvertKit, Buttondown, etc.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      toast({
        title: "Welcome to HaritaHive! 🎉",
        description: "You're now subscribed to our newsletter. Check your email for a welcome message!",
      });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">You're All Set! 🎉</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for subscribing to the HaritaHive newsletter. We've sent a welcome email to <strong>{email}</strong>.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  What's next? Here are some things you can do while you wait for our next newsletter:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/learn'}>
                    Explore Learning Resources
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/community'}>
                    Join Our Community
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Mail className="h-4 w-4 mr-2" />
            Stay Updated
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Join Our Newsletter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the latest GIS tutorials, course updates, job opportunities, and community highlights delivered to your inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Newsletter Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Weekly GIS Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Practical tutorials and workflows you can use immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Course Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Be first to know about new courses and exclusive early access
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Community Highlights</h3>
                    <p className="text-sm text-muted-foreground">
                      Success stories, project showcases, and networking opportunities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Join 5,000+ GIS Professionals</h3>
              <p className="text-sm text-muted-foreground mb-4">
                "The HaritaHive newsletter is the first email I read every week. The tips are always practical and the community updates keep me connected." - Sarah M., GIS Analyst
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>📧 Weekly delivery</span>
                <span>🎯 No spam</span>
                <span>📱 Mobile-friendly</span>
              </div>
            </div>
          </div>

          {/* Subscription Form */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribe Now</CardTitle>
              <CardDescription>
                Customize your newsletter preferences to get content that matters to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name">First Name (Optional)</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your first name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">What interests you most?</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all that apply to personalize your newsletter
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {interestOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={interests.includes(option.id)}
                          onCheckedChange={(checked) => 
                            handleInterestChange(option.id, checked as boolean)
                          }
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={option.id} className="text-sm font-normal">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
                  <Mail className="h-4 w-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By subscribing, you agree to receive newsletter emails from HaritaHive. 
                  You can unsubscribe at any time. We respect your privacy and never share your email.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Newsletter;
