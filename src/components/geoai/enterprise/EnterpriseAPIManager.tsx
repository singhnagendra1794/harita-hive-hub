import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Webhook,
  Code,
  Download,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Settings,
  BookOpen,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used: string;
  usage_count: number;
  rate_limit: number;
  is_active: boolean;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  last_delivery: string;
  delivery_count: number;
  status: 'active' | 'failed' | 'disabled';
}

interface APIUsage {
  date: string;
  requests: number;
  successful: number;
  failed: number;
  avg_response_time: number;
}

const EnterpriseAPIManager: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [apiUsage, setApiUsage] = useState<APIUsage[]>([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keys');

  useEffect(() => {
    if (user) {
      loadAPIData();
    }
  }, [user]);

  const loadAPIData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAPIKeys(),
        loadWebhooks(),
        loadAPIUsage()
      ]);
    } catch (error) {
      console.error('Error loading API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAPIKeys = async () => {
    // Mock data for now - in real implementation, this would come from database
    const mockKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production API Key',
        key: 'geoai_prod_' + Math.random().toString(36).substring(2, 15),
        permissions: ['workflows:run', 'data:read', 'results:download'],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        usage_count: 1247,
        rate_limit: 1000,
        is_active: true
      },
      {
        id: '2',
        name: 'Development API Key',
        key: 'geoai_dev_' + Math.random().toString(36).substring(2, 15),
        permissions: ['workflows:run', 'data:read'],
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        last_used: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        usage_count: 89,
        rate_limit: 100,
        is_active: true
      }
    ];
    setApiKeys(mockKeys);
  };

  const loadWebhooks = async () => {
    // Mock data for now
    const mockWebhooks: WebhookEndpoint[] = [
      {
        id: '1',
        url: 'https://api.company.com/webhooks/geoai',
        events: ['job.completed', 'job.failed'],
        secret: 'whsec_' + Math.random().toString(36).substring(2, 15),
        is_active: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_delivery: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        delivery_count: 156,
        status: 'active'
      }
    ];
    setWebhooks(mockWebhooks);
  };

  const loadAPIUsage = async () => {
    // Mock usage data for the last 7 days
    const mockUsage: APIUsage[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      mockUsage.push({
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 200) + 50,
        successful: Math.floor(Math.random() * 180) + 40,
        failed: Math.floor(Math.random() * 20) + 2,
        avg_response_time: Math.floor(Math.random() * 500) + 200
      });
    }
    setApiUsage(mockUsage);
  };

  const createAPIKey = async (name: string, permissions: string[]) => {
    try {
      const newKey: APIKey = {
        id: Date.now().toString(),
        name,
        key: 'geoai_' + Math.random().toString(36).substring(2, 15) + '_' + Math.random().toString(36).substring(2, 15),
        permissions,
        created_at: new Date().toISOString(),
        last_used: '',
        usage_count: 0,
        rate_limit: 1000,
        is_active: true
      };

      setApiKeys(prev => [...prev, newKey]);
      setShowCreateKey(false);

      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully",
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const createWebhook = async (url: string, events: string[]) => {
    try {
      const newWebhook: WebhookEndpoint = {
        id: Date.now().toString(),
        url,
        events,
        secret: 'whsec_' + Math.random().toString(36).substring(2, 15),
        is_active: true,
        created_at: new Date().toISOString(),
        last_delivery: '',
        delivery_count: 0,
        status: 'active'
      };

      setWebhooks(prev => [...prev, newWebhook]);
      setShowCreateWebhook(false);

      toast({
        title: "Webhook Created",
        description: "Your webhook endpoint has been configured successfully",
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive"
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValue(showKeyValue === keyId ? null : keyId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const deactivateKey = async (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, is_active: false } : key
    ));
    toast({
      title: "API Key Deactivated",
      description: "The API key has been deactivated",
    });
  };

  const toggleWebhook = async (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, is_active: !webhook.is_active, status: webhook.is_active ? 'disabled' : 'active' }
        : webhook
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4D35E]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Header */}
      <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4D35E] rounded-lg">
              <Key className="h-6 w-6 text-[#0D1B2A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Enterprise API Manager</h1>
              <p className="text-sm text-[#F9F9F9]/70">Manage API keys, webhooks, and integration settings</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={loadAPIData}
              variant="outline"
              className="border-[#43AA8B]/20 text-[#43AA8B] hover:bg-[#43AA8B]/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => window.open('/docs/api', '_blank')}
              variant="outline"
              className="border-[#F4D35E]/20 text-[#F4D35E] hover:bg-[#F4D35E]/10"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              API Docs
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-[#1B263B] border-b border-[#43AA8B]/20 justify-start gap-0 rounded-none h-12">
            <TabsTrigger 
              value="keys" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger 
              value="webhooks" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Webhook className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger 
              value="usage" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Activity className="h-4 w-4 mr-2" />
              Usage Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="docs" 
              className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
            >
              <Code className="h-4 w-4 mr-2" />
              Integration
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="keys" className="h-full m-0 p-6">
              <APIKeysTab 
                apiKeys={apiKeys}
                onCreateKey={createAPIKey}
                onDeactivateKey={deactivateKey}
                showKeyValue={showKeyValue}
                onToggleKeyVisibility={toggleKeyVisibility}
                onCopyToClipboard={copyToClipboard}
                showCreateKey={showCreateKey}
                setShowCreateKey={setShowCreateKey}
              />
            </TabsContent>
            
            <TabsContent value="webhooks" className="h-full m-0 p-6">
              <WebhooksTab 
                webhooks={webhooks}
                onCreateWebhook={createWebhook}
                onToggleWebhook={toggleWebhook}
                showCreateWebhook={showCreateWebhook}
                setShowCreateWebhook={setShowCreateWebhook}
                onCopyToClipboard={copyToClipboard}
              />
            </TabsContent>
            
            <TabsContent value="usage" className="h-full m-0 p-6">
              <UsageAnalyticsTab apiUsage={apiUsage} />
            </TabsContent>
            
            <TabsContent value="docs" className="h-full m-0 p-6">
              <IntegrationDocsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// API Keys Tab Component
interface APIKeysTabProps {
  apiKeys: APIKey[];
  onCreateKey: (name: string, permissions: string[]) => void;
  onDeactivateKey: (keyId: string) => void;
  showKeyValue: string | null;
  onToggleKeyVisibility: (keyId: string) => void;
  onCopyToClipboard: (text: string) => void;
  showCreateKey: boolean;
  setShowCreateKey: (show: boolean) => void;
}

const APIKeysTab: React.FC<APIKeysTabProps> = ({
  apiKeys,
  onCreateKey,
  onDeactivateKey,
  showKeyValue,
  onToggleKeyVisibility,
  onCopyToClipboard,
  showCreateKey,
  setShowCreateKey
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">API Keys</h2>
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogTrigger asChild>
          <Button className="bg-[#43AA8B] hover:bg-[#43AA8B]/90">
            <Key className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create New API Key</DialogTitle>
          </DialogHeader>
          <CreateAPIKeyForm onSubmit={onCreateKey} />
        </DialogContent>
      </Dialog>
    </div>

    <div className="space-y-4">
      {apiKeys.map(key => (
        <Card key={key.id} className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-medium">{key.name}</h4>
                  <Badge className={key.is_active ? 'bg-[#43AA8B] text-white' : 'bg-gray-500 text-white'}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <code className="bg-[#0D1B2A] px-3 py-1 rounded text-sm text-[#F9F9F9]/90">
                    {showKeyValue === key.id ? key.key : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleKeyVisibility(key.id)}
                    className="text-[#F9F9F9]/70 hover:text-white"
                  >
                    {showKeyValue === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopyToClipboard(key.key)}
                    className="text-[#F9F9F9]/70 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {key.permissions.map(permission => (
                    <Badge key={permission} variant="outline" className="border-[#43AA8B]/30 text-[#43AA8B]">
                      {permission}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-[#F9F9F9]/70">Created:</span>
                    <div className="text-white">{new Date(key.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-[#F9F9F9]/70">Last Used:</span>
                    <div className="text-white">
                      {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#F9F9F9]/70">Usage:</span>
                    <div className="text-white">{key.usage_count} / {key.rate_limit} per hour</div>
                  </div>
                </div>
              </div>
              
              {key.is_active && (
                <Button
                  onClick={() => onDeactivateKey(key.id)}
                  variant="outline"
                  className="border-[#EE964B] text-[#EE964B] hover:bg-[#EE964B]/10"
                >
                  Deactivate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {apiKeys.length === 0 && (
      <div className="text-center py-12">
        <Key className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No API keys</h3>
        <p className="text-[#F9F9F9]/70">Create your first API key to get started</p>
      </div>
    )}
  </div>
);

// Create API Key Form Component
interface CreateAPIKeyFormProps {
  onSubmit: (name: string, permissions: string[]) => void;
}

const CreateAPIKeyForm: React.FC<CreateAPIKeyFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const availablePermissions = [
    'workflows:run',
    'workflows:read',
    'data:read',
    'data:write',
    'results:download',
    'webhooks:manage',
    'analytics:read'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedPermissions.length > 0) {
      onSubmit(name, selectedPermissions);
      setName('');
      setSelectedPermissions([]);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-white text-sm mb-2 block">Key Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production API Key"
          className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
        />
      </div>
      
      <div>
        <label className="text-white text-sm mb-2 block">Permissions</label>
        <div className="space-y-2">
          {availablePermissions.map(permission => (
            <label key={permission} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission)}
                onChange={() => togglePermission(permission)}
                className="rounded"
              />
              <span className="text-[#F9F9F9]/90 text-sm">{permission}</span>
            </label>
          ))}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#43AA8B] hover:bg-[#43AA8B]/90"
        disabled={!name || selectedPermissions.length === 0}
      >
        Create API Key
      </Button>
    </form>
  );
};

// Webhooks Tab Component
interface WebhooksTabProps {
  webhooks: WebhookEndpoint[];
  onCreateWebhook: (url: string, events: string[]) => void;
  onToggleWebhook: (webhookId: string) => void;
  showCreateWebhook: boolean;
  setShowCreateWebhook: (show: boolean) => void;
  onCopyToClipboard: (text: string) => void;
}

const WebhooksTab: React.FC<WebhooksTabProps> = ({
  webhooks,
  onCreateWebhook,
  onToggleWebhook,
  showCreateWebhook,
  setShowCreateWebhook,
  onCopyToClipboard
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-white">Webhook Endpoints</h2>
      <Dialog open={showCreateWebhook} onOpenChange={setShowCreateWebhook}>
        <DialogTrigger asChild>
          <Button className="bg-[#43AA8B] hover:bg-[#43AA8B]/90">
            <Webhook className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1B263B] border-[#43AA8B]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <CreateWebhookForm onSubmit={onCreateWebhook} />
        </DialogContent>
      </Dialog>
    </div>

    <div className="space-y-4">
      {webhooks.map(webhook => (
        <Card key={webhook.id} className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <code className="bg-[#0D1B2A] px-3 py-1 rounded text-sm text-[#F9F9F9]/90">
                    {webhook.url}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopyToClipboard(webhook.url)}
                    className="text-[#F9F9F9]/70 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Badge className={
                    webhook.status === 'active' ? 'bg-[#43AA8B] text-white' :
                    webhook.status === 'failed' ? 'bg-[#EE964B] text-white' :
                    'bg-gray-500 text-white'
                  }>
                    {webhook.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline" className="border-[#F4D35E]/30 text-[#F4D35E]">
                      {event}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#F9F9F9]/70">Created:</span>
                    <div className="text-white">{new Date(webhook.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-[#F9F9F9]/70">Deliveries:</span>
                    <div className="text-white">{webhook.delivery_count}</div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => onToggleWebhook(webhook.id)}
                variant="outline"
                className={webhook.is_active ? 
                  "border-[#EE964B] text-[#EE964B] hover:bg-[#EE964B]/10" :
                  "border-[#43AA8B] text-[#43AA8B] hover:bg-[#43AA8B]/10"
                }
              >
                {webhook.is_active ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {webhooks.length === 0 && (
      <div className="text-center py-12">
        <Webhook className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No webhooks configured</h3>
        <p className="text-[#F9F9F9]/70">Add webhook endpoints to receive real-time notifications</p>
      </div>
    )}
  </div>
);

// Create Webhook Form Component
interface CreateWebhookFormProps {
  onSubmit: (url: string, events: string[]) => void;
}

const CreateWebhookForm: React.FC<CreateWebhookFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const availableEvents = [
    'job.started',
    'job.completed',
    'job.failed',
    'workflow.created',
    'workflow.updated',
    'data.processed',
    'result.generated'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && selectedEvents.length > 0) {
      onSubmit(url, selectedEvents);
      setUrl('');
      setSelectedEvents([]);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-white text-sm mb-2 block">Webhook URL</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.company.com/webhooks/geoai"
          className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white"
        />
      </div>
      
      <div>
        <label className="text-white text-sm mb-2 block">Events</label>
        <div className="space-y-2">
          {availableEvents.map(event => (
            <label key={event} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEvents.includes(event)}
                onChange={() => toggleEvent(event)}
                className="rounded"
              />
              <span className="text-[#F9F9F9]/90 text-sm">{event}</span>
            </label>
          ))}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#43AA8B] hover:bg-[#43AA8B]/90"
        disabled={!url || selectedEvents.length === 0}
      >
        Create Webhook
      </Button>
    </form>
  );
};

// Usage Analytics Tab Component
interface UsageAnalyticsTabProps {
  apiUsage: APIUsage[];
}

const UsageAnalyticsTab: React.FC<UsageAnalyticsTabProps> = ({ apiUsage }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">API Usage Analytics</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-[#1B263B] border-[#43AA8B]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F9F9F9]/70 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-white">
                {apiUsage.reduce((sum, day) => sum + day.requests, 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-[#43AA8B]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1B263B] border-[#43AA8B]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F9F9F9]/70 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {(apiUsage.reduce((sum, day) => sum + day.successful, 0) / 
                  apiUsage.reduce((sum, day) => sum + day.requests, 1) * 100).toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-[#43AA8B]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1B263B] border-[#43AA8B]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F9F9F9]/70 text-sm">Avg Response</p>
              <p className="text-2xl font-bold text-white">
                {(apiUsage.reduce((sum, day) => sum + day.avg_response_time, 0) / apiUsage.length).toFixed(0)}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-[#F4D35E]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1B263B] border-[#43AA8B]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F9F9F9]/70 text-sm">Failed Requests</p>
              <p className="text-2xl font-bold text-white">
                {apiUsage.reduce((sum, day) => sum + day.failed, 0)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-[#EE964B]" />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white">Daily Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiUsage.map(day => (
            <div key={day.date} className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg">
              <div className="text-white font-medium">
                {new Date(day.date).toLocaleDateString()}
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-[#43AA8B]">{day.successful} successful</div>
                <div className="text-[#EE964B]">{day.failed} failed</div>
                <div className="text-[#F9F9F9]/70">{day.avg_response_time}ms avg</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Integration Docs Tab Component
const IntegrationDocsTab: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-white">Integration Documentation</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-[#1B263B] border-[#43AA8B]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-2">1. Get your API key</h4>
            <p className="text-[#F9F9F9]/70 text-sm">Create an API key in the API Keys tab</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">2. Make your first request</h4>
            <code className="block bg-[#0D1B2A] p-3 rounded text-sm text-[#F9F9F9]/90">
              curl -X POST https://api.haritahive.com/v1/workflows/run \<br/>
              &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br/>
              &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
              &nbsp;&nbsp;-d '{`{"workflow_id": "crop-health-monitoring"}`}'
            </code>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1B263B] border-[#43AA8B]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <code className="text-[#43AA8B]">POST /v1/workflows/run</code>
            <span className="text-xs text-[#F9F9F9]/70">Execute workflow</span>
          </div>
          <div className="flex justify-between items-center">
            <code className="text-[#43AA8B]">GET /v1/jobs/{`{id}`}</code>
            <span className="text-xs text-[#F9F9F9]/70">Get job status</span>
          </div>
          <div className="flex justify-between items-center">
            <code className="text-[#43AA8B]">GET /v1/results/{`{id}`}</code>
            <span className="text-xs text-[#F9F9F9]/70">Download results</span>
          </div>
          <div className="flex justify-between items-center">
            <code className="text-[#43AA8B]">GET /v1/workflows</code>
            <span className="text-xs text-[#F9F9F9]/70">List workflows</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white">Example Response</CardTitle>
      </CardHeader>
      <CardContent>
        <code className="block bg-[#0D1B2A] p-4 rounded text-sm text-[#F9F9F9]/90 whitespace-pre-wrap">
{`{
  "job_id": "job_abc123",
  "status": "running",
  "workflow_id": "crop-health-monitoring",
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_completion": "2024-01-15T10:45:00Z",
  "progress": 35,
  "webhook_url": null
}`}
        </code>
      </CardContent>
    </Card>

    <div className="flex gap-4">
      <Button 
        onClick={() => window.open('/docs/api', '_blank')}
        className="bg-[#43AA8B] hover:bg-[#43AA8B]/90"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Full API Documentation
      </Button>
      <Button 
        onClick={() => window.open('/docs/sdk', '_blank')}
        variant="outline"
        className="border-[#F4D35E]/20 text-[#F4D35E] hover:bg-[#F4D35E]/10"
      >
        <Download className="h-4 w-4 mr-2" />
        Download SDK
      </Button>
    </div>
  </div>
);

export default EnterpriseAPIManager;