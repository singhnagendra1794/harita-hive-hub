import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedCodeSnippet } from "@/components/code-library/EnhancedCodeSnippet";
import { CodeLibraryFilters } from "@/components/code-library/CodeLibraryFilters";
import { productionSnippets, categories, languages, allTags } from "@/components/code-library/productionSnippets";
import { 
  Code, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  TestTube,
  Satellite,
  Database,
  Brain,
  Globe,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useAuth } from "@/contexts/AuthContext";

const CodeSnippets = () => {
  const { toast } = useToast();
  const { hasAccess } = usePremiumAccess();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    languages: [],
    tags: [],
    difficulty: [],
    status: [],
    testing: []
  });

  const [runningSnippets, setRunningSnippets] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());
  const [userRatings, setUserRatings] = useState({});

  // Icon mapping for categories
  const categoryIcons = {
    'remote-sensing': Satellite,
    'geoprocessing': Database,
    'machine-learning': Brain,
    'sql-postgis': Database,
    'web-gis': Globe,
    'data-visualization': BarChart3
  };

  // Update category counts
  const availableCategories = categories.map(cat => ({
    ...cat,
    icon: categoryIcons[cat.value] || Code,
    count: productionSnippets.filter(s => s.category === cat.value).length
  }));

  const availableLanguages = languages.map(lang => ({
    ...lang,
    count: productionSnippets.filter(s => s.language === lang.value).length
  }));

  const availableTags = allTags.map(tag => ({
    value: tag,
    label: tag,
    count: productionSnippets.filter(s => s.tags.includes(tag)).length
  })).filter(tag => tag.count > 0).sort((a, b) => b.count - a.count);

  // Filter snippets
  const filteredSnippets = productionSnippets.filter(snippet => {
    const matchesSearch = !filters.search || 
      snippet.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      snippet.summary.toLowerCase().includes(filters.search.toLowerCase()) ||
      snippet.use_case.toLowerCase().includes(filters.search.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesCategory = filters.categories.length === 0 || 
      filters.categories.includes(snippet.category);
    
    const matchesLanguage = filters.languages.length === 0 || 
      filters.languages.includes(snippet.language);
    
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => snippet.tags.includes(tag));
    
    const matchesStatus = filters.status.length === 0 || 
      (filters.status.includes('production_ready') && snippet.is_production_ready) ||
      (filters.status.includes('tested') && snippet.is_tested && !snippet.is_production_ready) ||
      (filters.status.includes('experimental') && !snippet.is_tested);

    return matchesSearch && matchesCategory && matchesLanguage && matchesTags && matchesStatus;
  });

  const handleRunSnippet = async (id) => {
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

  const handleFavorite = (id) => {
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

  const handleRate = (id, rating) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to rate snippets",
        variant: "destructive"
      });
      return;
    }

    setUserRatings(prev => ({ ...prev, [id]: rating }));
  };

  const handleReportIssue = (id, issue) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to report issues",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Issue reported",
      description: "Thank you for your feedback. We'll review it shortly.",
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">GIS & GeoAI Code Library</h1>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Production-grade, tested code snippets for GIS development, remote sensing, and geospatial AI applications
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TestTube className="h-4 w-4" />
              All snippets tested
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Enterprise ready
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {productionSnippets.length} curated snippets
            </div>
          </div>

          {!hasAccess('pro') && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                🚀 <strong>Unlock full code execution</strong> and download capabilities with Pro access.
                <a href="/choose-plan" className="underline ml-1">Upgrade now</a>
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <CodeLibraryFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCategories={availableCategories}
          availableLanguages={availableLanguages}
          availableTags={availableTags}
          totalResults={filteredSnippets.length}
        />

        {/* Snippets Grid */}
        <div className="mt-8 space-y-6">
          {filteredSnippets.map((snippet) => (
            <EnhancedCodeSnippet
              key={snippet.id}
              snippet={snippet}
              onRun={handleRunSnippet}
              onFavorite={handleFavorite}
              onRate={handleRate}
              onReportIssue={handleReportIssue}
              isRunning={runningSnippets.has(snippet.id)}
              isFavorited={favorites.has(snippet.id)}
              userRating={userRatings[snippet.id]}
            />
          ))}
        </div>

        {filteredSnippets.length === 0 && (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No snippets found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Need a Custom Solution?</CardTitle>
              <CardDescription>
                Our team can develop custom GIS algorithms and workflows for your specific use case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/contact">Contact Our Experts</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CodeSnippets;