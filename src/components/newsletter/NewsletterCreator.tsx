import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit, 
  Plus, 
  Eye, 
  Share, 
  Download, 
  Copy, 
  Image as ImageIcon,
  Palette,
  Layout,
  Type,
  Mail,
  Linkedin,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  category: string;
  selected: boolean;
  userComment?: string;
}

const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'Startup Raises $15M for Custom AI Maps',
    summary: 'Revolutionary platform for wildfire and flood monitoring using advanced geospatial AI',
    url: '#',
    category: 'Startup News',
    selected: false
  },
  {
    id: '2',
    title: 'How GeoAI is Shaping Field Operations',
    summary: 'Comprehensive analysis of GeoAI applications in utility management and construction',
    url: '#',
    category: 'Industry Trends',
    selected: false
  },
  {
    id: '3',
    title: 'A Comprehensive GeoAI Review: Progress & Challenges',
    summary: 'Academic paper reviewing current state and future outlook of GeoAI technologies',
    url: '#',
    category: 'Research',
    selected: false
  },
  {
    id: '4',
    title: 'GIScience in the Era of AI: Toward Autonomous GIS',
    summary: 'Exploring the evolution toward fully autonomous geospatial information systems',
    url: '#',
    category: 'Research',
    selected: false
  },
  {
    id: '5',
    title: 'Top 5 GeoAI Trends to Watch in 2025',
    summary: 'Key trends in automation and autonomy shaping the geospatial industry',
    url: '#',
    category: 'Trends',
    selected: false
  }
];

export const NewsletterCreator = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterIntro, setNewsletterIntro] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('professional');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [customArticle, setCustomArticle] = useState({ title: '', summary: '', url: '' });
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const themes = [
    { id: 'professional', name: 'Professional', description: 'Clean and corporate design' },
    { id: 'modern', name: 'Modern', description: 'Contemporary with vibrant accents' },
    { id: 'tech', name: 'Tech Focus', description: 'Technology-oriented styling' },
    { id: 'academic', name: 'Academic', description: 'Research and education focused' }
  ];

  const handleArticleToggle = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, selected: !article.selected }
        : article
    ));
  };

  const handleCommentChange = (articleId: string, comment: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, userComment: comment }
        : article
    ));
  };

  const handleAddCustomArticle = () => {
    if (customArticle.title && customArticle.summary) {
      const newArticle: Article = {
        id: Date.now().toString(),
        title: customArticle.title,
        summary: customArticle.summary,
        url: customArticle.url || '#',
        category: 'Custom',
        selected: true,
        userComment: ''
      };
      
      setArticles(prev => [...prev, newArticle]);
      setCustomArticle({ title: '', summary: '', url: '' });
      setIsAddingCustom(false);
      
      toast({
        title: "Article Added",
        description: "Your custom article has been added to the newsletter.",
      });
    }
  };

  const generateNewsletterHTML = () => {
    const selectedArticles = articles.filter(a => a.selected);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${newsletterTitle}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #2563eb; font-size: 28px; font-weight: bold; margin: 0; }
        .intro { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .article { margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .article-title { color: #1e40af; font-size: 20px; font-weight: bold; margin: 0 0 10px 0; }
        .article-summary { margin-bottom: 15px; }
        .article-comment { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 15px; }
        .category { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
        .read-more { color: #2563eb; text-decoration: none; font-weight: 500; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${newsletterTitle || 'Geospatial Newsletter'}</h1>
        <p>Curated by HaritaHive Newsletter Creator</p>
    </div>
    
    ${newsletterIntro ? `<div class="intro"><p>${newsletterIntro}</p></div>` : ''}
    
    ${selectedArticles.map(article => `
        <div class="article">
            <span class="category">${article.category}</span>
            <h2 class="article-title">${article.title}</h2>
            <p class="article-summary">${article.summary}</p>
            ${article.userComment ? `<div class="article-comment"><strong>My Take:</strong> ${article.userComment}</div>` : ''}
            <p><a href="${article.url}" class="read-more">Read full article →</a></p>
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Created with HaritaHive Newsletter Creator</p>
        <p>Stay updated with the latest in geospatial technology</p>
    </div>
</body>
</html>`;
  };

  const handleExportHTML = () => {
    const html = generateNewsletterHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${newsletterTitle.replace(/\s+/g, '_') || 'newsletter'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Newsletter Exported",
      description: "Your newsletter HTML file has been downloaded.",
    });
  };

  const handleCopyHTML = () => {
    const html = generateNewsletterHTML();
    navigator.clipboard.writeText(html);
    
    toast({
      title: "HTML Copied",
      description: "Newsletter HTML has been copied to clipboard.",
    });
  };

  const selectedCount = articles.filter(a => a.selected).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Edit className="h-8 w-8 text-primary" />
          Create Your Newsletter
        </h2>
        <p className="text-xl text-muted-foreground mb-6">
          Select articles, add your insights, and generate a professional newsletter in LinkedIn style
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Newsletter Setup */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Newsletter Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Newsletter Title</Label>
                <Input
                  id="title"
                  value={newsletterTitle}
                  onChange={(e) => setNewsletterTitle(e.target.value)}
                  placeholder="e.g., GeoAI Weekly Update"
                />
              </div>
              
              <div>
                <Label htmlFor="intro">Introduction</Label>
                <Textarea
                  id="intro"
                  value={newsletterIntro}
                  onChange={(e) => setNewsletterIntro(e.target.value)}
                  placeholder="Brief introduction to this week's newsletter..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label>Theme</Label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-muted-foreground">{theme.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={selectedCount === 0}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Newsletter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Newsletter Preview</DialogTitle>
                  </DialogHeader>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generateNewsletterHTML() }}
                  />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full" onClick={handleExportHTML} disabled={selectedCount === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export HTML
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleCopyHTML} disabled={selectedCount === 0}>
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>
              
              <Button variant="outline" className="w-full" disabled={selectedCount === 0}>
                <Linkedin className="h-4 w-4 mr-2" />
                Share on LinkedIn
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedCount}</div>
                <div className="text-sm text-muted-foreground">Articles Selected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Article Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Select Articles</h3>
            <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Article
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Article</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customTitle">Article Title</Label>
                    <Input
                      id="customTitle"
                      value={customArticle.title}
                      onChange={(e) => setCustomArticle(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter article title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customSummary">Summary</Label>
                    <Textarea
                      id="customSummary"
                      value={customArticle.summary}
                      onChange={(e) => setCustomArticle(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Brief summary of the article"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customUrl">URL (optional)</Label>
                    <Input
                      id="customUrl"
                      value={customArticle.url}
                      onChange={(e) => setCustomArticle(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCustomArticle} className="flex-1">
                      Add Article
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingCustom(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className={`transition-all duration-200 ${article.selected ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={article.selected}
                      onCheckedChange={() => handleArticleToggle(article.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {article.summary}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {article.selected && (
                  <CardContent>
                    <div>
                      <Label htmlFor={`comment-${article.id}`} className="text-sm font-medium">
                        Your Take (optional)
                      </Label>
                      <Textarea
                        id={`comment-${article.id}`}
                        value={article.userComment || ''}
                        onChange={(e) => handleCommentChange(article.id, e.target.value)}
                        placeholder="Add your insights or commentary on this article..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};