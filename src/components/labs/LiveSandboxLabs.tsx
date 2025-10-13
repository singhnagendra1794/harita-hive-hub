import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LabCard } from './LabCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLabSession } from '@/hooks/useLabSession';

interface Lab {
  id: string;
  name: string;
  description: string;
  lab_type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  tools: string[];
  topics: string[];
  thumbnail_url?: string;
}

const LiveSandboxLabs = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [quota, setQuota] = useState<any>(null);
  const { checkQuota } = useLabSession();

  useEffect(() => {
    fetchLabs();
    loadQuota();
  }, []);

  useEffect(() => {
    filterLabs();
  }, [labs, searchQuery, difficultyFilter]);

  const fetchLabs = async () => {
    try {
      const { data, error } = await supabase
        .from('labs')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      setLabs((data || []) as Lab[]);
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuota = async () => {
    const quotaData = await checkQuota();
    setQuota(quotaData);
  };

  const filterLabs = () => {
    let filtered = [...labs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lab =>
        lab.name.toLowerCase().includes(query) ||
        lab.description.toLowerCase().includes(query) ||
        lab.tools.some(tool => tool.toLowerCase().includes(query)) ||
        lab.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(lab => lab.difficulty === difficultyFilter);
    }

    setFilteredLabs(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading labs...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Pro Feature</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Live Sandbox Labs
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Launch professional GIS environments in your browser. No installation required.
        </p>
      </div>

      {/* Quota Display */}
      {quota && (
        <Alert className="border-primary/20 bg-primary/5">
          <Sparkles className="w-4 h-4 text-primary" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Lab Sessions: </span>
            {quota.remaining === -1 ? (
              <span className="text-primary">Unlimited</span>
            ) : (
              <span>
                <span className="text-primary font-semibold">{quota.remaining}</span> of {quota.monthly_limit} remaining this month
              </span>
            )}
            {quota.subscription_tier && (
              <span className="ml-2 text-muted-foreground">
                ({quota.subscription_tier} tier)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search labs, tools, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background/50 border-border/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Labs Grid */}
      {filteredLabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No labs found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-12 p-6 rounded-lg bg-muted/30 border border-border/50">
        <h3 className="font-semibold mb-2">What are Live Sandbox Labs?</h3>
        <p className="text-sm text-muted-foreground">
          Each lab is a pre-configured cloud environment with professional GIS tools, sample datasets, 
          and guided missions. Launch instantly, work for up to 90 minutes, and export your results. 
          No installation or setup required.
        </p>
      </div>
    </div>
  );
};

export default LiveSandboxLabs;