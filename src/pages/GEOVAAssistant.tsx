import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GEOVAChatInterface } from '@/components/geova/GEOVAChatInterface';
import GEOVAAvatarMentor from '@/components/geova/GEOVAAvatarMentor';
import { useChatbotIntegration } from '@/hooks/useChatbotIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, BookOpen, Target, Code, Map, Rocket, Trophy, Clock, 
  CheckCircle, Star, Play, ArrowRight, MessageCircle, Users,
  Zap, Globe, Award, TrendingUp, Quote, ExternalLink, Video
} from 'lucide-react';

const GEOVAAssistant = () => {
  const { user } = useAuth();
  const { askQuestion } = useChatbotIntegration();
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showAvatarMentor, setShowAvatarMentor] = useState(false);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Course Assistance",
      description: "Explains concepts from HaritaHive courses in detail with step-by-step guidance and interactive examples"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Code & Tool Support", 
      description: "Generates Python, R, SQL, and GIS automation scripts tailored to your specific project needs"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Project Guidance",
      description: "Helps in using templates, tools, and datasets from HaritaHive to complete real-world projects"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Exam & Job Prep",
      description: "Quizzes, interview prep, and mock project simulations to ensure career readiness"
    }
  ];

  const benefits = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Study Plans",
      description: "Custom learning paths based on your profile, goals, and current skill level"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Instant Expert Answers",
      description: "24/7 support for GIS, Remote Sensing, GeoAI, automation, coding, and data science questions"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Live Class Integration",
      description: "Real-time support during HaritaHive live classes with contextual assistance"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Career Roadmap Guidance",
      description: "Professional development aligned with your resume and integrated with Skill Copilot"
    }
  ];

  const successStories = [
    {
      name: "Sarah M.",
      role: "GIS Analyst at Urban Planning Firm",
      story: "GEOVA helped me master QGIS and Python automation in just 3 months. I landed my dream job with confidence in spatial analysis and project management.",
      achievement: "Certification + Job Placement"
    },
    {
      name: "David K.",
      role: "Freelance Remote Sensing Specialist", 
      story: "With GEOVA's guidance on satellite imagery analysis and machine learning, I started my own geospatial consulting business serving environmental organizations.",
      achievement: "Freelance Success"
    },
    {
      name: "Maria L.",
      role: "Environmental Data Scientist",
      story: "GEOVA's personalized learning path helped me transition from biology to geospatial data science. The career guidance was invaluable for my professional growth.",
      achievement: "Career Transition"
    }
  ];

  const handleStartLearning = () => {
    if (user) {
      setShowAvatarMentor(true);
    } else {
      askQuestion("I want to start learning with GEOVA. How do I begin my geospatial journey?");
    }
  };

  const handleStartTextChat = () => {
    if (user) {
      setShowChatInterface(true);
    } else {
      askQuestion("I want to chat with GEOVA about geospatial concepts.");
    }
  };

  if (showAvatarMentor) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowAvatarMentor(false)}
          >
            ← Back to GEOVA Overview
          </Button>
          <Badge variant="secondary" className="gap-2">
            <Video className="w-4 h-4" />
            Live Avatar Mode
          </Badge>
        </div>
        <GEOVAAvatarMentor 
          userContext={user ? {
            name: user.email?.split('@')[0],
            skillLevel: 'intermediate'
          } : undefined}
        />
      </div>
    );
  }

  if (showChatInterface) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowChatInterface(false)}
            className="mb-4"
          >
            ← Back to GEOVA Overview
          </Button>
        </div>
        <GEOVAChatInterface 
          contextType="assistant"
          showVoiceControls={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GEOVA – Your AI Mentor for Geospatial Mastery
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Learn smarter, faster, and more effectively with a 24/7 AI-powered mentor that guides you through the 
              <span className="font-semibold text-primary"> Geospatial Technology Unlocked</span> course and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartLearning}
                className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Video className="w-5 h-5 mr-2" />
                Meet GEOVA (Avatar Mode)
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleStartTextChat}
                className="text-lg px-8 py-4"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Text Chat Mode
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How GEOVA Helps Students */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How GEOVA Helps Students</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Accelerate your learning journey with personalized AI mentorship designed for geospatial professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">{benefit.icon}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Visual Grid */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered tools to support every aspect of your geospatial learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real results from learners who achieved their geospatial career goals with GEOVA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-primary/30" />
                </div>
                <p className="text-muted-foreground mb-4 italic">"{story.story}"</p>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{story.name}</p>
                      <p className="text-sm text-muted-foreground">{story.role}</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Award className="w-3 h-3 mr-1" />
                      {story.achievement}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction Video Section */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Meet Your AI Mentor</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch GEOVA in action and discover how AI mentorship can transform your learning experience
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">GEOVA Introduction Video</h3>
                  <p className="text-muted-foreground mb-4">
                    Coming Soon: Interactive demo showing GEOVA's capabilities
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleStartLearning}
                  >
                    Try GEOVA Now Instead
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Achieve Your Geospatial Goals?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students who are accelerating their careers with AI-powered mentorship. 
            Start your journey to becoming a geospatial professional today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleStartLearning}
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
            >
              <Video className="w-5 h-5 mr-2" />
              Launch Avatar Mentor
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleStartTextChat}
              className="text-lg px-8 py-4 border-white text-white hover:bg-white/10"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Text Chat Mode
            </Button>
            
            {!user && (
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = '/auth'}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Get Professional Access
              </Button>
            )}
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Personalized Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Career Focused</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GEOVAAssistant;