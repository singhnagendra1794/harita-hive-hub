import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2,
  Code,
  BookOpen,
  Crown
} from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  usage_count: number;
  permissions: string[];
}

interface APIManagerProps {
  subscription: any;
}

const APIManager = ({ subscription }: APIManagerProps) => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      // Simulate API keys for demo
      const mockKeys: APIKey[] = [
        {
          id: "1",
          name: "Production API",
          key: "gp_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
          usage_count: 1247,
          permissions: ["vector_processing", "raster_processing", "export"]
        },
        {
          id: "2",
          name: "Development API",
          key: "gp_test_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          usage_count: 342,
          permissions: ["vector_processing"]
        }
      ];
      setApiKeys(mockKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please provide a name for the API key.",
        variant: "destructive",
      });
      return;
    }

    if (subscription?.subscription_tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "API access requires a Pro or Enterprise subscription.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Simulate API key generation
      const newKey: APIKey = {
        id: Math.random().toString(36).substr(2, 9),
        name: newKeyName,
        key: `gp_live_${Math.random().toString(36).substr(2, 32)}`,
        created_at: new Date().toISOString(),
        usage_count: 0,
        permissions: ["vector_processing", "raster_processing", "export"]
      };

      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName("");

      toast({
        title: "API Key Generated",
        description: "Your new API key has been created. Copy it now as it won't be shown again.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const deleteAPIKey = async (keyId: string) => {
    try {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast({
        title: "API Key Deleted",
        description: "The API key has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const maskKey = (key: string) => {
    return key.replace(/^(.{8})(.*)(.{4})$/, '$1...$3');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
            {subscription?.subscription_tier === 'free' && (
              <Crown className="h-4 w-4 text-amber-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription?.subscription_tier === 'free' ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <div className="flex items-start gap-2">
                <Crown className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Premium Feature</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    API access is available for Pro and Enterprise users. Upgrade your plan to 
                    generate API keys and automate your geo-processing workflows.
                  </p>
                  <Button size="sm" className="mt-3">
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="key_name">API Key Name</Label>
                  <Input
                    id="key_name"
                    placeholder="e.g., Production API, Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={generateAPIKey}
                    disabled={generating}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {generating ? "Generating..." : "Generate Key"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      {subscription?.subscription_tier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No API keys generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {apiKey.usage_count} uses
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                          {apiKey.last_used && (
                            <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAPIKey(apiKey.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Quick Start</h3>
              <Textarea
                readOnly
                value={`# Submit a vector processing job
curl -X POST "https://api.haritahive.com/v1/jobs" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "job_type": "vector_buffer",
    "input_files": ["file_url_1"],
    "parameters": {
      "distance": 100,
      "units": "meters"
    }
  }'`}
                className="font-mono text-xs"
                rows={8}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-xs">Endpoints</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vector, raster, and merge processing endpoints with full REST API support.
                </p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-xs">Authentication</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bearer token authentication with rate limiting and usage tracking.
                </p>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-xs">SDKs</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Python, JavaScript, and R SDKs available for easy integration.
                </p>
              </Card>
            </div>
            
            <div className="pt-3 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                View Full Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIManager;
