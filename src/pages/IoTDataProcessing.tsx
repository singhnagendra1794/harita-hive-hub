import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  MapPin, 
  Zap, 
  Truck, 
  Thermometer, 
  Droplets, 
  Wind, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Settings,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const IoTDataProcessing = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('2024-01-15 14:30:00');

  const sensorData = [
    { id: 1, name: 'Fleet Tracker 001', type: 'GPS', status: 'active', location: 'Mumbai, India', lastReading: '2 min ago' },
    { id: 2, name: 'Air Quality Station', type: 'Environmental', status: 'active', location: 'Delhi, India', lastReading: '30 sec ago' },
    { id: 3, name: 'Water Level Sensor', type: 'Hydrology', status: 'warning', location: 'Bangalore, India', lastReading: '5 min ago' },
    { id: 4, name: 'Temperature Monitor', type: 'Weather', status: 'active', location: 'Chennai, India', lastReading: '1 min ago' },
  ];

  const fleetVehicles = [
    { id: 'TRK001', driver: 'Raj Kumar', location: 'Mumbai-Pune Highway', speed: '65 km/h', fuel: '80%', status: 'moving' },
    { id: 'TRK002', driver: 'Amit Singh', location: 'Delhi NCR', speed: '0 km/h', fuel: '45%', status: 'stopped' },
    { id: 'TRK003', driver: 'Priya Sharma', location: 'Bangalore City', speed: '40 km/h', fuel: '90%', status: 'moving' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real-Time IoT Data Processing</h1>
          <p className="text-xl text-muted-foreground">
            Ingest, process, and visualize live sensor data with temporal playback
          </p>
          <Badge variant="secondary" className="mt-2">Enterprise Only</Badge>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Tracking</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="playback">Time Playback</TabsTrigger>
            <TabsTrigger value="configure">Configure</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">248</div>
                  <p className="text-xs text-muted-foreground">+12 from last hour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Points/min</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">Real-time ingestion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fleet Vehicles</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">35</div>
                  <p className="text-xs text-muted-foreground">28 active, 7 parked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 warning, 1 critical</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Sensor Feed</CardTitle>
                  <CardDescription>Real-time data from connected sensors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sensorData.map((sensor) => (
                      <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${sensor.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="font-medium">{sensor.name}</p>
                            <p className="text-sm text-muted-foreground">{sensor.type} • {sensor.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{sensor.lastReading}</p>
                          <Badge variant={sensor.status === 'active' ? 'default' : 'secondary'}>
                            {sensor.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Sensor locations on live map</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Interactive sensor map will load here</p>
                      <p className="text-sm text-muted-foreground">Real-time positions and data visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Fleet Management Dashboard
                </CardTitle>
                <CardDescription>Live tracking of fleet vehicles with GPS data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fleetVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant={vehicle.status === 'moving' ? 'default' : 'secondary'}>
                            {vehicle.id}
                          </Badge>
                          <div>
                            <p className="font-medium">{vehicle.driver}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{vehicle.speed}</p>
                            <p className="text-muted-foreground">Speed</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{vehicle.fuel}</p>
                            <p className="text-muted-foreground">Fuel</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${vehicle.status === 'moving' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View Route</Button>
                        <Button size="sm" variant="outline">Driver Contact</Button>
                        <Button size="sm" variant="outline">Vehicle Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Air Quality
                  </CardTitle>
                  <CardDescription>Real-time pollution monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>PM2.5</span>
                      <Badge variant="destructive">145 μg/m³</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>PM10</span>
                      <Badge variant="secondary">89 μg/m³</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>NO2</span>
                      <Badge variant="secondary">23 ppb</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AQI</span>
                      <Badge variant="destructive">Unhealthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Water Monitoring
                  </CardTitle>
                  <CardDescription>Hydrology and water quality sensors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Water Level</span>
                      <Badge variant="secondary">2.4m</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Flow Rate</span>
                      <Badge variant="default">15.2 m³/s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>pH Level</span>
                      <Badge variant="default">7.2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Turbidity</span>
                      <Badge variant="secondary">12 NTU</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Weather Stations
                  </CardTitle>
                  <CardDescription>Meteorological sensor data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Temperature</span>
                      <Badge variant="default">28°C</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Humidity</span>
                      <Badge variant="secondary">65%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Wind Speed</span>
                      <Badge variant="default">12 km/h</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pressure</span>
                      <Badge variant="secondary">1013 hPa</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="playback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time-Series Data Playback</CardTitle>
                <CardDescription>Replay historical sensor data with temporal controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center space-x-4 p-6 bg-muted/20 rounded-lg">
                  <Button variant="outline" size="sm">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={isPlaying ? "secondary" : "default"} 
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <p className="font-mono text-lg">{currentTime}</p>
                    <p className="text-sm text-muted-foreground">Current Time</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Playback Speed</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">0.5x</Button>
                      <Button variant="default" size="sm">1x</Button>
                      <Button variant="outline" size="sm">2x</Button>
                      <Button variant="outline" size="sm">5x</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Start Date</Label>
                        <Input type="date" defaultValue="2024-01-15" />
                      </div>
                      <div>
                        <Label className="text-sm">End Date</Label>
                        <Input type="date" defaultValue="2024-01-15" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Layers</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="fleet-layer" defaultChecked />
                          <Label htmlFor="fleet-layer">Fleet Tracking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="environmental-layer" defaultChecked />
                          <Label htmlFor="environmental-layer">Environmental Sensors</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="weather-layer" />
                          <Label htmlFor="weather-layer">Weather Stations</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Export Options</Label>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full">Export as Video</Button>
                        <Button variant="outline" className="w-full">Export Data Points</Button>
                        <Button variant="outline" className="w-full">Generate Report</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  IoT Configuration
                </CardTitle>
                <CardDescription>Configure data ingestion and processing settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Ingestion</h4>
                    <div className="space-y-2">
                      <Label>MQTT Broker URL</Label>
                      <Input placeholder="mqtt://broker.hivemq.com:1883" />
                    </div>
                    <div className="space-y-2">
                      <Label>Topic Pattern</Label>
                      <Input placeholder="sensors/+/data" />
                    </div>
                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Processing Rules</h4>
                    <div className="space-y-2">
                      <Label>Data Retention (Days)</Label>
                      <Input type="number" placeholder="90" />
                    </div>
                    <div className="space-y-2">
                      <Label>Alert Threshold</Label>
                      <Input placeholder="PM2.5 > 100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Email</Label>
                      <Input type="email" placeholder="alerts@company.com" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">API Endpoints</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">REST API</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <code className="text-sm bg-muted p-2 rounded block">
                          POST /api/v1/sensors/data
                        </code>
                        <p className="text-sm text-muted-foreground mt-2">
                          Submit sensor data via HTTP
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">WebSocket</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <code className="text-sm bg-muted p-2 rounded block">
                          wss://api.haritahive.com/sensors
                        </code>
                        <p className="text-sm text-muted-foreground mt-2">
                          Real-time streaming connection
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button>Save Configuration</Button>
                  <Button variant="outline">Test Connection</Button>
                  <Button variant="outline">View Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IoTDataProcessing;