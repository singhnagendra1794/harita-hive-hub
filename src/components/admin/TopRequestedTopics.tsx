import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, TrendingUp, Clock, CheckCircle, XCircle, Circle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MissingQuery {
  id: string;
  query: string;
  times_requested: number;
  status: string;
  created_at: string;
  updated_at: string;
  days_old: number;
}

const TopRequestedTopics: React.FC = () => {
  const [queries, setQueries] = useState<MissingQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
  }, [statusFilter]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_top_missing_queries', {
        p_limit: 50,
        p_status: statusFilter === 'all' ? null : statusFilter
      });

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching missing queries:', error);
      toast({
        title: "Error",
        description: "Failed to load top requested topics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQueryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('missing_search_queries')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      await fetchQueries();
      toast({
        title: "Status Updated",
        description: `Query marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating query status:', error);
      toast({
        title: "Error",
        description: "Failed to update query status",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Circle className="h-4 w-4 text-blue-600" />;
      case 'ignored': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'ignored': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getPriorityColor = (requests: number, days: number) => {
    if (requests >= 10 || days >= 7) return 'border-l-red-500';
    if (requests >= 5 || days >= 3) return 'border-l-orange-500';
    return 'border-l-blue-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Requested Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Requested Topics
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Search queries that returned no results, helping identify content gaps
        </p>
      </CardHeader>
      <CardContent>
        {queries.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No missing search queries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                className={`p-4 border rounded-lg border-l-4 ${getPriorityColor(query.times_requested, query.days_old)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1">"{query.query}"</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {query.times_requested} request{query.times_requested !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {query.days_old} day{query.days_old !== 1 ? 's' : ''} ago
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(query.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(query.status)}
                        {query.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  {query.status !== 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQueryStatus(query.id, 'in_progress')}
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {query.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQueryStatus(query.id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {query.status !== 'ignored' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQueryStatus(query.id, 'ignored')}
                    >
                      Ignore
                    </Button>
                  )}
                </div>

                {query.times_requested >= 5 && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                    <strong>High Priority:</strong> This topic has been requested {query.times_requested} times
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopRequestedTopics;