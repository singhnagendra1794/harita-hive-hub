import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Sprout, AlertTriangle, Leaf, Download, Play, Settings, Star, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface IndustryPack {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  tier: 'Free' | 'Pro' | 'Enterprise';
  models: number;
  templates: number;
  datasets: number;
  rating: number;
  users: number;
  isInstalled: boolean;
  features: string[];
  useCases: string[];
  color: string;
}

const IndustryIntelligencePacks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const industryPacks: IndustryPack[] = [
    {
      id: 'urban-development',
      name: 'Urban Development Intelligence',
      category: 'planning',
      description: 'Smart city planning and urban growth analysis',
      longDescription: 'Comprehensive urban planning toolkit with AI-powered zoning recommendations, traffic flow optimization, and sustainable development insights.',
      icon: <Building2 className="h-8 w-8" />,
      tier: 'Pro',
      models: 15,
      templates: 8,
      datasets: 12,
      rating: 4.8,
      users: 1250,
      isInstalled: false,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      features: [
        'Smart Zoning Recommendations',
        'Traffic Flow Simulation',
        'Urban Growth Forecasting',
        'Population Density Analysis',
        'Infrastructure Impact Assessment',
        'Green Space Optimization'
      ],
      useCases: [
        'City Master Planning',
        'Transit Route Optimization',
        'Housing Development Analysis',
        'Environmental Impact Studies'
      ]
    },
    {
      id: 'agriculture-intelligence',
      name: 'Agriculture Intelligence',
      category: 'agriculture',
      description: 'Precision farming and crop optimization suite',
      longDescription: 'Advanced agricultural analytics combining satellite imagery, IoT sensors, and AI models for optimal crop management and yield prediction.',
      icon: <Sprout className="h-8 w-8" />,
      tier: 'Pro',
      models: 12,
      templates: 10,
      datasets: 15,
      rating: 4.9,
      users: 890,
      isInstalled: true,
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      features: [
        'Crop Yield Prediction',
        'Soil Health Monitoring',
        'Water Usage Optimization',
        'Pest & Disease Detection',
        'Weather Pattern Analysis',
        'Harvest Timing Optimization'
      ],
      useCases: [
        'Precision Agriculture',
        'Irrigation Management',
        'Crop Insurance Assessment',
        'Supply Chain Planning'
      ]
    },
    {
      id: 'disaster-management',
      name: 'Disaster Management',
      category: 'emergency',
      description: 'Real-time hazard detection and emergency response',
      longDescription: 'Comprehensive disaster preparedness and response system with real-time monitoring, predictive modeling, and automated alert systems.',
      icon: <AlertTriangle className="h-8 w-8" />,
      tier: 'Enterprise',
      models: 18,
      templates: 6,
      datasets: 20,
      rating: 4.7,
      users: 450,
      isInstalled: false,
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      features: [
        'Flood Risk Assessment',
        'Wildfire Spread Modeling',
        'Earthquake Impact Analysis',
        'Evacuation Route Planning',
        'Resource Allocation Optimization',
        'Real-time Alert Systems'
      ],
      useCases: [
        'Emergency Response Planning',
        'Risk Assessment Studies',
        'Insurance Claims Processing',
        'Public Safety Management'
      ]
    },
    {
      id: 'climate-esg',
      name: 'Climate & ESG Intelligence',
      category: 'environment',
      description: 'Carbon accounting and climate risk analysis',
      longDescription: 'Environmental, Social, and Governance analytics with carbon footprint tracking, climate risk assessment, and sustainability reporting.',
      icon: <Leaf className="h-8 w-8" />,
      tier: 'Enterprise',
      models: 10,
      templates: 12,
      datasets: 18,
      rating: 4.6,
      users: 320,
      isInstalled: false,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      features: [
        'Carbon Footprint Tracking',
        'Climate Risk Scoring',
        'Biodiversity Impact Assessment',
        'ESG Compliance Reporting',
        'Renewable Energy Analysis',
        'Sustainability Metrics'
      ],
      useCases: [
        'Corporate ESG Reporting',
        'Climate Risk Assessment',
        'Carbon Trading',
        'Sustainable Investment Analysis'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Packs', count: industryPacks.length },
    { id: 'planning', name: 'Urban Planning', count: industryPacks.filter(p => p.category === 'planning').length },
    { id: 'agriculture', name: 'Agriculture', count: industryPacks.filter(p => p.category === 'agriculture').length },
    { id: 'emergency', name: 'Emergency', count: industryPacks.filter(p => p.category === 'emergency').length },
    { id: 'environment', name: 'Environment', count: industryPacks.filter(p => p.category === 'environment').length }
  ];

  const filteredPacks = activeCategory === 'all' 
    ? industryPacks 
    : industryPacks.filter(pack => pack.category === activeCategory);

  const installPack = async (packId: string) => {
    try {
      // Simulate installation process
      toast({
        title: "Installing Pack",
        description: "Installing industry intelligence pack and dependencies..."
      });

      // Add to installed packs
      setInstalledPacks(prev => [...prev, packId]);
      
      toast({
        title: "Pack Installed",
        description: "Industry pack installed successfully. You can now access its models and templates."
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Failed to install industry pack. Please try again.",
        variant: "destructive"
      });
    }
  };

  const launchPack = (packId: string) => {
    toast({
      title: "Launching Pack",
      description: "Opening industry intelligence workspace..."
    });
  };

  const PackCard = ({ pack }: { pack: IndustryPack }) => (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      selectedPack === pack.id ? 'ring-2 ring-primary' : ''
    } ${pack.isInstalled || installedPacks.includes(pack.id) ? 'border-green-500/30' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${pack.color}`}>
              {pack.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{pack.name}</CardTitle>
              <CardDescription>{pack.description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline">{pack.tier}</Badge>
            {(pack.isInstalled || installedPacks.includes(pack.id)) && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Installed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg">{pack.models}</div>
            <div className="text-muted-foreground">AI Models</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{pack.templates}</div>
            <div className="text-muted-foreground">Templates</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{pack.datasets}</div>
            <div className="text-muted-foreground">Datasets</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{pack.rating}</span>
            <span className="text-muted-foreground">•</span>
            <Users className="h-4 w-4" />
            <span className="text-muted-foreground">{pack.users} users</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {pack.isInstalled || installedPacks.includes(pack.id) ? (
            <>
              <Button 
                onClick={() => launchPack(pack.id)}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Launch
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedPack(pack.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => installPack(pack.id)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Pack
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedPack(pack.id)}
              >
                Details
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const selectedPackData = selectedPack ? industryPacks.find(p => p.id === selectedPack) : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Industry Intelligence Packs</h1>
        <p className="text-muted-foreground">
          Pre-built AI intelligence modules tailored for specific industries
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPacks.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pack Details Modal */}
      {selectedPackData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${selectedPackData.color}`}>
                    {selectedPackData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedPackData.name}</CardTitle>
                    <CardDescription>{selectedPackData.longDescription}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedPack(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Features Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPackData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Common Use Cases</h4>
                <div className="space-y-2">
                  {selectedPackData.useCases.map((useCase, index) => (
                    <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                      {useCase}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                {selectedPackData.isInstalled || installedPacks.includes(selectedPackData.id) ? (
                  <Button onClick={() => launchPack(selectedPackData.id)} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Launch Pack
                  </Button>
                ) : (
                  <Button onClick={() => installPack(selectedPackData.id)} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Install Pack
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IndustryIntelligencePacks;