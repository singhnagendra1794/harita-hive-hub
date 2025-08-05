import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Network, Wifi, Database, Cloud, Zap, Settings, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface IoTSensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  last_reading: string;
  value: number;
  unit: string;
  battery_level?: number;
}

interface ExternalSystem {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  endpoint: string;
  last_sync: string;
  data_flow: 'inbound' | 'outbound' | 'bidirectional';
}

interface DataStream {
  id: string;
  name: string;
  source: string;
  frequency: string;
  status: 'active' | 'paused' | 'error';
  records_processed: number;
  last_update: string;
}

const CrossPlatformIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('iot-sensors');
  const [iotSensors, setIoTSensors] = useState<IoTSensor[]>([]);
  const [externalSystems, setExternalSystems] = useState<ExternalSystem[]>([]);
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);
  const [newEndpoint, setNewEndpoint] = useState('');

  useEffect(() => {
    // Mock IoT sensors data
    setIoTSensors([
      {
        id: '1',
        name: 'Weather Station Alpha',
        type: 'Weather',
        location: 'Downtown District',
        status: 'online',
        last_reading: '2024-01-23T10:15:00Z',
        value: 22.5,
        unit: '°C',
        battery_level: 85
      },
      {
        id: '2',
        name: 'River Gauge Station 1',
        type: 'Water Level',
        location: 'Riverside Park',
        status: 'online',
        last_reading: '2024-01-23T10:10:00Z',
        value: 3.2,
        unit: 'meters',
        battery_level: 92
      },
      {
        id: '3',
        name: 'Air Quality Monitor',
        type: 'Air Quality',
        location: 'Industrial Zone',
        status: 'error',
        last_reading: '2024-01-23T09:45:00Z',
        value: 156,
        unit: 'AQI',
        battery_level: 45
      },
      {
        id: '4',
        name: 'Soil Moisture Sensor Array',
        type: 'Agriculture',
        location: 'Farm District East',
        status: 'online',
        last_reading: '2024-01-23T10:12:00Z',
        value: 68,
        unit: '%',
        battery_level: 78
      }
    ]);

    // Mock external systems
    setExternalSystems([
      {
        id: '1',
        name: 'City Management Dashboard',
        type: 'Municipal System',
        status: 'connected',
        description: 'Real-time city operations dashboard',
        endpoint: 'https://api.city.gov/dashboard',
        last_sync: '2024-01-23T10:05:00Z',
        data_flow: 'outbound'
      },
      {
        id: '2',
        name: 'Agricultural ERP System',
        type: 'Farm Management',
        status: 'connected',
        description: 'Comprehensive farm resource planning',
        endpoint: 'https://api.farmtech.com/erp',
        last_sync: '2024-01-23T10:08:00Z',
        data_flow: 'bidirectional'
      },
      {
        id: '3',
        name: 'Emergency Command Center',
        type: 'Disaster Management',
        status: 'connected',
        description: 'Emergency response coordination system',
        endpoint: 'https://api.emergency.gov/command',
        last_sync: '2024-01-23T10:01:00Z',
        data_flow: 'outbound'
      },
      {
        id: '4',
        name: 'Weather Service API',
        type: 'Meteorological',
        status: 'disconnected',
        description: 'National weather service data feed',
        endpoint: 'https://api.weather.gov/forecast',
        last_sync: '2024-01-23T08:30:00Z',
        data_flow: 'inbound'
      }
    ]);

    // Mock data streams
    setDataStreams([
      {
        id: '1',
        name: 'Real-time Weather Data',
        source: 'Weather Station Network',
        frequency: 'Every 5 minutes',
        status: 'active',
        records_processed: 15420,
        last_update: '2024-01-23T10:15:00Z'
      },
      {
        id: '2',
        name: 'Satellite Imagery Feed',
        source: 'Earth Observation Satellites',
        frequency: 'Every 6 hours',
        status: 'active',
        records_processed: 892,
        last_update: '2024-01-23T08:00:00Z'
      },
      {
        id: '3',
        name: 'Traffic Flow Analytics',
        source: 'Smart Traffic Cameras',
        frequency: 'Every 2 minutes',
        status: 'active',
        records_processed: 35680,
        last_update: '2024-01-23T10:14:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'offline':
      case 'disconnected':
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const connectSystem = async (endpoint: string) => {
    try {
      toast({
        title: "Connecting System",
        description: "Establishing connection to external system..."
      });

      // Simulate connection process
      setTimeout(() => {
        toast({
          title: "System Connected",
          description: "External system has been successfully integrated."
        });
        setNewEndpoint('');
      }, 2000);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to external system.",
        variant: "destructive"
      });
    }
  };

  const toggleDataStream = async (streamId: string) => {
    try {
      setDataStreams(prev => 
        prev.map(stream => 
          stream.id === streamId 
            ? { ...stream, status: stream.status === 'active' ? 'paused' as const : 'active' as const }
            : stream
        )
      );
      
      toast({
        title: "Stream Updated",
        description: "Data stream status has been updated."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update data stream status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cross-Platform Integration</h1>
          <p className="text-muted-foreground">
            Connect IoT sensors, external systems, and real-time data streams
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Integration Settings
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium">IoT Sensors</p>
                <p className="text-2xl font-bold">{iotSensors.filter(s => s.status === 'online').length}/{iotSensors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium">Connected Systems</p>
                <p className="text-2xl font-bold">{externalSystems.filter(s => s.status === 'connected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium">Active Streams</p>
                <p className="text-2xl font-bold">{dataStreams.filter(s => s.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium">Data Points/Hour</p>
                <p className="text-2xl font-bold">25.6K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="iot-sensors">IoT Sensors</TabsTrigger>
          <TabsTrigger value="external-systems">External Systems</TabsTrigger>
          <TabsTrigger value="data-streams">Data Streams</TabsTrigger>
          <TabsTrigger value="real-time">Real-time Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="iot-sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {iotSensors.map((sensor) => (
              <Card key={sensor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-lg">{sensor.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(sensor.status)}>
                      {getStatusIcon(sensor.status)}
                      <span className="ml-1">{sensor.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                  <CardDescription>{sensor.type} • {sensor.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Current Reading</p>
                      <p className="text-2xl font-bold">{sensor.value} {sensor.unit}</p>
                    </div>
                    {sensor.battery_level && (
                      <div>
                        <p className="text-sm font-medium">Battery Level</p>
                        <p className="text-lg font-semibold text-green-400">{sensor.battery_level}%</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last reading: {new Date(sensor.last_reading).toLocaleString()}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-1" />
                      View Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="external-systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New External System</CardTitle>
              <CardDescription>Connect to external APIs and systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter API endpoint URL..."
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => connectSystem(newEndpoint)}
                  disabled={!newEndpoint}
                >
                  <Network className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {externalSystems.map((system) => (
              <Card key={system.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="h-5 w-5 text-green-400" />
                      <div>
                        <CardTitle className="text-lg">{system.name}</CardTitle>
                        <CardDescription>{system.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{system.data_flow}</Badge>
                      <Badge className={getStatusColor(system.status)}>
                        {getStatusIcon(system.status)}
                        <span className="ml-1">{system.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">System Type</p>
                      <p className="text-muted-foreground">{system.type}</p>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <p className="text-muted-foreground font-mono text-xs">{system.endpoint}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last sync: {new Date(system.last_sync).toLocaleString()}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-1" />
                      Test Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data-streams" className="space-y-4">
          <div className="space-y-4">
            {dataStreams.map((stream) => (
              <Card key={stream.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-purple-400" />
                      <div>
                        <CardTitle className="text-lg">{stream.name}</CardTitle>
                        <CardDescription>Source: {stream.source}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(stream.status)}>
                        {getStatusIcon(stream.status)}
                        <span className="ml-1">{stream.status.toUpperCase()}</span>
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDataStream(stream.id)}
                      >
                        {stream.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Update Frequency</p>
                      <p className="text-muted-foreground">{stream.frequency}</p>
                    </div>
                    <div>
                      <p className="font-medium">Records Processed</p>
                      <p className="text-muted-foreground">{stream.records_processed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Update</p>
                      <p className="text-muted-foreground">{new Date(stream.last_update).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="real-time">
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Real-time Data Monitor</p>
              <p className="text-muted-foreground">Live visualization of all connected data streams</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrossPlatformIntegration;