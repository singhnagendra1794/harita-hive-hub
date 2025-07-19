import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Radio, 
  Activity, 
  Users, 
  Globe, 
  Database, 
  Wifi, 
  Settings,
  Play,
  Pause,
  Square,
  BarChart3,
  MapPin,
  Layers,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealTimeStreamingProps {
  projectId: string;
}

const RealTimeStreaming: React.FC<RealTimeStreamingProps> = ({ projectId }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConnections, setActiveConnections] = useState(0);
  const [dataThroughput, setDataThroughput] = useState(0);
  const [streamConfig, setStreamConfig] = useState({
    protocol: 'websocket',
    compression: true,
    batchSize: 100,
    updateInterval: 1000,
    enableFiltering: true,
    maxConnections: 1000
  });
  const { toast } = useToast();

  const protocols = [
    { id: 'websocket', name: 'WebSocket', icon: Wifi, latency: '< 10ms' },
    { id: 'sse', name: 'Server-Sent Events', icon: Radio, latency: '< 50ms' },
    { id: 'webrtc', name: 'WebRTC', icon: Activity, latency: '< 5ms' },
    { id: 'mqtt', name: 'MQTT', icon: Globe, latency: '< 20ms' }
  ];

  const dataSources = [
    {
      id: 'gps-tracking',
      name: 'GPS Vehicle Tracking',
      icon: MapPin,
      status: isStreaming ? 'active' : 'inactive',
      frequency: '1 Hz',
      dataPoints: 247
    },
    {
      id: 'sensor-network',
      name: 'Environmental Sensors',
      icon: Activity,
      status: isStreaming ? 'active' : 'inactive',
      frequency: '0.1 Hz',
      dataPoints: 89
    },
    {
      id: 'weather-stations',
      name: 'Weather Stations',
      icon: Database,
      status: 'active',
      frequency: '0.01 Hz',
      dataPoints: 56
    },
    {
      id: 'satellite-feeds',
      name: 'Satellite Data Feeds',
      icon: Layers,
      status: 'inactive',
      frequency: '0.001 Hz',
      dataPoints: 12
    }
  ];

  const metrics = [
    { label: 'Active Connections', value: activeConnections, unit: 'clients' },
    { label: 'Data Throughput', value: dataThroughput, unit: 'MB/s' },
    { label: 'Latency', value: 8.2, unit: 'ms' },
    { label: 'Success Rate', value: 99.7, unit: '%' }
  ];

  // Simulate real-time metrics
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setActiveConnections(prev => Math.max(0, prev + Math.floor(Math.random() * 10 - 5)));
        setDataThroughput(prev => Math.max(0, prev + (Math.random() - 0.5) * 2));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  const handleStartStreaming = () => {
    setIsStreaming(true);
    setActiveConnections(Math.floor(Math.random() * 50) + 10);
    setDataThroughput(Math.random() * 5 + 2);
    toast({
      title: "Real-time Streaming Started",
      description: "Live data feeds are now active.",
    });
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    setActiveConnections(0);
    setDataThroughput(0);
    toast({
      title: "Streaming Stopped",
      description: "All data feeds have been paused.",
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setStreamConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Real-time Data Streaming</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live data feeds and real-time collaboration
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isStreaming ? "destructive" : "default"}
                onClick={isStreaming ? handleStopStreaming : handleStartStreaming}
                className="gap-2"
              >
                {isStreaming ? (
                  <>
                    <Square className="h-4 w-4" />
                    Stop Streaming
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Streaming
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                    <Badge variant={isStreaming ? "default" : "secondary"}>
                      {isStreaming ? "Live" : "Offline"}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(1)} {metric.unit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Protocol Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {protocols.map((protocol) => {
                  const IconComponent = protocol.icon;
                  const isSelected = streamConfig.protocol === protocol.id;
                  
                  return (
                    <div
                      key={protocol.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => handleConfigChange('protocol', protocol.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <div>
                            <span className="font-medium">{protocol.name}</span>
                            <p className="text-sm text-muted-foreground">
                              Latency: {protocol.latency}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Health</span>
                    <Badge variant={isStreaming ? "default" : "secondary"}>
                      {isStreaming ? "Healthy" : "Disconnected"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Streams</span>
                      <span>{isStreaming ? dataSources.filter(s => s.status === 'active').length : 0}/4</span>
                    </div>
                    <Progress 
                      value={isStreaming ? (dataSources.filter(s => s.status === 'active').length / 4) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Buffer Usage</span>
                      <span>{isStreaming ? Math.floor(Math.random() * 40 + 30) : 0}%</span>
                    </div>
                    <Progress 
                      value={isStreaming ? Math.floor(Math.random() * 40 + 30) : 0} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure and monitor real-time data sources
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map((source) => {
                  const IconComponent = source.icon;
                  const isActive = source.status === 'active';
                  
                  return (
                    <div key={source.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <div>
                            <h4 className="font-semibold">{source.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {source.frequency} • {source.dataPoints} points
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? (
                              <>
                                <Activity className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              "Inactive"
                            )}
                          </Badge>
                          <Switch
                            checked={isActive}
                            disabled={!isStreaming}
                            onCheckedChange={(checked) => {
                              // Handle source toggle
                              toast({
                                title: `${source.name} ${checked ? 'Enabled' : 'Disabled'}`,
                                description: `Data source has been ${checked ? 'activated' : 'deactivated'}.`,
                              });
                            }}
                          />
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="bg-muted/50 rounded p-2 text-xs">
                          <div className="flex justify-between">
                            <span>Last Update:</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stream Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={streamConfig.batchSize}
                    onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="update-interval">Update Interval (ms)</Label>
                  <Input
                    id="update-interval"
                    type="number"
                    value={streamConfig.updateInterval}
                    onChange={(e) => handleConfigChange('updateInterval', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-connections">Max Connections</Label>
                  <Input
                    id="max-connections"
                    type="number"
                    value={streamConfig.maxConnections}
                    onChange={(e) => handleConfigChange('maxConnections', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compression">Data Compression</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce bandwidth usage
                    </p>
                  </div>
                  <Switch
                    id="compression"
                    checked={streamConfig.compression}
                    onCheckedChange={(checked) => handleConfigChange('compression', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="filtering">Real-time Filtering</Label>
                    <p className="text-sm text-muted-foreground">
                      Filter data at source
                    </p>
                  </div>
                  <Switch
                    id="filtering"
                    checked={streamConfig.enableFiltering}
                    onCheckedChange={(checked) => handleConfigChange('enableFiltering', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Performance metrics and usage statistics
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Real-time analytics dashboard would be rendered here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing throughput, latency, and connection metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeStreaming;