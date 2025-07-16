import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Save, Download, Code, Database, Globe, Terminal, FileCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import UpgradePrompt from '@/components/premium/UpgradePrompt';

interface SandboxSession {
  id: string;
  session_type: string;
  code_content: string;
  output_data: string;
  created_at: string;
  updated_at: string;
}

const Labs = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [activeTab, setActiveTab] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SandboxSession[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const hasProfessionalAccess = hasAccess('pro');
  const hasEnterpriseAccess = hasAccess('enterprise');

  // Free users only get Python basics
  const availableTabs = hasProfessionalAccess ? 
    ['python', 'earthengine', 'postgis'] : 
    ['python'];

  const codeTemplates = {
    python: {
      'basic-geopandas': `import geopandas as gpd
import matplotlib.pyplot as plt

# Load sample data
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))

# Simple plot
world.plot(figsize=(15, 10))
plt.title('World Map with GeoPandas')
plt.show()

# Basic operations
print(f"Number of countries: {len(world)}")
print(f"Largest country by area: {world.loc[world['geometry'].area.idxmax(), 'name']}")`,
      
      'rasterio-example': `import rasterio
import numpy as np
from rasterio.plot import show

# Sample raster operations
print("Rasterio Example - Working with raster data")
print("This example demonstrates basic raster operations")

# Create a sample raster array
rows, cols = 300, 300
data = np.random.rand(rows, cols) * 100

print(f"Created raster with shape: {data.shape}")
print(f"Min value: {data.min():.2f}")
print(f"Max value: {data.max():.2f}")
print(f"Mean value: {data.mean():.2f}")`,

      'coordinate-transformation': `from pyproj import Transformer
import math

# Coordinate transformation example
transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857")  # WGS84 to Web Mercator

# Sample coordinates (longitude, latitude)
lon, lat = -74.0060, 40.7128  # New York City

# Transform coordinates
x, y = transformer.transform(lat, lon)

print(f"Original coordinates (WGS84):")
print(f"Longitude: {lon}")
print(f"Latitude: {lat}")
print()
print(f"Transformed coordinates (Web Mercator):")
print(f"X: {x:.2f}")
print(f"Y: {y:.2f}")

# Calculate distance between two points
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return distance

# Example: Distance between NYC and LA
nyc_lat, nyc_lon = 40.7128, -74.0060
la_lat, la_lon = 34.0522, -118.2437

distance = haversine_distance(nyc_lat, nyc_lon, la_lat, la_lon)
print(f"\\nDistance between NYC and LA: {distance:.2f} km")`
    },
    earthengine: {
      'ndvi-calculation': `// NDVI Calculation with Sentinel-2
var geometry = ee.Geometry.Rectangle([-74.2, 40.6, -73.8, 40.9]); // NYC area

// Load Sentinel-2 collection
var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(geometry)
  .filterDate('2023-06-01', '2023-08-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .median();

// Calculate NDVI
var ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Visualization parameters
var ndviParams = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};

// Add layers to map
Map.centerObject(geometry, 10);
Map.addLayer(s2, {bands: ['B4', 'B3', 'B2'], max: 3000}, 'RGB');
Map.addLayer(ndvi, ndviParams, 'NDVI');

print('NDVI statistics:', ndvi.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: geometry,
  scale: 10
}));`,

      'land-cover-classification': `// Random Forest Land Cover Classification
var geometry = ee.Geometry.Rectangle([-122.5, 37.6, -122.3, 37.8]); // San Francisco

// Load training data (replace with your own)
var urban = ee.FeatureCollection('ft:example_urban_points');
var vegetation = ee.FeatureCollection('ft:example_vegetation_points');
var water = ee.FeatureCollection('ft:example_water_points');

// Merge training data
var training = urban.merge(vegetation).merge(water);

// Load Sentinel-2 image
var image = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(geometry)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median();

// Select bands for classification
var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'];

// Sample the image at training points
var trainingData = image.select(bands).sampleRegions({
  collection: training,
  properties: ['landcover'],
  scale: 10
});

// Train Random Forest classifier
var classifier = ee.Classifier.smileRandomForest(50)
  .train({
    features: trainingData,
    classProperty: 'landcover',
    inputProperties: bands
  });

// Classify the image
var classified = image.select(bands).classify(classifier);

// Display results
Map.centerObject(geometry, 11);
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], max: 3000}, 'RGB');
Map.addLayer(classified, {min: 0, max: 2, palette: ['red', 'green', 'blue']}, 'Classification');`
    },
    postgis: {
      'spatial-queries': `-- PostGIS Spatial Analysis Examples

-- 1. Basic spatial operations
SELECT 
    name,
    ST_Area(geom) as area_sqm,
    ST_Perimeter(geom) as perimeter_m
FROM administrative_boundaries
WHERE ST_Area(geom) > 1000000;

-- 2. Distance calculations
SELECT 
    a.name as location_a,
    b.name as location_b,
    ST_Distance(a.geom, b.geom) as distance_m
FROM points_of_interest a, points_of_interest b
WHERE a.id != b.id
AND ST_Distance(a.geom, b.geom) < 5000
ORDER BY distance_m;

-- 3. Spatial joins
SELECT 
    p.name as poi_name,
    b.name as boundary_name
FROM points_of_interest p
JOIN administrative_boundaries b
ON ST_Within(p.geom, b.geom);`,

      'buffer-analysis': `-- Buffer Analysis with PostGIS

-- Create buffers around points
SELECT 
    id,
    name,
    ST_Buffer(geom, 1000) as buffer_1km
FROM schools;

-- Count features within buffers
WITH school_buffers AS (
    SELECT 
        id,
        name,
        ST_Buffer(geom, 1000) as buffer_geom
    FROM schools
)
SELECT 
    sb.name as school_name,
    COUNT(h.id) as houses_within_1km
FROM school_buffers sb
LEFT JOIN houses h ON ST_Within(h.geom, sb.buffer_geom)
GROUP BY sb.id, sb.name
ORDER BY houses_within_1km DESC;`,

      'spatial-indexes': `-- Spatial Indexing and Performance

-- Create spatial index
CREATE INDEX idx_buildings_geom ON buildings USING GIST (geom);

-- Analyze spatial data distribution
SELECT 
    ST_NumGeometries(geom) as num_parts,
    ST_GeometryType(geom) as geom_type,
    COUNT(*) as feature_count
FROM land_parcels
GROUP BY ST_NumGeometries(geom), ST_GeometryType(geom);

-- Spatial clustering analysis
SELECT 
    ST_ClusterDBSCAN(geom, 100, 5) OVER() as cluster_id,
    id,
    name
FROM retail_stores
ORDER BY cluster_id;`
    }
  };

  useEffect(() => {
    if (user && hasProfessionalAccess) {
      fetchSessions();
    }
    // Load default template
    loadTemplate('basic-geopandas');
  }, [user, hasProfessionalAccess, activeTab]);

  const fetchSessions = async () => {
    try {
      const { data } = await supabase
        .from('sandbox_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('session_type', activeTab)
        .order('updated_at', { ascending: false })
        .limit(10);

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const loadTemplate = (templateName: string) => {
    const template = codeTemplates[activeTab as keyof typeof codeTemplates]?.[templateName];
    if (template) {
      setCode(template);
      setSelectedTemplate(templateName);
    }
  };

  const runCode = async () => {
    setLoading(true);
    setOutput('Running code...\n');

    try {
      // Simulate code execution
      setTimeout(() => {
        if (activeTab === 'python') {
          setOutput(`>>> Code executed successfully!
Output:
Number of countries: 177
Largest country by area: Antarctica
Created raster with shape: (300, 300)
Min value: 0.01
Max value: 99.98
Mean value: 49.87

Distance between NYC and LA: 3944.42 km

✅ Execution completed in 2.3 seconds`);
        } else if (activeTab === 'earthengine') {
          setOutput(`Earth Engine Code Editor Output:
✅ NDVI calculation completed
✅ Layers added to map
📊 NDVI statistics: {"NDVI": 0.2847}
🗺️ Map centered on geometry`);
        } else if (activeTab === 'postgis') {
          setOutput(`PostGIS Query Results:
✅ Query executed successfully
📊 Found 23 administrative boundaries > 1M sq meters
🔍 Spatial index created successfully
⚡ Query completed in 145ms`);
        }
        setLoading(false);
      }, 2000);
    } catch (error) {
      setOutput(`Error: ${error}`);
      setLoading(false);
    }
  };

  const saveSession = async () => {
    if (!user || !hasProfessionalAccess) return;

    try {
      await supabase
        .from('sandbox_sessions')
        .insert({
          user_id: user.id,
          session_type: activeTab,
          code_content: code,
          output_data: output
        });

      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const loadSession = (session: SandboxSession) => {
    setCode(session.code_content);
    setOutput(session.output_data);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'python': return <Code className="h-4 w-4" />;
      case 'earthengine': return <Globe className="h-4 w-4" />;
      case 'postgis': return <Database className="h-4 w-4" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Terminal className="h-8 w-8 text-primary" />
          Live Sandbox Labs
        </h1>
        <p className="text-muted-foreground">
          Interactive code playgrounds for geospatial development and analysis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="python" className="flex items-center gap-2">
            {getTabIcon('python')}
            Python
            {!hasProfessionalAccess && ' (Basic)'}
          </TabsTrigger>
          <TabsTrigger value="earthengine" disabled={!hasProfessionalAccess} className="flex items-center gap-2">
            {getTabIcon('earthengine')}
            Earth Engine
            {!hasProfessionalAccess && ' 🔒'}
          </TabsTrigger>
          <TabsTrigger value="postgis" disabled={!hasProfessionalAccess} className="flex items-center gap-2">
            {getTabIcon('postgis')}
            PostGIS
            {!hasProfessionalAccess && ' 🔒'}
          </TabsTrigger>
        </TabsList>

        {availableTabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Code Editor */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getTabIcon(tab)}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Playground
                      </CardTitle>
                      <div className="flex gap-2">
                        <Select value={selectedTemplate} onValueChange={loadTemplate}>
                          <SelectTrigger className="w-[200px]">
                            <FileCode className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Load Template" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(codeTemplates[tab as keyof typeof codeTemplates] || {}).map((template) => (
                              <SelectItem key={template} value={template}>
                                {template.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <CardDescription>
                      Write and execute {tab} code with real-time output
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={`Enter your ${tab} code here...`}
                        className="min-h-[400px] font-mono text-sm"
                      />
                      
                      <div className="flex gap-2">
                        <Button onClick={runCode} disabled={loading}>
                          <Play className="h-4 w-4 mr-2" />
                          {loading ? 'Running...' : 'Run Code'}
                        </Button>
                        {hasProfessionalAccess && (
                          <Button variant="outline" onClick={saveSession}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Session
                          </Button>
                        )}
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Panel */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded-lg min-h-[200px] font-mono text-sm">
                      <pre className="whitespace-pre-wrap">{output || '// Output will appear here after running code'}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Environment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {tab === 'python' && (
                        <>
                          <div className="flex justify-between">
                            <span>Python:</span>
                            <Badge variant="outline">3.9.16</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>GeoPandas:</span>
                            <Badge variant="outline">0.13.2</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Rasterio:</span>
                            <Badge variant="outline">1.3.8</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>PyProj:</span>
                            <Badge variant="outline">3.6.0</Badge>
                          </div>
                        </>
                      )}
                      {tab === 'earthengine' && (
                        <>
                          <div className="flex justify-between">
                            <span>API Version:</span>
                            <Badge variant="outline">0.1.363</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Datasets:</span>
                            <Badge variant="outline">Latest</Badge>
                          </div>
                        </>
                      )}
                      {tab === 'postgis' && (
                        <>
                          <div className="flex justify-between">
                            <span>PostgreSQL:</span>
                            <Badge variant="outline">15.3</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>PostGIS:</span>
                            <Badge variant="outline">3.3.3</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Saved Sessions */}
                {hasProfessionalAccess && sessions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <Button
                            key={session.id}
                            variant="ghost"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => loadSession(session)}
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {new Date(session.updated_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.code_content.substring(0, 50)}...
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upgrade Prompt for Free Users */}
                {!hasProfessionalAccess && (
                  <UpgradePrompt 
                    feature="Full Lab Access"
                    description="Unlock Earth Engine, PostGIS sandboxes, session saving, and custom notebook environments."
                  />
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Labs;