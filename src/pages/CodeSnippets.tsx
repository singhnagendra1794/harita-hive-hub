import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SnippetCategoryMenu } from "@/components/code-library/SnippetCategoryMenu";
import { EnhancedSnippetCard } from "@/components/code-library/EnhancedSnippetCard";
import { productionSnippets } from "@/components/code-library/productionSnippets";
import { 
  Code, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  TestTube,
  Search,
  Filter,
  Sparkles,
  Bot,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useAuth } from "@/contexts/AuthContext";

const CodeSnippets = () => {
  const { toast } = useToast();
  const { hasAccess } = usePremiumAccess();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showMostUsed, setShowMostUsed] = useState(false);
  
  const [runningSnippets, setRunningSnippets] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());

  // Enhanced snippet data with customization guides
  const enhancedSnippets = productionSnippets.map(snippet => ({
    ...snippet,
    is_featured: Math.random() > 0.8, // Randomly mark some as featured for demo
    customization_guide: {
      variables: [
        {
          name: 'file_path',
          description: 'Path to your input data file',
          example: 'data/your_file.shp',
          required: true
        },
        {
          name: 'output_crs',
          description: 'Target coordinate reference system',
          example: 'EPSG:4326',
          required: false
        }
      ],
      steps: [
        {
          title: 'Prepare your data',
          description: 'Ensure your data is in the correct format and coordinate system'
        },
        {
          title: 'Configure parameters',
          description: 'Update the configuration variables to match your requirements'
        },
        {
          title: 'Run the analysis',
          description: 'Execute the code and review the output'
        }
      ],
      use_cases: [
        'Urban planning and zoning analysis',
        'Environmental impact assessment',
        'Infrastructure planning and development'
      ],
      tips: [
        'Always backup your original data before processing',
        'Test with a small subset first',
        'Check the coordinate reference system matches your project'
      ],
      common_errors: [
        {
          error: 'File not found or permission denied',
          solution: 'Check file path and ensure you have read permissions'
        }
      ],
      example_outputs: [
        {
          description: 'Processed spatial analysis results with highlighted areas of interest'
        }
      ]
    }
  }));

  // Category counts for the menu
  const categoryCount = enhancedSnippets.reduce((acc, snippet) => {
    acc[snippet.category] = (acc[snippet.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter snippets based on search and selected categories
  const filteredSnippets = enhancedSnippets.filter(snippet => {
    const matchesSearch = !search || 
      snippet.title.toLowerCase().includes(search.toLowerCase()) ||
      snippet.summary.toLowerCase().includes(search.toLowerCase()) ||
      snippet.use_case.toLowerCase().includes(search.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(cat => snippet.category.includes(cat) || cat.includes(snippet.category));
    
    const matchesLanguage = selectedLanguages.length === 0 || 
      selectedLanguages.includes(snippet.language);
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => snippet.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesLanguage && matchesTags;
  });

  // Sort snippets - featured first, then by rating
  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return b.rating_average - a.rating_average;
  });

  const handleRunSnippet = async (id: string) => {
    if (!hasAccess('pro')) {
      toast({
        title: "Pro Feature",
        description: "Code execution requires a Pro subscription",
        variant: "destructive"
      });
      return;
    }

    setRunningSnippets(prev => new Set([...prev, id]));
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRunningSnippets(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    toast({
      title: "Code executed successfully!",
      description: "All tests passed",
    });
  };

  const handleFavorite = (id: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save favorites",
        variant: "destructive"
      });
      return;
    }

    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast({ title: "Removed from favorites" });
      } else {
        newSet.add(id);
        toast({ title: "Added to favorites" });
      }
      return newSet;
    });
  };

  const handleDownload = (id: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to download snippets",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Download started!",
      description: "Code snippet is being downloaded",
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setSelectedTags([]);
  };

  const activeFilterCount = 
    (search ? 1 : 0) + 
    selectedCategories.length + 
    selectedLanguages.length + 
    selectedTags.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-background to-muted/30">
        <div className="container py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Code className="h-10 w-10 text-primary" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Intelligent Automation Library
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6">
              Ready-to-use, production-grade code snippets for the geospatial community. 
              <br />
              Coverage across QGIS, ArcGIS, Google Earth Engine, Python, R, PostGIS, and more.
            </p>
            
            {/* Enhanced Stats */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Production Ready</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                <Bot className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">AI-Powered Guides</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full border border-purple-200">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">{enhancedSnippets.length} Snippets</span>
              </div>
            </div>

            {!hasAccess('pro') && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-xl max-w-2xl mx-auto">
                <p className="text-sm text-blue-800">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  <strong>Unlock full potential</strong> with Pro access: Code execution, downloads, and AI-powered customization.
                  <a href="/choose-plan" className="underline ml-1 font-medium">Upgrade now</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Category Menu */}
          <div className="hidden lg:block">
            <SnippetCategoryMenu
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              snippetCounts={categoryCount}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search and Quick Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search automation scripts, tools, or use cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={showMostUsed ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMostUsed(!showMostUsed)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Most Used
                  </Button>
                  
                  {activeFilterCount > 0 && (
                    <>
                      <Badge variant="secondary">
                        {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear all
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {sortedSnippets.length} snippet{sortedSnippets.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>

            {/* Mobile Category Filter */}
            <div className="lg:hidden">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Categories ({selectedCategories.length})
              </Button>
            </div>

            {/* Snippets Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedSnippets.map((snippet) => (
                <EnhancedSnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onRun={handleRunSnippet}
                  onFavorite={handleFavorite}
                  onDownload={handleDownload}
                  isRunning={runningSnippets.has(snippet.id)}
                  isFavorited={favorites.has(snippet.id)}
                />
              ))}
            </div>

            {/* No Results */}
            {sortedSnippets.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No automation scripts found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or category filters to discover relevant code snippets.
                  </p>
                  <Button onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}

            {/* AI Assistant CTA */}
            <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-blue-900">Need Custom Code?</CardTitle>
                    <CardDescription className="text-blue-700">
                      Our AI can help you modify any snippet for your specific data and requirements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try AI Code Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippets;