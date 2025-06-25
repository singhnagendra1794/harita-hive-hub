
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const InvestorMicrosite = () => {
  const keyMetrics = [
    { label: 'Monthly Active Users', value: '2,500+', growth: '+150%' },
    { label: 'Premium Conversion Rate', value: '3.8%', growth: '+25%' },
    { label: 'Monthly Recurring Revenue', value: '₹15,420', growth: '+80%' },
    { label: 'Content Creators', value: '45+', growth: '+200%' },
  ];

  const features = [
    'AI-powered content generation',
    'Interactive GIS learning platform',
    'Community-driven knowledge sharing',
    'Premium subscription model',
    'Mobile-first design',
    'Real-time collaboration tools'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Revolutionizing GIS Education
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're building the future of geospatial learning with AI-powered tools, 
            interactive content, and a thriving community of educators and learners.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Request Pitch Deck
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Call
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{metric.value}</div>
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {metric.growth}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To democratize geospatial education by making advanced GIS concepts accessible 
                to everyone through innovative AI-powered learning experiences. We envision a world 
                where geographic literacy empowers informed decision-making across all industries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Market Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                The global GIS market is projected to reach $25.6 billion by 2030, with education 
                technology growing at 16.3% CAGR. Our platform addresses the critical skills gap 
                in geospatial technology across emerging markets.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Platform Features</CardTitle>
            <CardDescription className="text-center">
              Cutting-edge technology powering the next generation of GIS education
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Founder Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Founder's Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                Founded by passionate educators and technologists who experienced firsthand 
                the challenges of learning and teaching GIS concepts. Our team combines 
                decades of experience in geospatial technology, education, and software development.
              </p>
              <p>
                We started this journey after recognizing that traditional GIS education 
                was not keeping pace with industry demands. By leveraging AI and modern 
                web technologies, we're creating an engaging, accessible, and effective 
                learning platform that scales globally.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traction & Growth */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Traction & Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Key Achievements</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 2,500+ active learners across 15+ countries</li>
                  <li>• 45+ verified content creators and instructors</li>
                  <li>• 3.8% premium conversion rate (industry avg: 2-3%)</li>
                  <li>• 150% month-over-month user growth</li>
                  <li>• Strategic partnerships with 5 educational institutions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Upcoming Milestones</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Launch enterprise B2B solutions (Q2 2024)</li>
                  <li>• Expand to 3 new geographic markets</li>
                  <li>• Integrate advanced AR/VR learning modules</li>
                  <li>• Achieve 10,000+ active users</li>
                  <li>• Establish corporate training partnerships</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Education?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in revolutionizing how the world learns about geospatial technology. 
            Let's discuss how we can build the future of education together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Download Pitch Deck
            </Button>
            <Button size="lg" variant="outline">
              Book Demo Call
            </Button>
            <Button size="lg" variant="outline">
              View Product Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
