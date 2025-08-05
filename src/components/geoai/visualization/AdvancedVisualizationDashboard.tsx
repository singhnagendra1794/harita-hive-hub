import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  BarChart3,
  TrendingUp,
  Map,
  Layers,
  Calendar,
  Share,
  Download,
  Settings,
  Maximize,
  Minimize,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  Eye,
  EyeOff,
  PieChart,
  LineChart,
  Globe,
  Mountain,
  Thermometer,
  Droplets,
  Wind,
  Sun
} from 'lucide-react';

interface VisualizationData {
  id: string;
  name: string;
  type: 'time_series' | '3d_terrain' | 'heatmap' | 'change_detection' | 'scenario_simulation';
  data: any;
  created_at: string;
  job_id: string;
  metadata: any;
  is_public: boolean;
  shared_url?: string;
}

interface TimeSeriesConfig {
  dateRange: [string, string];
  metrics: string[];
  aggregation: 'daily' | 'weekly' | 'monthly';
  showTrend: boolean;
  compareRegions: boolean;
}

interface TerrainConfig {
  elevation: boolean;
  landCover: boolean;
  buildings: boolean;
  vegetation: boolean;
  exaggeration: number;
  lighting: 'day' | 'night' | 'sunset';
}

interface ScenarioConfig {
  baseYear: number;
  targetYear: number;
  parameters: {
    urbanGrowth: number;
    climateChange: number;
    populationGrowth: number;
    landUseChange: number;
  };
  showUncertainty: boolean;
}

const AdvancedVisualizationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [visualizations, setVisualizations] = useState<VisualizationData[]>([]);
  const [activeVisualization, setActiveVisualization] = useState<VisualizationData | null>(null);
  const [timeSeriesConfig, setTimeSeriesConfig] = useState<TimeSeriesConfig>({
    dateRange: ['2023-01-01', '2024-01-01'],
    metrics: ['ndvi', 'temperature'],
    aggregation: 'monthly',
    showTrend: true,
    compareRegions: false
  });
  const [terrainConfig, setTerrainConfig] = useState<TerrainConfig>({
    elevation: true,
    landCover: true,
    buildings: false,
    vegetation: true,
    exaggeration: 2.0,
    lighting: 'day'
  });
  const [scenarioConfig, setScenarioConfig] = useState<ScenarioConfig>({
    baseYear: 2024,
    targetYear: 2034,
    parameters: {
      urbanGrowth: 50,
      climateChange: 30,
      populationGrowth: 25,
      landUseChange: 40
    },
    showUncertainty: true
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (user) {
      loadVisualizations();
    }
  }, [user]);

  const loadVisualizations = async () => {
    setLoading(true);
    try {
      // Load user's visualization data
      const { data: results, error } = await supabase
        .from('geoai_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform results into visualization data
      const visualizationData: VisualizationData[] = (results || []).map((result, index) => ({
        id: result.id,
        name: `Analysis ${index + 1} - ${result.result_type}`,
        type: getVisualizationType(result.result_type),
        data: generateMockVisualizationData(result.result_type),
        created_at: result.created_at,
        job_id: result.job_id,
        metadata: result.result_data || {},
        is_public: false,
        shared_url: undefined
      }));

      setVisualizations(visualizationData);
      if (visualizationData.length > 0) {
        setActiveVisualization(visualizationData[0]);
      }
    } catch (error) {
      console.error('Error loading visualizations:', error);
      // Load mock data
      loadMockVisualizations();
    } finally {
      setLoading(false);
    }
  };

  const loadMockVisualizations = () => {
    const mockVisualizations: VisualizationData[] = [
      {
        id: '1',
        name: 'Crop Health Time Series Analysis',
        type: 'time_series',
        data: generateTimeSeriesData(),
        created_at: new Date().toISOString(),
        job_id: 'job_1',
        metadata: { region: 'Agricultural Zone A', crop_type: 'corn' },
        is_public: false
      },
      {
        id: '2',
        name: 'Urban Heat Island 3D Visualization',
        type: '3d_terrain',
        data: generateTerrainData(),
        created_at: new Date().toISOString(),
        job_id: 'job_2',
        metadata: { city: 'Metro Area', season: 'summer' },
        is_public: false
      },
      {
        id: '3',
        name: 'Deforestation Change Detection',
        type: 'change_detection',
        data: generateChangeDetectionData(),
        created_at: new Date().toISOString(),
        job_id: 'job_3',
        metadata: { forest_area: 'Amazon Region', period: '2020-2024' },
        is_public: false
      },
      {
        id: '4',
        name: 'Climate Impact Scenario 2030',
        type: 'scenario_simulation',
        data: generateScenarioData(),
        created_at: new Date().toISOString(),
        job_id: 'job_4',
        metadata: { scenario: 'RCP4.5', region: 'Coastal Areas' },
        is_public: false
      }
    ];
    setVisualizations(mockVisualizations);
    setActiveVisualization(mockVisualizations[0]);
  };

  const getVisualizationType = (resultType: string): VisualizationData['type'] => {
    if (resultType.includes('time') || resultType.includes('series')) return 'time_series';
    if (resultType.includes('3d') || resultType.includes('terrain')) return '3d_terrain';
    if (resultType.includes('change') || resultType.includes('detection')) return 'change_detection';
    if (resultType.includes('scenario') || resultType.includes('prediction')) return 'scenario_simulation';
    return 'heatmap';
  };

  const generateMockVisualizationData = (type: string) => {
    switch (type) {
      case 'time_series': return generateTimeSeriesData();
      case '3d_terrain': return generateTerrainData();
      case 'change_detection': return generateChangeDetectionData();
      case 'scenario_simulation': return generateScenarioData();
      default: return generateTimeSeriesData();
    }
  };

  const generateTimeSeriesData = () => {
    const data = [];
    const startDate = new Date('2023-01-01');
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      data.push({
        date: date.toISOString().split('T')[0],
        ndvi: 0.3 + Math.random() * 0.4 + Math.sin(i * Math.PI / 6) * 0.2,
        temperature: 15 + Math.random() * 20 + Math.sin(i * Math.PI / 6) * 10,
        precipitation: Math.random() * 100,
        soil_moisture: 0.2 + Math.random() * 0.6
      });
    }
    return data;
  };

  const generateTerrainData = () => ({
    elevationGrid: Array(50).fill(null).map(() => 
      Array(50).fill(null).map(() => Math.random() * 1000)
    ),
    landCoverGrid: Array(50).fill(null).map(() => 
      Array(50).fill(null).map(() => Math.floor(Math.random() * 10))
    ),
    temperatureGrid: Array(50).fill(null).map(() => 
      Array(50).fill(null).map(() => 15 + Math.random() * 25)
    ),
    bounds: [[-122.5, 37.7], [-122.3, 37.9]]
  });

  const generateChangeDetectionData = () => ({
    beforeImage: 'forest_2020.tif',
    afterImage: 'forest_2024.tif',
    changeAreas: [
      { polygon: [[0, 0], [0, 1], [1, 1], [1, 0]], change_type: 'deforestation', area_ha: 150.5 },
      { polygon: [[2, 2], [2, 3], [3, 3], [3, 2]], change_type: 'reforestation', area_ha: 75.2 }
    ],
    statistics: {
      total_forest_loss: 1250.5,
      total_forest_gain: 425.3,
      net_change: -825.2
    }
  });

  const generateScenarioData = () => ({
    scenarios: [
      {
        name: 'Business as Usual',
        urban_growth: 0.3,
        temperature_increase: 1.5,
        sea_level_rise: 0.15,
        population_affected: 150000
      },
      {
        name: 'Mitigation Scenario',
        urban_growth: 0.1,
        temperature_increase: 1.0,
        sea_level_rise: 0.10,
        population_affected: 90000
      },
      {
        name: 'High Impact Scenario',
        urban_growth: 0.5,
        temperature_increase: 2.5,
        sea_level_rise: 0.25,
        population_affected: 250000
      }
    ],
    timeline: Array(10).fill(null).map((_, i) => ({
      year: 2025 + i,
      metrics: {
        temperature: 20 + i * 0.2 + Math.random() * 2,
        urban_area: 1000 + i * 50 + Math.random() * 100,
        population: 1000000 + i * 25000 + Math.random() * 50000
      }
    }))
  });

  const shareVisualization = async (visualization: VisualizationData) => {
    try {
      const sharedUrl = `${window.location.origin}/shared/visualization/${visualization.id}`;
      
      // Update visualization to be public
      const updatedVisualizations = visualizations.map(viz => 
        viz.id === visualization.id 
          ? { ...viz, is_public: true, shared_url: sharedUrl }
          : viz
      );
      setVisualizations(updatedVisualizations);

      // Copy to clipboard
      await navigator.clipboard.writeText(sharedUrl);
      
      toast({
        title: "Visualization Shared",
        description: "Public link copied to clipboard",
      });
    } catch (error) {
      console.error('Error sharing visualization:', error);
      toast({
        title: "Error",
        description: "Failed to share visualization",
        variant: "destructive"
      });
    }
  };

  const exportVisualization = async (visualization: VisualizationData, format: 'png' | 'pdf' | 'gif') => {
    try {
      // Simulate export process
      toast({
        title: "Export Started",
        description: `Preparing ${format.toUpperCase()} export...`,
      });

      // In real implementation, this would call an API to generate the export
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: `${visualization.name}.${format} is ready for download`,
        });
      }, 3000);
    } catch (error) {
      console.error('Error exporting visualization:', error);
      toast({
        title: "Error",
        description: "Failed to export visualization",
        variant: "destructive"
      });
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Start animation
      const interval = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= 99) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4D35E]"></div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} flex flex-col bg-[#0D1B2A] text-[#F9F9F9]`}>
      {/* Header */}
      <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F4D35E] rounded-lg">
              <BarChart3 className="h-6 w-6 text-[#0D1B2A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Advanced Visualization Dashboard</h1>
              <p className="text-sm text-[#F9F9F9]/70">Interactive analysis and scenario modeling</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              className="border-[#43AA8B]/20 text-[#43AA8B] hover:bg-[#43AA8B]/10"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              onClick={loadVisualizations}
              variant="outline"
              className="border-[#43AA8B]/20 text-[#43AA8B] hover:bg-[#43AA8B]/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Visualization List */}
        <div className="w-80 bg-[#1B263B] border-r border-[#43AA8B]/20 flex flex-col">
          <div className="p-4 border-b border-[#43AA8B]/20">
            <h3 className="text-lg font-semibold text-white">Visualizations</h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {visualizations.map(viz => (
                <Card 
                  key={viz.id}
                  className={`cursor-pointer transition-all ${
                    activeVisualization?.id === viz.id 
                      ? 'bg-[#43AA8B]/20 border-[#43AA8B]' 
                      : 'bg-[#0D1B2A] border-[#43AA8B]/20 hover:border-[#43AA8B]/40'
                  }`}
                  onClick={() => setActiveVisualization(viz)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{viz.name}</h4>
                      <Badge className={getVisualizationTypeColor(viz.type)}>
                        {viz.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-[#F9F9F9]/50 text-xs">
                      {new Date(viz.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareVisualization(viz);
                        }}
                        className="text-[#F9F9F9]/70 hover:text-white p-1"
                      >
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportVisualization(viz, 'png');
                        }}
                        className="text-[#F9F9F9]/70 hover:text-white p-1"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Visualization Area */}
        <div className="flex-1 flex flex-col">
          {activeVisualization && (
            <>
              {/* Visualization Controls */}
              <div className="bg-[#1B263B] border-b border-[#43AA8B]/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{activeVisualization.name}</h2>
                    <p className="text-sm text-[#F9F9F9]/70">
                      {activeVisualization.type.replace('_', ' ')} visualization
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Time Series Controls */}
                    {activeVisualization.type === 'time_series' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={togglePlayback}
                          className="bg-[#43AA8B] hover:bg-[#43AA8B]/90"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="w-32">
                          <Slider
                            value={[currentFrame]}
                            onValueChange={([value]) => setCurrentFrame(value)}
                            max={99}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Export Options */}
                    <Select onValueChange={(value) => exportVisualization(activeVisualization, value as any)}>
                      <SelectTrigger className="w-24 bg-[#0D1B2A] border-[#43AA8B]/20 text-white">
                        <Download className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => shareVisualization(activeVisualization)}
                      variant="outline"
                      className="border-[#F4D35E]/20 text-[#F4D35E] hover:bg-[#F4D35E]/10"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Visualization Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="main" className="h-full flex flex-col">
                  <TabsList className="bg-[#1B263B] border-b border-[#43AA8B]/20 justify-start gap-0 rounded-none h-12">
                    <TabsTrigger 
                      value="main" 
                      className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualization
                    </TabsTrigger>
                    <TabsTrigger 
                      value="config" 
                      className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="main" className="h-full m-0">
                      <VisualizationRenderer 
                        visualization={activeVisualization}
                        config={{ timeSeriesConfig, terrainConfig, scenarioConfig }}
                        currentFrame={currentFrame}
                      />
                    </TabsContent>
                    
                    <TabsContent value="config" className="h-full m-0 p-6">
                      <VisualizationConfigPanel 
                        visualization={activeVisualization}
                        timeSeriesConfig={timeSeriesConfig}
                        setTimeSeriesConfig={setTimeSeriesConfig}
                        terrainConfig={terrainConfig}
                        setTerrainConfig={setTerrainConfig}
                        scenarioConfig={scenarioConfig}
                        setScenarioConfig={setScenarioConfig}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </>
          )}

          {!activeVisualization && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No visualization selected</h3>
                <p className="text-[#F9F9F9]/70">Select a visualization from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get visualization type color
const getVisualizationTypeColor = (type: string) => {
  switch (type) {
    case 'time_series': return 'bg-[#43AA8B] text-white';
    case '3d_terrain': return 'bg-[#F4D35E] text-[#0D1B2A]';
    case 'change_detection': return 'bg-[#EE964B] text-white';
    case 'scenario_simulation': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Visualization Renderer Component
interface VisualizationRendererProps {
  visualization: VisualizationData;
  config: any;
  currentFrame: number;
}

const VisualizationRenderer: React.FC<VisualizationRendererProps> = ({ 
  visualization, 
  config, 
  currentFrame 
}) => {
  switch (visualization.type) {
    case 'time_series':
      return <TimeSeriesVisualization data={visualization.data} config={config.timeSeriesConfig} />;
    case '3d_terrain':
      return <TerrainVisualization data={visualization.data} config={config.terrainConfig} />;
    case 'change_detection':
      return <ChangeDetectionVisualization data={visualization.data} currentFrame={currentFrame} />;
    case 'scenario_simulation':
      return <ScenarioVisualization data={visualization.data} config={config.scenarioConfig} />;
    default:
      return <HeatmapVisualization data={visualization.data} />;
  }
};

// Time Series Visualization Component
const TimeSeriesVisualization: React.FC<{ data: any; config: TimeSeriesConfig }> = ({ data, config }) => (
  <div className="h-full p-6 bg-[#0D1B2A]">
    <Card className="h-full bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Time Series Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="bg-[#0D1B2A] rounded-lg p-4">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature Trend
            </h4>
            <div className="h-48 flex items-end justify-around">
              {data.slice(0, 8).map((point: any, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-[#F4D35E] w-4 rounded-t"
                    style={{ height: `${(point.temperature / 35) * 100}%` }}
                  />
                  <span className="text-xs text-[#F9F9F9]/70 mt-1">
                    {new Date(point.date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0D1B2A] rounded-lg p-4">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              NDVI & Soil Moisture
            </h4>
            <div className="h-48 relative">
              <svg className="w-full h-full">
                {data.map((point: any, index: number) => (
                  <g key={index}>
                    <circle
                      cx={`${(index / (data.length - 1)) * 100}%`}
                      cy={`${100 - (point.ndvi * 100)}%`}
                      r="3"
                      fill="#43AA8B"
                    />
                    <circle
                      cx={`${(index / (data.length - 1)) * 100}%`}
                      cy={`${100 - (point.soil_moisture * 100)}%`}
                      r="3"
                      fill="#EE964B"
                    />
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#43AA8B] rounded-full" />
                  <span className="text-[#F9F9F9]/70">NDVI</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#EE964B] rounded-full" />
                  <span className="text-[#F9F9F9]/70">Soil Moisture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// 3D Terrain Visualization Component
const TerrainVisualization: React.FC<{ data: any; config: TerrainConfig }> = ({ data, config }) => (
  <div className="h-full p-6 bg-[#0D1B2A]">
    <Card className="h-full bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mountain className="h-5 w-5" />
          3D Terrain Model
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="relative h-full bg-[#0D1B2A] rounded-lg overflow-hidden">
          {/* 3D Terrain Simulation */}
          <div className="absolute inset-4 perspective-1000">
            <div className="w-full h-full transform rotate-x-60 rotate-y-12">
              <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
                {Array(100).fill(0).map((_, index) => {
                  const elevation = Math.random() * 20;
                  const temperature = 15 + Math.random() * 25;
                  return (
                    <div
                      key={index}
                      className="border border-[#43AA8B]/20"
                      style={{
                        height: `${elevation}px`,
                        backgroundColor: `hsl(${120 - temperature * 2}, 70%, ${50 + elevation}%)`,
                        transform: `translateZ(${elevation}px)`
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-[#1B263B]/90 rounded-lg p-3">
            <h5 className="text-white font-medium text-sm mb-2">Elevation & Temperature</h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500" />
                <span className="text-[#F9F9F9]/70">Low temp, low elevation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500" />
                <span className="text-[#F9F9F9]/70">Medium temp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500" />
                <span className="text-[#F9F9F9]/70">High temp, high elevation</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Change Detection Visualization Component
const ChangeDetectionVisualization: React.FC<{ data: any; currentFrame: number }> = ({ data, currentFrame }) => (
  <div className="h-full p-6 bg-[#0D1B2A]">
    <Card className="h-full bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Change Detection Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="space-y-4">
            <div className="bg-[#0D1B2A] rounded-lg p-4 h-48">
              <h4 className="text-white font-medium mb-2">Before (2020)</h4>
              <div className="w-full h-32 bg-gradient-to-br from-green-600 to-green-800 rounded relative">
                <div className="absolute inset-2 bg-green-700 opacity-80 rounded" />
                <span className="absolute bottom-2 left-2 text-white text-xs">Forest Coverage: 85%</span>
              </div>
            </div>
            
            <div className="bg-[#0D1B2A] rounded-lg p-4 h-48">
              <h4 className="text-white font-medium mb-2">After (2024)</h4>
              <div className="w-full h-32 bg-gradient-to-br from-green-600 to-brown-600 rounded relative">
                <div className="absolute inset-2 bg-brown-600 opacity-60 rounded-br-lg" style={{ width: '40%' }} />
                <div className="absolute inset-2 left-1/2 bg-green-700 opacity-80 rounded" />
                <span className="absolute bottom-2 left-2 text-white text-xs">Forest Coverage: 52%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-4">Change Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#F9F9F9]/70">Forest Loss:</span>
                    <span className="text-[#EE964B] font-medium">1,250 ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F9F9F9]/70">Forest Gain:</span>
                    <span className="text-[#43AA8B] font-medium">425 ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F9F9F9]/70">Net Change:</span>
                    <span className="text-[#EE964B] font-medium">-825 ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#F9F9F9]/70">Change Rate:</span>
                    <span className="text-white font-medium">8.3% annual</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-4">Change Drivers</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F9F9F9]/70">Agriculture</span>
                    <div className="flex-1 mx-2 bg-gray-700 rounded-full h-2">
                      <div className="bg-[#F4D35E] h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm text-white">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F9F9F9]/70">Urban Development</span>
                    <div className="flex-1 mx-2 bg-gray-700 rounded-full h-2">
                      <div className="bg-[#EE964B] h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-sm text-white">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F9F9F9]/70">Logging</span>
                    <div className="flex-1 mx-2 bg-gray-700 rounded-full h-2">
                      <div className="bg-[#43AA8B] h-2 rounded-full" style={{ width: '15%' }} />
                    </div>
                    <span className="text-sm text-white">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Scenario Visualization Component
const ScenarioVisualization: React.FC<{ data: any; config: ScenarioConfig }> = ({ data, config }) => (
  <div className="h-full p-6 bg-[#0D1B2A]">
    <Card className="h-full bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Climate Scenario Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="grid grid-cols-3 gap-6 h-full">
          {data.scenarios.map((scenario: any, index: number) => (
            <Card key={index} className="bg-[#0D1B2A] border-[#43AA8B]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">{scenario.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#F9F9F9]/70">Temperature Rise</span>
                      <span className="text-[#EE964B]">+{scenario.temperature_increase}°C</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#EE964B] h-2 rounded-full" 
                        style={{ width: `${(scenario.temperature_increase / 3) * 100}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#F9F9F9]/70">Sea Level Rise</span>
                      <span className="text-[#43AA8B]">{scenario.sea_level_rise}m</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#43AA8B] h-2 rounded-full" 
                        style={{ width: `${(scenario.sea_level_rise / 0.5) * 100}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#F9F9F9]/70">Urban Growth</span>
                      <span className="text-[#F4D35E]">{(scenario.urban_growth * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#F4D35E] h-2 rounded-full" 
                        style={{ width: `${scenario.urban_growth * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-[#43AA8B]/20">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {(scenario.population_affected / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-[#F9F9F9]/70">People Affected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Heatmap Visualization Component
const HeatmapVisualization: React.FC<{ data: any }> = ({ data }) => (
  <div className="h-full p-6 bg-[#0D1B2A]">
    <Card className="h-full bg-[#1B263B] border-[#43AA8B]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Heat Map Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="w-full h-full bg-[#0D1B2A] rounded-lg relative">
          <div className="grid grid-cols-20 grid-rows-20 w-full h-full gap-0">
            {Array(400).fill(0).map((_, index) => {
              const intensity = Math.random();
              const hue = 240 - (intensity * 240); // Blue to red
              return (
                <div
                  key={index}
                  className="border-0"
                  style={{
                    backgroundColor: `hsl(${hue}, 70%, ${50 + intensity * 30}%)`,
                    opacity: 0.8
                  }}
                />
              );
            })}
          </div>
          
          {/* Color Scale Legend */}
          <div className="absolute bottom-4 right-4 bg-[#1B263B]/90 rounded-lg p-3">
            <h5 className="text-white font-medium text-sm mb-2">Intensity Scale</h5>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#F9F9F9]/70">Low</span>
              <div className="w-20 h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded" />
              <span className="text-xs text-[#F9F9F9]/70">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Visualization Config Panel Component
interface VisualizationConfigPanelProps {
  visualization: VisualizationData;
  timeSeriesConfig: TimeSeriesConfig;
  setTimeSeriesConfig: (config: TimeSeriesConfig) => void;
  terrainConfig: TerrainConfig;
  setTerrainConfig: (config: TerrainConfig) => void;
  scenarioConfig: ScenarioConfig;
  setScenarioConfig: (config: ScenarioConfig) => void;
}

const VisualizationConfigPanel: React.FC<VisualizationConfigPanelProps> = ({
  visualization,
  timeSeriesConfig,
  setTimeSeriesConfig,
  terrainConfig,
  setTerrainConfig,
  scenarioConfig,
  setScenarioConfig
}) => {
  switch (visualization.type) {
    case 'time_series':
      return (
        <Card className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardHeader>
            <CardTitle className="text-white">Time Series Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-white text-sm mb-2 block">Metrics to Display</label>
              <div className="space-y-2">
                {['ndvi', 'temperature', 'precipitation', 'soil_moisture'].map(metric => (
                  <label key={metric} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeSeriesConfig.metrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTimeSeriesConfig({
                            ...timeSeriesConfig,
                            metrics: [...timeSeriesConfig.metrics, metric]
                          });
                        } else {
                          setTimeSeriesConfig({
                            ...timeSeriesConfig,
                            metrics: timeSeriesConfig.metrics.filter(m => m !== metric)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-[#F9F9F9]/90 text-sm capitalize">{metric.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Aggregation</label>
              <Select 
                value={timeSeriesConfig.aggregation} 
                onValueChange={(value: any) => setTimeSeriesConfig({...timeSeriesConfig, aggregation: value})}
              >
                <SelectTrigger className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Show Trend Line</label>
              <Switch
                checked={timeSeriesConfig.showTrend}
                onCheckedChange={(checked) => setTimeSeriesConfig({...timeSeriesConfig, showTrend: checked})}
              />
            </div>
          </CardContent>
        </Card>
      );
      
    case '3d_terrain':
      return (
        <Card className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardHeader>
            <CardTitle className="text-white">3D Terrain Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-white text-sm mb-4 block">Terrain Layers</label>
              <div className="space-y-3">
                {Object.entries({
                  elevation: 'Elevation',
                  landCover: 'Land Cover',
                  buildings: 'Buildings',
                  vegetation: 'Vegetation'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[#F9F9F9]/90 text-sm">{label}</span>
                    <Switch
                      checked={terrainConfig[key as keyof TerrainConfig] as boolean}
                      onCheckedChange={(checked) => setTerrainConfig({...terrainConfig, [key]: checked})}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">
                Vertical Exaggeration: {terrainConfig.exaggeration}x
              </label>
              <Slider
                value={[terrainConfig.exaggeration]}
                onValueChange={([value]) => setTerrainConfig({...terrainConfig, exaggeration: value})}
                min={0.5}
                max={5}
                step={0.1}
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Lighting</label>
              <Select 
                value={terrainConfig.lighting} 
                onValueChange={(value: any) => setTerrainConfig({...terrainConfig, lighting: value})}
              >
                <SelectTrigger className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );
      
    case 'scenario_simulation':
      return (
        <Card className="bg-[#1B263B] border-[#43AA8B]/20">
          <CardHeader>
            <CardTitle className="text-white">Scenario Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Base Year</label>
                <Select 
                  value={scenarioConfig.baseYear.toString()} 
                  onValueChange={(value) => setScenarioConfig({...scenarioConfig, baseYear: parseInt(value)})}
                >
                  <SelectTrigger className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-white text-sm mb-2 block">Target Year</label>
                <Select 
                  value={scenarioConfig.targetYear.toString()} 
                  onValueChange={(value) => setScenarioConfig({...scenarioConfig, targetYear: parseInt(value)})}
                >
                  <SelectTrigger className="bg-[#0D1B2A] border-[#43AA8B]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2030">2030</SelectItem>
                    <SelectItem value="2040">2040</SelectItem>
                    <SelectItem value="2050">2050</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm mb-4 block">Scenario Parameters</label>
              <div className="space-y-4">
                {Object.entries({
                  urbanGrowth: 'Urban Growth',
                  climateChange: 'Climate Change Impact',
                  populationGrowth: 'Population Growth',
                  landUseChange: 'Land Use Change'
                }).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#F9F9F9]/90 text-sm">{label}</span>
                      <span className="text-white text-sm">{scenarioConfig.parameters[key as keyof typeof scenarioConfig.parameters]}%</span>
                    </div>
                    <Slider
                      value={[scenarioConfig.parameters[key as keyof typeof scenarioConfig.parameters]]}
                      onValueChange={([value]) => setScenarioConfig({
                        ...scenarioConfig,
                        parameters: {
                          ...scenarioConfig.parameters,
                          [key]: value
                        }
                      })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Show Uncertainty Bands</label>
              <Switch
                checked={scenarioConfig.showUncertainty}
                onCheckedChange={(checked) => setScenarioConfig({...scenarioConfig, showUncertainty: checked})}
              />
            </div>
          </CardContent>
        </Card>
      );
      
    default:
      return (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No configuration available</h3>
          <p className="text-[#F9F9F9]/70">This visualization type doesn't have configurable options</p>
        </div>
      );
  }
};

export default AdvancedVisualizationDashboard;