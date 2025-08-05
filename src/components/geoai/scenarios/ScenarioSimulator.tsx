import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Save, BarChart3, Map, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ScenarioSimulation {
  id: string;
  scenario_type: 'urban_growth' | 'climate_projection' | 'flood_simulation' | 'drought_prediction' | 'vegetation_change';
  name: string;
  description: string;
  parameters: any;
  status: string;
  progress_percentage: number;
  created_at: string;
  output_results: any;
}

const ScenarioSimulator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [simulations, setSimulations] = useState<ScenarioSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  // Scenario configuration
  const [scenarioType, setScenarioType] = useState<'urban_growth' | 'climate_projection' | 'flood_simulation' | 'drought_prediction' | 'vegetation_change'>('urban_growth');
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [timeHorizon, setTimeHorizon] = useState([10]);
  const [confidence, setConfidence] = useState([85]);
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    if (user) {
      fetchSimulations();
    }
  }, [user]);

  const fetchSimulations = async () => {
    try {
      const { data, error } = await supabase
        .from('scenario_simulations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSimulation = async () => {
    if (!scenarioName || !scenarioType) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and select scenario type",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const parameters = {
        time_horizon: timeHorizon[0],
        confidence_level: confidence[0],
        region: selectedRegion,
        scenario_specific: getScenarioSpecificParams()
      };

      const { error } = await supabase
        .from('scenario_simulations')
        .insert({
          scenario_type: scenarioType,
          name: scenarioName,
          description: scenarioDescription,
          parameters,
          user_id: user?.id
        });

      if (error) throw error;

      // Reset form
      setScenarioName('');
      setScenarioDescription('');
      setTimeHorizon([10]);
      setConfidence([85]);
      setSelectedRegion('');

      fetchSimulations();
      setActiveTab('simulations');

      toast({
        title: "Simulation Created",
        description: "Your scenario simulation has been queued for processing"
      });
    } catch (error) {
      console.error('Error creating simulation:', error);
      toast({
        title: "Error",
        description: "Failed to create simulation",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getScenarioSpecificParams = () => {
    switch (scenarioType) {
      case 'urban_growth':
        return {
          population_growth_rate: 2.5,
          economic_factors: ['gdp_growth', 'employment_rate'],
          infrastructure_development: true
        };
      case 'climate_projection':
        return {
          temperature_change: 2.0,
          precipitation_change: -10,
          emission_scenario: 'RCP4.5'
        };
      case 'flood_simulation':
        return {
          rainfall_intensity: 'extreme',
          sea_level_rise: 0.3,
          drainage_capacity: 'current'
        };
      case 'drought_prediction':
        return {
          precipitation_deficit: 40,
          temperature_increase: 1.5,
          soil_moisture_threshold: 0.2
        };
      case 'vegetation_change':
        return {
          climate_stress: 'moderate',
          land_use_pressure: 'high',
          conservation_measures: false
        };
      default:
        return {};
    }
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'urban_growth': return <TrendingUp className="h-5 w-5" />;
      case 'climate_projection': return <BarChart3 className="h-5 w-5" />;
      case 'flood_simulation': return <AlertTriangle className="h-5 w-5" />;
      case 'drought_prediction': return <Calendar className="h-5 w-5" />;
      case 'vegetation_change': return <Map className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scenario Simulator</h1>
          <p className="text-muted-foreground">Create and run predictive scenario simulations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create">Create Scenario</TabsTrigger>
          <TabsTrigger value="simulations">My Simulations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
              <CardDescription>Configure and run a new predictive simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input
                    id="scenario-name"
                    placeholder="Enter scenario name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario-type">Scenario Type</Label>
                  <Select value={scenarioType} onValueChange={(value: any) => setScenarioType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban_growth">Urban Growth</SelectItem>
                      <SelectItem value="climate_projection">Climate Projection</SelectItem>
                      <SelectItem value="flood_simulation">Flood Simulation</SelectItem>
                      <SelectItem value="drought_prediction">Drought Prediction</SelectItem>
                      <SelectItem value="vegetation_change">Vegetation Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your scenario..."
                  value={scenarioDescription}
                  onChange={(e) => setScenarioDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Time Horizon (Years)</Label>
                    <div className="px-3">
                      <Slider
                        value={timeHorizon}
                        onValueChange={setTimeHorizon}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>1 year</span>
                        <span>{timeHorizon[0]} years</span>
                        <span>50 years</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confidence Level (%)</Label>
                    <div className="px-3">
                      <Slider
                        value={confidence}
                        onValueChange={setConfidence}
                        max={99}
                        min={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>50%</span>
                        <span>{confidence[0]}%</span>
                        <span>99%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="north_america">North America</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                        <SelectItem value="custom">Custom Region</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-400 mb-2">Scenario Parameters</p>
                    <p className="text-xs text-muted-foreground">
                      Advanced parameters will be automatically configured based on your scenario type and selections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={createSimulation} disabled={creating}>
                  <Play className="h-4 w-4 mr-2" />
                  {creating ? 'Creating...' : 'Run Simulation'}
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulations.map((simulation) => (
              <Card key={simulation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getScenarioIcon(simulation.scenario_type)}
                      <CardTitle className="text-lg">{simulation.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(simulation.status)}>
                      {simulation.status}
                    </Badge>
                  </div>
                  <CardDescription className="capitalize">
                    {simulation.scenario_type.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {simulation.description || 'No description provided'}
                  </p>
                  
                  {simulation.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{simulation.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${simulation.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Created {new Date(simulation.created_at).toLocaleDateString()}
                    </span>
                    {simulation.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        View Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {simulations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-medium">No Simulations Yet</p>
                <p className="text-muted-foreground">Create your first scenario simulation to get started</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="p-8 text-center">
              <Map className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Scenario Templates</p>
              <p className="text-muted-foreground">Pre-configured scenario templates coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioSimulator;