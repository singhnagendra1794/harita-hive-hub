import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Brain, Send, MessageCircle, BookOpen, Target, Lightbulb, Code, Map, Database, Zap, Bot, User, Star, TrendingUp } from "lucide-react";

const AIMentor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI GIS Mentor. I'm here to help you learn geospatial technologies, solve problems, and advance your career. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const mentorTopics = [
    {
      title: "GIS Fundamentals",
      description: "Learn basics of Geographic Information Systems",
      icon: Map,
      questions: [
        "What are coordinate systems and why are they important?",
        "How do I choose between vector and raster data?",
        "What's the difference between spatial and attribute data?"
      ]
    },
    {
      title: "Python for GIS",
      description: "Programming and automation in geospatial analysis",
      icon: Code,
      questions: [
        "How do I get started with ArcPy?",
        "What are the best Python libraries for GIS?",
        "How can I automate my GIS workflows?"
      ]
    },
    {
      title: "Spatial Databases",
      description: "Working with PostGIS and spatial SQL",
      icon: Database,
      questions: [
        "How do I set up PostGIS?",
        "What are spatial indexes and how do they help?",
        "How do I optimize spatial queries?"
      ]
    },
    {
      title: "Career Guidance",
      description: "Professional development and job market insights",
      icon: Target,
      questions: [
        "What skills are most in-demand for GIS jobs?",
        "How do I build a strong GIS portfolio?",
        "What certifications should I pursue?"
      ]
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: `That's a great question about "${inputMessage}". Let me help you with that. In GIS, this concept is important because it relates to spatial analysis and data management. Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const learningPaths = [
    {
      title: "Beginner GIS Analyst",
      progress: 65,
      modules: 8,
      completed: 5,
      estimatedTime: "4 weeks"
    },
    {
      title: "Python for GIS",
      progress: 30,
      modules: 12,
      completed: 4,
      estimatedTime: "6 weeks"
    },
    {
      title: "Remote Sensing Fundamentals",
      progress: 15,
      modules: 10,
      completed: 2,
      estimatedTime: "5 weeks"
    }
  ];

  const achievements = [
    { title: "First Question", description: "Asked your first question to AI Mentor", earned: true },
    { title: "Problem Solver", description: "Solved 5 GIS problems with AI help", earned: true },
    { title: "Code Explorer", description: "Generated 10 code snippets", earned: false },
    { title: "Career Planner", description: "Created your career roadmap", earned: false }
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI GIS Mentor</h1>
        <p className="text-muted-foreground">
          Get personalized guidance, solve problems, and accelerate your GIS learning journey
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI GIS Mentor
                    <Badge variant="secondary">Online</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              {message.type === 'ai' ? (
                                <>
                                  <AvatarImage src="/ai-mentor-avatar.png" />
                                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                </>
                              ) : (
                                <>
                                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask me anything about GIS, programming, or your career..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[40px] max-h-[120px]"
                      />
                      <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Start Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "How do I start learning GIS?",
                    "What's the best GIS software for beginners?",
                    "How do I analyze spatial data in Python?",
                    "What are the career opportunities in GIS?"
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Today's Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Projection Matters</p>
                        <p className="text-xs text-muted-foreground">Always check your coordinate system before analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Automate Workflows</p>
                        <p className="text-xs text-muted-foreground">Use Model Builder or Python to save time</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentorTopics.map((topic, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <topic.icon className="h-5 w-5 text-primary" />
                    {topic.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Popular Questions:</p>
                    {topic.questions.map((question, qIndex) => (
                      <Button
                        key={qIndex}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        <span className="text-xs">{question}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Learning Paths</h2>
          <div className="grid grid-cols-1 gap-4">
            {learningPaths.map((path, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{path.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {path.completed}/{path.modules} modules completed • {path.estimatedTime} estimated
                      </p>
                    </div>
                    <Badge variant="secondary">{path.progress}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">Continue Learning</Button>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`${achievement.earned ? 'border-primary' : 'opacity-50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && (
                        <Badge className="mt-2">Earned</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIMentor;