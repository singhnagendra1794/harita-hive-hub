
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, ExternalLink, Zap } from 'lucide-react';

const CommunityLinks: React.FC = () => {
  const communityChannels = [
    {
      name: 'Discord Community',
      description: 'Join our growing GIS community on Discord for real-time discussions, Q&A, and networking with fellow GIS professionals.',
      icon: MessageCircle,
      link: 'https://discord.gg/invite', // Placeholder - admin needs to create actual Discord server
      members: 'Join our growing community',
      color: 'bg-indigo-500'
    },
    {
      name: 'WhatsApp Group',
      description: 'Connect with our active WhatsApp group for instant help, project discussions, and networking.',
      icon: MessageCircle,
      link: 'https://chat.whatsapp.com/EMJJZCTuiuD0zQ66IhhZpA',
      members: '75+ members',
      color: 'bg-green-500'
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Users className="h-4 w-4 mr-2" />
            Join Our Community
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Connect with GIS Professionals</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get help, share projects, and network with thousands of geospatial professionals worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {communityChannels.map((channel, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${channel.color} text-white`}>
                    <channel.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {channel.members} members
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-base">
                  {channel.description}
                </CardDescription>
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                  onClick={() => window.open(channel.link, '_blank')}
                >
                  Join Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-full">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              New members get priority support for their first week!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityLinks;
