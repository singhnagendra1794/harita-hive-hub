import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ExternalLink, 
  Calendar, 
  Users, 
  TrendingUp,
  FileText,
  Globe,
  ArrowRight,
  Eye,
  Download,
  Bookmark
} from 'lucide-react';

const researchPapers = [
  {
    title: 'A Comprehensive GeoAI Review: Progress, Challenges, Outlooks',
    authors: 'Zhang, L., Wang, H., Chen, M.',
    journal: 'arXiv preprint',
    date: 'December 2024',
    summary: 'Comprehensive review of current GeoAI developments, challenges in implementation, and future research directions.',
    url: '#',
    citations: 45,
    category: 'Review Paper'
  },
  {
    title: 'GIScience in the Era of AI: Toward Autonomous GIS',
    authors: 'Johnson, R., Martinez, S., Kim, J.',
    journal: 'International Journal of GIS',
    date: 'March 2025',
    summary: 'Exploration of autonomous GIS systems and their potential impact on geospatial analysis workflows.',
    url: '#',
    citations: 23,
    category: 'Research Article'
  },
  {
    title: 'Geospatial Data Fusion: LiDAR + SAR + Optical Integration',
    authors: 'Anderson, P., Thompson, K., Lee, D.',
    journal: 'Remote Sensing Letters',
    date: 'December 2024',
    summary: 'Novel approaches to multi-sensor data fusion for enhanced urban mapping and environmental monitoring.',
    url: '#',
    citations: 67,
    category: 'Technical Paper'
  },
  {
    title: 'Machine Learning Applications in Flood Prediction Using Satellite Data',
    authors: 'Patel, N., Brown, A., Wilson, M.',
    journal: 'Environmental Modelling & Software',
    date: 'January 2025',
    summary: 'Comparative study of ML algorithms for flood prediction using multi-temporal satellite imagery.',
    url: '#',
    citations: 31,
    category: 'Research Article'
  }
];

const industryInsights = [
  {
    title: 'Top 5 GeoAI Trends to Watch in 2025',
    source: 'Geospatial World',
    date: 'July 2025',
    summary: 'Analysis of emerging trends in automation, autonomy, and AI-driven geospatial solutions.',
    readTime: '8 min read',
    views: '15.2K',
    category: 'Trends Analysis'
  },
  {
    title: 'The Economics of Geospatial AI Implementation',
    source: 'GIS Business',
    date: 'June 2025',
    summary: 'Cost-benefit analysis and ROI considerations for enterprises adopting GeoAI technologies.',
    readTime: '12 min read',
    views: '8.7K',
    category: 'Business Analysis'
  },
  {
    title: 'Real-time Processing Challenges in Satellite Image Analysis',
    source: 'Earth Observation Magazine',
    date: 'July 2025',
    summary: 'Technical challenges and solutions for processing satellite imagery in real-time applications.',
    readTime: '10 min read',
    views: '6.3K',
    category: 'Technical'
  }
];

const newsletterArchive = [
  {
    title: 'Shovels.ai July 2025 Newsletter',
    description: 'Latest updates on mapping & AI platform developments, permit data insights, and enterprise partnerships.',
    subscriber_count: '12.5K',
    category: 'AI Platform',
    frequency: 'Monthly',
    last_issue: 'July 15, 2025'
  },
  {
    title: 'NV5 Geospatial Industry Update',
    description: 'Comprehensive industry projects overview with real-world application examples and case studies.',
    subscriber_count: '8.2K',
    category: 'Industry News',
    frequency: 'Monthly',
    last_issue: 'June 28, 2025'
  },
  {
    title: 'I‑GUIDE Spatial AI Quarterly',
    description: 'Academic research updates, spatial AI challenges, and sustainability workshops coverage.',
    subscriber_count: '5.8K',
    category: 'Research',
    frequency: 'Quarterly',
    last_issue: 'Spring 2025'
  }
];

export const CuratedContent = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Curated Research & Insights
        </h2>
        <p className="text-xl text-muted-foreground mb-6">
          Latest academic research, industry insights, and expert analysis in geospatial technology
        </p>
      </div>

      {/* Research Papers Section */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Latest Research Papers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {researchPapers.map((paper, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {paper.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {paper.citations} citations
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {paper.title}
                </CardTitle>
                <CardDescription>
                  <div className="text-sm text-muted-foreground mb-2">
                    {paper.authors} • {paper.journal}
                  </div>
                  <div className="text-sm">
                    {paper.summary}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {paper.date}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Industry Insights Section */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-500" />
          Industry Insights & Analysis
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {industryInsights.map((insight, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {insight.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insight.readTime}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {insight.title}
                </CardTitle>
                <CardDescription>
                  <div className="text-sm text-muted-foreground mb-2">
                    {insight.source} • {insight.date}
                  </div>
                  <div className="text-sm">
                    {insight.summary}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {insight.views}
                  </div>
                  <Button size="sm">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter Archive Section */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Globe className="h-6 w-6 text-purple-500" />
          Featured Newsletter Archive
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsletterArchive.map((newsletter, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {newsletter.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {newsletter.frequency}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {newsletter.title}
                </CardTitle>
                <CardDescription>
                  {newsletter.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {newsletter.subscriber_count} subscribers
                    </span>
                    <span className="text-muted-foreground">
                      {newsletter.last_issue}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Subscribe
                    </Button>
                    <Button size="sm" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Latest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
        <CardContent className="pt-6 text-center">
          <h3 className="text-xl font-bold mb-2">Stay Updated with Latest Research</h3>
          <p className="text-muted-foreground mb-4">
            Get weekly summaries of the most important geospatial research and industry insights
          </p>
          <Button size="lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Subscribe to Research Digest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};