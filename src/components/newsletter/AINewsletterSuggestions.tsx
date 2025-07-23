import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Bookmark, 
  Calendar, 
  Clock,
  TrendingUp,
  Users,
  Lightbulb,
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const aiSuggestions = [
  {
    id: '1',
    type: 'topic',
    title: 'Focus on Flood Monitoring AI',
    description: 'Based on your interests in remote sensing and disaster management, we suggest covering AI applications in flood prediction and monitoring.',
    relevance: 95,
    sources: ['Recent papers on flood AI', 'Industry flood monitoring tools', 'Government initiatives'],
    tags: ['AI', 'Flood Monitoring', 'Disaster Management']
  },
  {
    id: '2',
    type: 'newsletter',
    title: 'Subscribe to "Satellite AI Weekly"',
    description: 'This newsletter covers the latest in satellite-based AI applications, which aligns with your interests in remote sensing.',
    relevance: 88,
    subscribers: '8.2K',
    frequency: 'Weekly',
    tags: ['Satellite', 'AI', 'Remote Sensing']
  },
  {
    id: '3',
    type: 'trend',
    title: 'Emerging Trend: Autonomous Drones for Mapping',
    description: 'AI-powered autonomous drone mapping is gaining traction. Consider featuring this in your next newsletter.',
    relevance: 91,
    growth: '+45% mentions this month',
    impact: 'High',
    tags: ['Drones', 'Autonomous Systems', 'Mapping']
  },
  {
    id: '4',
    type: 'content',
    title: 'Interview Opportunity: Dr. Sarah Chen',
    description: 'Leading researcher in GeoAI at Stanford. Available for interview about her latest work on urban planning AI.',
    relevance: 82,
    expertise: 'Urban Planning AI, Smart Cities',
    availability: 'Next 2 weeks',
    tags: ['Interview', 'Expert', 'Urban Planning']
  }
];

const userInterests = [
  'Remote Sensing',
  'Flood Monitoring',
  'Urban Planning',
  'Climate Change',
  'Satellite Imagery',
  'Machine Learning',
  'Disaster Management',
  'Smart Cities'
];

const deliveryOptions = [
  { id: 'daily', label: 'Daily Digest', description: 'Top 3 suggestions every morning' },
  { id: 'weekly', label: 'Weekly Summary', description: 'Comprehensive weekly roundup' },
  { id: 'realtime', label: 'Real-time Alerts', description: 'Immediate notifications for high-relevance content' }
];

export const AINewsletterSuggestions = () => {
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Remote Sensing', 'Machine Learning']);
  const [selectedDelivery, setSelectedDelivery] = useState('weekly');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "New Suggestions Generated",
        description: "AI has found 5 new relevant newsletters and trends for you.",
      });
    }, 2000);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'topic': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'newsletter': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'content': return <Users className="h-5 w-5 text-purple-500" />;
      default: return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (relevance >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI-Powered Newsletter Suggestions
        </h2>
        <p className="text-xl text-muted-foreground mb-6">
          Personalized recommendations based on your interests and reading patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Your Interests</Label>
                <div className="space-y-2">
                  {userInterests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={selectedInterests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="text-sm">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Delivery Frequency</Label>
                <div className="space-y-2">
                  {deliveryOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedDelivery === option.id}
                        onCheckedChange={() => setSelectedDelivery(option.id)}
                      />
                      <div>
                        <Label htmlFor={option.id} className="text-sm font-medium">
                          {option.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">25+</div>
                <div className="text-sm text-muted-foreground">Sources Monitored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">94%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12h</div>
                <div className="text-sm text-muted-foreground">Update Frequency</div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleGenerateMore} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate More
              </>
            )}
          </Button>
        </div>

        {/* Suggestions List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Personalized Suggestions</h3>
            <Badge variant="secondary">
              {aiSuggestions.length} recommendations
            </Badge>
          </div>

          <div className="space-y-4">
            {aiSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.type}
                          </Badge>
                          <Badge className={`text-xs ${getRelevanceColor(suggestion.relevance)}`}>
                            {suggestion.relevance}% match
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {suggestion.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Suggestion-specific details */}
                    {suggestion.type === 'newsletter' && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {suggestion.subscribers} subscribers
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {suggestion.frequency}
                        </span>
                      </div>
                    )}
                    
                    {suggestion.type === 'trend' && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {suggestion.growth}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {suggestion.impact} impact
                        </span>
                      </div>
                    )}
                    
                    {suggestion.type === 'content' && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Brain className="h-4 w-4" />
                          {suggestion.expertise}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {suggestion.availability}
                        </span>
                      </div>
                    )}
                    
                    {suggestion.type === 'topic' && suggestion.sources && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Sources: </span>
                        {suggestion.sources.join(', ')}
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {suggestion.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Learning Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Brain className="h-12 w-12 text-blue-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">AI is Learning Your Preferences</h3>
                  <p className="text-muted-foreground">
                    The more you interact with suggestions, the better our AI becomes at finding relevant content for you.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">127</div>
                    <div className="text-muted-foreground">Interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">94%</div>
                    <div className="text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">23</div>
                    <div className="text-muted-foreground">Saved Items</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};