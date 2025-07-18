import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ExternalLink,
  Tag,
  TrendingUp,
  BookOpen,
  Filter
} from 'lucide-react';
import { updatePageSEO, addSchemaMarkup, generateArticleSchema } from '@/utils/seoUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  published_date: string;
  tags: string[];
  featured_image_url?: string;
  read_time?: number;
  view_count: number;
  is_featured: boolean;
}

const Blog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    // Update SEO for blog page
    updatePageSEO({
      title: 'GIS & Geospatial Technology Blog | Harita Hive',
      description: 'Explore the latest insights, tutorials, and industry trends in GIS, remote sensing, Python for GIS, and geospatial AI. Written by experts for professionals.',
      keywords: 'GIS blog, geospatial tutorials, remote sensing articles, Python GIS, GeoAI, mapping tutorials, spatial analysis guides',
      url: window.location.href,
      type: 'website'
    });

    // Add website schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Harita Hive Blog",
      "description": "Latest insights and tutorials in GIS and geospatial technology",
      "url": "https://haritahive.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Harita Hive",
        "logo": "https://haritahive.com/logo-512.png"
      }
    };
    addSchemaMarkup(websiteSchema);

    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      // For now, we'll create sample blog posts since the table doesn't exist yet
      const samplePosts: BlogPost[] = [
        {
          id: '1',
          title: 'Getting Started with Python for GIS: A Complete Guide',
          summary: 'Learn how to leverage Python libraries like GeoPandas, Shapely, and Folium for powerful geospatial analysis and visualization.',
          content: 'Full content here...',
          author: 'Harita Hive Team',
          published_date: '2024-01-15',
          tags: ['Python', 'GeoAI', 'Tutorials'],
          featured_image_url: '/assets/python-gis-guide.jpg',
          read_time: 8,
          view_count: 1250,
          is_featured: true
        },
        {
          id: '2',
          title: 'Remote Sensing Applications in Urban Planning',
          summary: 'Discover how satellite imagery and remote sensing techniques are revolutionizing urban development and smart city initiatives.',
          content: 'Full content here...',
          author: 'Dr. Sarah Johnson',
          published_date: '2024-01-12',
          tags: ['Remote Sensing', 'Urban Planning', 'Satellite Imagery'],
          featured_image_url: '/assets/urban-planning-rs.jpg',
          read_time: 12,
          view_count: 890,
          is_featured: false
        },
        {
          id: '3',
          title: 'Building Interactive Web Maps with Leaflet and OpenStreetMap',
          summary: 'Step-by-step tutorial on creating dynamic, interactive web maps using Leaflet.js and OpenStreetMap data.',
          content: 'Full content here...',
          author: 'Alex Chen',
          published_date: '2024-01-10',
          tags: ['Web Mapping', 'OpenStreetMap', 'JavaScript'],
          featured_image_url: '/assets/web-mapping-tutorial.jpg',
          read_time: 15,
          view_count: 2100,
          is_featured: true
        },
        {
          id: '4',
          title: 'AI-Powered Land Cover Classification with Google Earth Engine',
          summary: 'Harness the power of machine learning and Google Earth Engine for automated land cover classification at scale.',
          content: 'Full content here...',
          author: 'Maria Rodriguez',
          published_date: '2024-01-08',
          tags: ['GeoAI', 'Google Earth Engine', 'Machine Learning'],
          featured_image_url: '/assets/gee-ai-classification.jpg',
          read_time: 20,
          view_count: 1560,
          is_featured: false
        },
        {
          id: '5',
          title: 'QGIS Advanced Tips: Automating Workflows with PyQGIS',
          summary: 'Boost your productivity with advanced QGIS automation techniques using PyQGIS for repetitive geospatial tasks.',
          content: 'Full content here...',
          author: 'Tom Wilson',
          published_date: '2024-01-05',
          tags: ['QGIS', 'PyQGIS', 'Automation'],
          featured_image_url: '/assets/qgis-automation.jpg',
          read_time: 10,
          view_count: 980,
          is_featured: false
        },
        {
          id: '6',
          title: 'Career Opportunities in the Growing GeoAI Industry',
          summary: 'Explore emerging job roles, required skills, and career paths in the rapidly expanding field of Geospatial AI.',
          content: 'Full content here...',
          author: 'Harita Hive Careers Team',
          published_date: '2024-01-03',
          tags: ['Careers', 'GeoAI', 'Industry Trends'],
          featured_image_url: '/assets/geoai-careers.jpg',
          read_time: 6,
          view_count: 1820,
          is_featured: false
        }
      ];

      setPosts(samplePosts);
      
      // Extract unique tags
      const tags = Array.from(new Set(samplePosts.flatMap(post => post.tags)));
      setAllTags(tags);
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on search and tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const featuredPosts = filteredPosts.filter(post => post.is_featured);
  const regularPosts = filteredPosts.filter(post => !post.is_featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Python': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'GeoAI': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Remote Sensing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Tutorials': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'QGIS': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Careers': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[tag] || colors.default;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              GIS & Geospatial Blog
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Expert insights, tutorials, and industry trends in GIS, remote sensing, and geospatial technology.
          </p>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={selectedTag ? "default" : "outline"}
                onClick={() => setSelectedTag(null)}
                className="sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                {selectedTag ? `Filter: ${selectedTag}` : 'All Topics'}
              </Button>
            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTag === tag ? '' : getTagColor(tag)}`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Featured Articles</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featured_image_url && (
                    <div className="aspect-video bg-muted">
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_date)}
                      </div>
                      {post.read_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.read_time} min read
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className={getTagColor(tag)}
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {post.view_count} views
                      </span>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Read Article
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  {post.featured_image_url && (
                    <div className="aspect-video bg-muted">
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.published_date)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className={getTagColor(tag)}
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {post.read_time && (
                          <>
                            <Clock className="h-4 w-4" />
                            <span>{post.read_time} min</span>
                          </>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedTag 
                ? "Try adjusting your search or filter criteria." 
                : "Check back soon for new content!"
              }
            </p>
            {(searchTerm || selectedTag) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;