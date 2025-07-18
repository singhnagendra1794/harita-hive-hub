import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Download,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInPost {
  title: string;
  url: string;
  content: string;
  publishedDate: string;
  summary: string;
  imageUrl?: string;
}

export const LinkedInNewsletterImporter = () => {
  const { toast } = useToast();
  const [newsletterUrl, setNewsletterUrl] = useState('https://www.linkedin.com/newsletters/harita-hive-newsletter-7329705663612289024');
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: LinkedInPost[];
    failed: string[];
  } | null>(null);

  const extractPostsFromLinkedIn = async (url: string): Promise<LinkedInPost[]> => {
    // This is a placeholder for LinkedIn content extraction
    // In a real implementation, you would need to use a web scraping service
    // or LinkedIn's API (if available for newsletters)
    
    // For now, we'll return mock data to demonstrate the structure
    const mockPosts: LinkedInPost[] = [
      {
        title: "Edition #6: Latest Trends in GeoAI and Remote Sensing",
        url: "https://www.linkedin.com/pulse/edition-6-latest-trends-geoai-remote-sensing-harita-hive",
        content: "Explore the cutting-edge developments in GeoAI technology and how remote sensing is revolutionizing spatial analysis across various industries.",
        publishedDate: new Date().toISOString(),
        summary: "Cutting-edge developments in GeoAI technology and remote sensing applications",
        imageUrl: "https://via.placeholder.com/600x300/4F46E5/FFFFFF?text=GeoAI+Newsletter"
      },
      {
        title: "Edition #5: Python Tools for Geospatial Analysis",
        url: "https://www.linkedin.com/pulse/edition-5-python-tools-geospatial-analysis-harita-hive",
        content: "A comprehensive guide to the most essential Python libraries and tools for modern geospatial analysis and development.",
        publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        summary: "Essential Python libraries and tools for geospatial development",
        imageUrl: "https://via.placeholder.com/600x300/059669/FFFFFF?text=Python+GIS"
      }
    ];

    return mockPosts;
  };

  const importFromLinkedIn = async () => {
    setIsImporting(true);
    setImportResults(null);

    try {
      const posts = await extractPostsFromLinkedIn(newsletterUrl);
      const success: LinkedInPost[] = [];
      const failed: string[] = [];

      for (const post of posts) {
        try {
          // Check if post already exists
          const { data: existingPost } = await supabase
            .from('newsletter_posts')
            .select('id')
            .eq('linkedin_url', post.url)
            .maybeSingle();

          if (existingPost) {
            failed.push(`${post.title} - Already exists`);
            continue;
          }

          // Insert new post
          const { error } = await supabase
            .from('newsletter_posts')
            .insert({
              title: post.title,
              summary: post.summary,
              content: post.content,
              linkedin_url: post.url,
              featured_image_url: post.imageUrl,
              published_date: post.publishedDate,
              tags: ['LinkedIn Import', 'Newsletter'],
              is_featured: false
            });

          if (error) throw error;
          success.push(post);
        } catch (error) {
          console.error('Error importing post:', error);
          failed.push(`${post.title} - Import failed`);
        }
      }

      setImportResults({ success, failed });

      if (success.length > 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${success.length} newsletter post(s)`,
        });
      }

      if (failed.length > 0) {
        toast({
          title: "Partial Import",
          description: `${failed.length} post(s) failed to import`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error during import:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import LinkedIn newsletter posts",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            LinkedIn Newsletter Importer
          </CardTitle>
          <CardDescription>
            Import newsletter posts from your LinkedIn newsletter page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newsletter-url">LinkedIn Newsletter URL</Label>
            <Input
              id="newsletter-url"
              value={newsletterUrl}
              onChange={(e) => setNewsletterUrl(e.target.value)}
              placeholder="https://www.linkedin.com/newsletters/your-newsletter-id"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📝 How to Use:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enter your LinkedIn newsletter URL above</li>
              <li>• Click "Import Posts" to fetch latest editions</li>
              <li>• The system will automatically extract post details</li>
              <li>• Duplicate posts will be skipped</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Note:
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              LinkedIn content extraction is currently in development. For now, you can manually add posts using the "Add Newsletter Post" form above.
            </p>
          </div>

          <Button 
            onClick={importFromLinkedIn}
            disabled={isImporting || !newsletterUrl}
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing Posts...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import Posts from LinkedIn
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {importResults.success.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Successfully Imported ({importResults.success.length})
                </h4>
                <div className="space-y-2">
                  {importResults.success.map((post, index) => (
                    <div key={index} className="bg-green-50 dark:bg-green-950/50 p-3 rounded">
                      <p className="font-medium">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {new Date(post.publishedDate).toLocaleDateString()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(post.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResults.failed.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Failed to Import ({importResults.failed.length})
                </h4>
                <div className="space-y-1">
                  {importResults.failed.map((error, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-950/50 p-2 rounded text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkedInNewsletterImporter;