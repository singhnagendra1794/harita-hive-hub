import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Tablet, 
  Download, 
  Code, 
  Play, 
  Settings, 
  Apple,
  Android,
  Wifi,
  MapPin,
  Camera,
  Bell,
  Globe,
  Share2,
  Zap,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileSDKGeneratorProps {
  projectId: string;
}

const MobileSDKGenerator: React.FC<MobileSDKGeneratorProps> = ({ projectId }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'both'>('both');
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [appConfig, setAppConfig] = useState({
    appName: 'WebGIS Mobile',
    bundleId: 'com.webgis.mobile',
    version: '1.0.0',
    description: 'Advanced WebGIS Mobile Application',
    enableOffline: true,
    enableGPS: true,
    enableCamera: true,
    enableNotifications: true,
    customSplash: true
  });
  const { toast } = useToast();

  const features = [
    {
      id: 'maps',
      name: 'Interactive Maps',
      description: 'Full-featured mapping with offline support',
      icon: MapPin,
      included: true,
      essential: true
    },
    {
      id: 'gps',
      name: 'GPS Tracking',
      description: 'Real-time location tracking and navigation',
      icon: Wifi,
      included: appConfig.enableGPS,
      essential: false
    },
    {
      id: 'camera',
      name: 'Camera Integration',
      description: 'Photo capture for field data collection',
      icon: Camera,
      included: appConfig.enableCamera,
      essential: false
    },
    {
      id: 'offline',
      name: 'Offline Mode',
      description: 'Work without internet connectivity',
      icon: Download,
      included: appConfig.enableOffline,
      essential: false
    },
    {
      id: 'push',
      name: 'Push Notifications',
      description: 'Real-time alerts and updates',
      icon: Bell,
      included: appConfig.enableNotifications,
      essential: false
    },
    {
      id: 'sharing',
      name: 'Data Sharing',
      description: 'Share maps and data with other apps',
      icon: Share2,
      included: true,
      essential: true
    }
  ];

  const platformInfo = {
    ios: {
      name: 'iOS',
      icon: Apple,
      color: 'text-gray-800',
      requirements: ['macOS', 'Xcode 15+', 'iOS 14+ target'],
      buildTime: '8-12 minutes'
    },
    android: {
      name: 'Android',
      icon: Android,
      color: 'text-green-600',
      requirements: ['Android Studio', 'Android SDK 24+', 'Java 11+'],
      buildTime: '5-8 minutes'
    }
  };

  const buildSteps = [
    'Configuring project settings',
    'Installing native dependencies',
    'Generating platform-specific code',
    'Building native application',
    'Creating distribution package',
    'Finalizing build artifacts'
  ];

  const handleBuildApp = async () => {
    setIsBuilding(true);
    setBuildProgress(0);

    // Simulate build process
    for (let i = 0; i < buildSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBuildProgress(((i + 1) / buildSteps.length) * 100);
    }

    setIsBuilding(false);
    toast({
      title: "Mobile App Built Successfully!",
      description: `Your ${selectedPlatform} app is ready for deployment.`,
    });
  };

  const handleTestApp = () => {
    toast({
      title: "Test Launch",
      description: "Opening app in device simulator...",
    });
  };

  const currentStep = Math.floor((buildProgress / 100) * buildSteps.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Mobile SDK Generator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate native iOS and Android apps from your WebGIS project
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="build">Build & Deploy</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">App Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">App Name</Label>
                  <Input
                    id="app-name"
                    value={appConfig.appName}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, appName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bundle-id">Bundle ID</Label>
                  <Input
                    id="bundle-id"
                    value={appConfig.bundleId}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, bundleId: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={appConfig.version}
                      onChange={(e) => setAppConfig(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Target Platform</Label>
                    <Select value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ios">iOS Only</SelectItem>
                        <SelectItem value="android">Android Only</SelectItem>
                        <SelectItem value="both">Both Platforms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">App Description</Label>
                  <Textarea
                    id="description"
                    value={appConfig.description}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(selectedPlatform === 'both' ? ['ios', 'android'] : [selectedPlatform]).map((platform) => {
                    const info = platformInfo[platform as keyof typeof platformInfo];
                    const IconComponent = info.icon;
                    
                    return (
                      <div key={platform} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className={`h-6 w-6 ${info.color}`} />
                          <h4 className="font-semibold">{info.name}</h4>
                          <Badge variant="outline">Build time: {info.buildTime}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Requirements:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {info.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Native Features</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure which native device features to include in your mobile app
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{feature.name}</span>
                            {feature.essential && (
                              <Badge variant="outline" className="text-xs">Essential</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={feature.included}
                        disabled={feature.essential}
                        onCheckedChange={(checked) => {
                          if (feature.id === 'gps') {
                            setAppConfig(prev => ({ ...prev, enableGPS: checked }));
                          } else if (feature.id === 'camera') {
                            setAppConfig(prev => ({ ...prev, enableCamera: checked }));
                          } else if (feature.id === 'offline') {
                            setAppConfig(prev => ({ ...prev, enableOffline: checked }));
                          } else if (feature.id === 'push') {
                            setAppConfig(prev => ({ ...prev, enableNotifications: checked }));
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build & Deploy Tab */}
        <TabsContent value="build" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Build Mobile App</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate and build your native mobile application
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestApp}
                    disabled={isBuilding}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test App
                  </Button>
                  <Button
                    onClick={handleBuildApp}
                    disabled={isBuilding}
                    className="gap-2"
                  >
                    {isBuilding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Build App
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isBuilding && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Build Progress</span>
                      <span className="text-sm text-muted-foreground">{Math.round(buildProgress)}%</span>
                    </div>
                    <Progress value={buildProgress} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Step:</p>
                    <div className="space-y-1">
                      {buildSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {index < currentStep ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : index === currentStep ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {!isBuilding && buildProgress === 100 && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <h4 className="font-semibold text-green-700 dark:text-green-300">
                      Build Completed Successfully!
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your mobile app has been built and is ready for deployment.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download APK
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Deploy to Store
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {!isBuilding && buildProgress === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Click "Build App" to start generating your mobile application</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preview how your app will look and feel on mobile devices
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Device Preview</h4>
                  <div className="relative mx-auto w-64 h-96 bg-gray-900 rounded-[2rem] p-2">
                    <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                      <div className="h-8 bg-primary flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{appConfig.appName}</span>
                      </div>
                      <div className="p-4 h-full bg-gradient-to-b from-blue-50 to-green-50">
                        <div className="space-y-3">
                          <div className="h-32 bg-primary/20 rounded-lg flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-16 bg-white rounded border"></div>
                            <div className="h-16 bg-white rounded border"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">App Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">App Name:</span>
                      <span className="text-sm font-medium">{appConfig.appName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Version:</span>
                      <span className="text-sm font-medium">{appConfig.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Platform:</span>
                      <span className="text-sm font-medium capitalize">{selectedPlatform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Features:</span>
                      <span className="text-sm font-medium">{features.filter(f => f.included).length}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h5 className="font-medium">Included Features:</h5>
                    <div className="space-y-1">
                      {features.filter(f => f.included).map((feature) => (
                        <div key={feature.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileSDKGenerator;