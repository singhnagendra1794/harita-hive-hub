import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Calendar, 
  FileText, 
  ExternalLink, 
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface PurchasedTool {
  id: string;
  tool_id: string;
  amount: number;
  currency: string;
  status: string;
  download_count: number;
  max_downloads: number;
  created_at: string;
  marketplace_tools: {
    id: string;
    title: string;
    description: string;
    version: string;
    file_size_mb: number;
    installation_guide: string;
  };
}

const UserToolsManager: React.FC = () => {
  const [purchasedTools, setPurchasedTools] = useState<PurchasedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPurchasedTools();
    }
  }, [user]);

  const fetchPurchasedTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tool_orders')
        .select(`
          *,
          marketplace_tools!inner(
            id,
            title,
            description,
            version,
            file_size_mb,
            installation_guide
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchasedTools(data || []);
    } catch (error: any) {
      console.error('Error fetching purchased tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your purchased tools.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (tool: PurchasedTool) => {
    if (!user) return;

    // Check if download limit reached
    if (tool.download_count >= tool.max_downloads) {
      toast({
        title: 'Download Limit Reached',
        description: `You have reached the maximum downloads (${tool.max_downloads}) for this tool.`,
        variant: 'destructive'
      });
      return;
    }

    setDownloading(tool.id);

    try {
      const { data, error } = await supabase.functions.invoke('download-plugin', {
        body: {
          toolId: tool.tool_id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started",
          description: `${tool.marketplace_tools.title} is downloading.`,
        });

        // Refresh the tools list to update download count
        fetchPurchasedTools();
      } else {
        throw new Error(data.error || 'Download failed');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download tool. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (purchasedTools.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tools Purchased</h3>
          <p className="text-muted-foreground mb-4">
            You haven't purchased any tools yet. Visit the marketplace to browse available tools.
          </p>
          <Button asChild>
            <a href="/plugin-marketplace">Browse Marketplace</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Tools</h2>
          <p className="text-muted-foreground">
            Manage and download your purchased GIS tools
          </p>
        </div>
        <Button onClick={fetchPurchasedTools} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {purchasedTools.map((tool) => (
          <Card key={tool.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{tool.marketplace_tools.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Version {tool.marketplace_tools.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(tool.status)}
                  <Badge variant="outline">
                    {tool.currency} {tool.amount}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tool.marketplace_tools.description}
              </p>

              {/* Download Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Downloads Used</span>
                  <span>{tool.download_count} / {tool.max_downloads}</span>
                </div>
                <Progress 
                  value={(tool.download_count / tool.max_downloads) * 100}
                  className="h-2"
                />
              </div>

              {/* Tool Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Size:</span> {tool.marketplace_tools.file_size_mb}MB
                </div>
                <div>
                  <span className="font-medium">Purchased:</span> {format(new Date(tool.created_at), 'MMM dd, yyyy')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleDownload(tool)}
                  disabled={downloading === tool.id || tool.download_count >= tool.max_downloads}
                  size="sm"
                >
                  {downloading === tool.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : tool.download_count >= tool.max_downloads ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Limit Reached
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>

                {tool.marketplace_tools.installation_guide && (
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Install Guide
                  </Button>
                )}
              </div>

              {/* Download limit warning */}
              {tool.download_count >= tool.max_downloads - 1 && tool.download_count < tool.max_downloads && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You have {tool.max_downloads - tool.download_count} download(s) remaining.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserToolsManager;