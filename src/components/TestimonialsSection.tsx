
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'GIS Analyst',
    company: 'Urban Planning Solutions',
    content: 'HaritaHive transformed how I approach geospatial analysis. The interactive tutorials and real-world projects gave me confidence to tackle complex mapping challenges at work.',
    rating: 5,
    avatar: 'SC'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Environmental Scientist',
    company: 'EcoTech Research',
    content: 'The community aspect is incredible. I\'ve connected with experts who\'ve helped me solve problems I was stuck on for weeks. The code snippets library is a game-changer!',
    rating: 5,
    avatar: 'MR'
  },
  {
    id: '3',
    name: 'Dr. Priya Patel',
    role: 'Remote Sensing Researcher',
    company: 'Space Research Institute',
    content: 'As someone transitioning from traditional GIS to modern web-based solutions, HaritaHive provided exactly what I needed. The learning path is well-structured and practical.',
    rating: 5,
    avatar: 'PP'
  }
];

const TestimonialsSection: React.FC = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            What Our Community Says
          </Badge>
          <h2 className="text-4xl font-bold mb-4">Trusted by GIS Professionals</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who are advancing their geospatial careers with HaritaHive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative bg-background hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-8 w-8 text-primary/20 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Want to share your experience?
          </p>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
            Submit Your Review
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
