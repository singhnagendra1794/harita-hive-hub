import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Cloud, Layers, Settings, CheckCircle, AlertTriangle } from 'lucide-react';

const EnterpriseDataIntegration = () => {
  const [connections, setConnections] = useState([
    { id: 1, name: 'Production PostGIS', type: 'PostGIS', status: 'connected', host: 'prod-postgis.company.com' },
    { id: 2, name: 'Oracle Spatial', type: 'Oracle', status: 'connecting', host: 'oracle-spatial.internal' },
    { id: 3, name: 'ESRI Enterprise', type: 'ArcGIS', status: 'error', host: 'arcgis.company.com' },
  ]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Enterprise Data Integration</h1>
          <p className="text-xl text-muted-foreground">
            Connect and manage enterprise spatial databases and services
          </p>
          <Badge variant="secondary" className="mt-2">Enterprise Only</Badge>
        </div>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connections">Data Sources</TabsTrigger>
            <TabsTrigger value="databases">Databases</TabsTrigger>
            <TabsTrigger value="services">Web Services</TabsTrigger>
            <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Add New Connection
                  </CardTitle>
                  <CardDescription>Connect to enterprise databases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="connection-name">Connection Name</Label>
                    <Input id="connection-name" placeholder="Production Database" />
                  </div>
                  <div>
                    <Label htmlFor="host">Host</Label>
                    <Input id="host" placeholder="database.company.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="port">Port</Label>
                      <Input id="port" placeholder="5432" />
                    </div>
                    <div>
                      <Label htmlFor="database">Database</Label>
                      <Input id="database" placeholder="spatial_db" />
                    </div>
                  </div>
                  <Button className="w-full">Test Connection</Button>
                </CardContent>
              </Card>

              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {connection.name}
                      </span>
                      {connection.status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {connection.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <CardDescription>{connection.type} • {connection.host}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={connection.status === 'connected' ? 'default' : connection.status === 'error' ? 'destructive' : 'secondary'}>
                      {connection.status}
                    </Badge>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" size="sm" className="w-full">Configure</Button>
                      <Button variant="outline" size="sm" className="w-full">Test Connection</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="databases" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Oracle Spatial
                  </CardTitle>
                  <CardDescription>Enterprise Oracle Database with Spatial Extensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input placeholder="ORCL.company.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Username</Label>
                      <Input placeholder="spatial_user" />
                    </div>
                    <div>
                      <Label>Schema</Label>
                      <Input placeholder="SPATIAL_DATA" />
                    </div>
                  </div>
                  <Button>Connect Oracle Spatial</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    PostGIS
                  </CardTitle>
                  <CardDescription>PostgreSQL with PostGIS Extensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Connection String</Label>
                    <Input placeholder="postgresql://user:pass@host:5432/dbname" />
                  </div>
                  <div>
                    <Label>SSL Mode</Label>
                    <select className="w-full p-2 border rounded">
                      <option>require</option>
                      <option>prefer</option>
                      <option>disable</option>
                    </select>
                  </div>
                  <Button>Connect PostGIS</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    ESRI Geodatabase
                  </CardTitle>
                  <CardDescription>Enterprise ArcGIS Server Geodatabase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Server URL</Label>
                    <Input placeholder="https://arcgis.company.com/server" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Service</Label>
                      <Input placeholder="SpatialData/FeatureServer" />
                    </div>
                    <div>
                      <Label>Token</Label>
                      <Input type="password" placeholder="ArcGIS Token" />
                    </div>
                  </div>
                  <Button>Connect ESRI Server</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    GeoServer
                  </CardTitle>
                  <CardDescription>Open Source GeoServer Instance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>GeoServer URL</Label>
                    <Input placeholder="https://geoserver.company.com/geoserver" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Workspace</Label>
                      <Input placeholder="company_data" />
                    </div>
                    <div>
                      <Label>Basic Auth</Label>
                      <Input type="password" placeholder="user:password" />
                    </div>
                  </div>
                  <Button>Connect GeoServer</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>WMS Services</CardTitle>
                  <CardDescription>Web Map Service endpoints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>WMS URL</Label>
                    <Input placeholder="https://server.com/wms?service=WMS&version=1.3.0" />
                  </div>
                  <Button>Add WMS Service</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WFS Services</CardTitle>
                  <CardDescription>Web Feature Service endpoints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>WFS URL</Label>
                    <Input placeholder="https://server.com/wfs?service=WFS&version=2.0.0" />
                  </div>
                  <Button>Add WFS Service</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    AWS S3
                  </CardTitle>
                  <CardDescription>Amazon S3 Spatial Data Storage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bucket Name</Label>
                    <Input placeholder="company-spatial-data" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Access Key</Label>
                      <Input placeholder="AKIA..." />
                    </div>
                    <div>
                      <Label>Region</Label>
                      <Input placeholder="us-west-2" />
                    </div>
                  </div>
                  <Button>Connect S3</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Azure Blob
                  </CardTitle>
                  <CardDescription>Microsoft Azure Blob Storage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Storage Account</Label>
                    <Input placeholder="companystorage" />
                  </div>
                  <div>
                    <Label>Container</Label>
                    <Input placeholder="spatial-data" />
                  </div>
                  <Button>Connect Azure</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Google Cloud
                  </CardTitle>
                  <CardDescription>Google Cloud Storage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Project ID</Label>
                    <Input placeholder="company-gis-project" />
                  </div>
                  <div>
                    <Label>Bucket Name</Label>
                    <Input placeholder="spatial-data-bucket" />
                  </div>
                  <Button>Connect GCS</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EnterpriseDataIntegration;