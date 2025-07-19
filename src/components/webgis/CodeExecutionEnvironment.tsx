import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Play, 
  Square, 
  Save, 
  FolderOpen, 
  Download, 
  Terminal, 
  FileText,
  Settings,
  Package,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Plus,
  Copy,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeExecutionEnvironmentProps {
  projectId: string;
}

const CodeExecutionEnvironment: React.FC<CodeExecutionEnvironmentProps> = ({ projectId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const languages = [
    { 
      id: 'python', 
      name: 'Python', 
      icon: '🐍',
      defaultCode: `# Python GIS Analysis Example
import geopandas as gpd
import matplotlib.pyplot as plt

# Load your geospatial data
# gdf = gpd.read_file('your_data.geojson')

print("Welcome to WebGIS Python Environment!")
print("Available libraries: pandas, geopandas, matplotlib, numpy, scipy")

# Example analysis
data = [1, 2, 3, 4, 5]
result = sum(data) / len(data)
print(f"Average: {result}")`,
      packages: ['pandas', 'geopandas', 'matplotlib', 'numpy', 'scipy', 'rasterio']
    },
    { 
      id: 'javascript', 
      name: 'JavaScript', 
      icon: '🟨',
      defaultCode: `// JavaScript GIS Analysis Example
console.log("Welcome to WebGIS JavaScript Environment!");

// Example geospatial calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
console.log(\`Distance between NYC and LA: \${distance.toFixed(2)} km\`);`,
      packages: ['leaflet', 'turf', 'd3', 'proj4', 'geojson']
    },
    { 
      id: 'r', 
      name: 'R', 
      icon: '📊',
      defaultCode: `# R GIS Analysis Example
library(sf)
library(ggplot2)

print("Welcome to WebGIS R Environment!")
print("Available packages: sf, ggplot2, dplyr, sp, raster")

# Example spatial analysis
coords <- data.frame(
  x = c(-74.0060, -118.2437),
  y = c(40.7128, 34.0522),
  city = c("NYC", "LA")
)

print("Sample coordinates:")
print(coords)

# Calculate simple statistics
mean_x <- mean(coords$x)
mean_y <- mean(coords$y)
cat("Center point:", mean_x, ",", mean_y, "\\n")`,
      packages: ['sf', 'ggplot2', 'dplyr', 'sp', 'raster', 'leaflet']
    }
  ];

  const examples = [
    {
      title: 'Calculate Area',
      description: 'Calculate the area of a polygon',
      language: 'python',
      code: `import math

# Example: Calculate area of a simple polygon (square)
def calculate_polygon_area(coordinates):
    # Simple shoelace formula for polygon area
    n = len(coordinates)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += coordinates[i][0] * coordinates[j][1]
        area -= coordinates[j][0] * coordinates[i][1]
    return abs(area) / 2.0

# Square with side length 100 meters
square_coords = [(0, 0), (100, 0), (100, 100), (0, 100)]
area = calculate_polygon_area(square_coords)
print(f"Area: {area} square meters")`
    },
    {
      title: 'Distance Calculation',
      description: 'Calculate distance between two points',
      language: 'javascript',
      code: `// Haversine formula for great-circle distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Example usage
const distance = haversineDistance(40.7128, -74.0060, 34.0522, -118.2437);
console.log(\`Distance: \${distance.toFixed(2)} km\`);`
    },
    {
      title: 'Spatial Join',
      description: 'Join spatial data based on location',
      language: 'r',
      code: `# Example spatial join in R
library(sf)

# Create sample points
points <- data.frame(
  id = 1:3,
  x = c(-74.0060, -118.2437, -87.6298),
  y = c(40.7128, 34.0522, 41.8781),
  name = c("NYC", "LA", "Chicago")
)

# Convert to sf object
points_sf <- st_as_sf(points, coords = c("x", "y"), crs = 4326)

print("Sample points created:")
print(points_sf)

# Calculate distances between points
distances <- st_distance(points_sf)
print("Distance matrix:")
print(distances)`
    }
  ];

  useEffect(() => {
    const currentLang = languages.find(lang => lang.id === selectedLanguage);
    if (currentLang && !code) {
      setCode(currentLang.defaultCode);
    }
  }, [selectedLanguage]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code to Execute",
        description: "Please write some code before running.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setOutput([]);

    // Simulate code execution
    const executionSteps = [
      { type: 'info', message: `Starting ${selectedLanguage} execution...`, timestamp: new Date() },
      { type: 'info', message: 'Loading required packages...', timestamp: new Date() },
    ];

    for (const step of executionSteps) {
      setOutput(prev => [...prev, step]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock execution results based on language
    const mockResults = {
      python: [
        { type: 'success', message: 'Welcome to WebGIS Python Environment!', timestamp: new Date() },
        { type: 'success', message: 'Available libraries: pandas, geopandas, matplotlib, numpy, scipy', timestamp: new Date() },
        { type: 'success', message: 'Average: 3.0', timestamp: new Date() },
      ],
      javascript: [
        { type: 'success', message: 'Welcome to WebGIS JavaScript Environment!', timestamp: new Date() },
        { type: 'success', message: 'Distance between NYC and LA: 3944.42 km', timestamp: new Date() },
      ],
      r: [
        { type: 'success', message: 'Welcome to WebGIS R Environment!', timestamp: new Date() },
        { type: 'success', message: 'Available packages: sf, ggplot2, dplyr, sp, raster', timestamp: new Date() },
        { type: 'success', message: 'Center point: -96.1249 , 37.3325', timestamp: new Date() },
      ]
    };

    setOutput(prev => [...prev, ...mockResults[selectedLanguage as keyof typeof mockResults]]);
    setIsRunning(false);

    toast({
      title: "Code Executed Successfully",
      description: `${selectedLanguage} code completed execution.`,
    });
  };

  const handleStopExecution = () => {
    setIsRunning(false);
    setOutput(prev => [...prev, { 
      type: 'warning', 
      message: 'Execution stopped by user', 
      timestamp: new Date() 
    }]);
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const loadExample = (example: any) => {
    setSelectedLanguage(example.language);
    setCode(example.code);
    toast({
      title: "Example Loaded",
      description: example.title,
    });
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Terminal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Code Execution Environment</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Run Python, JavaScript, and R code for geospatial analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      <span className="flex items-center gap-2">
                        <span>{lang.icon}</span>
                        {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={isRunning ? handleStopExecution : handleRunCode}
                variant={isRunning ? "destructive" : "default"}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Square className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Code Editor</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  <Button size="sm" variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="bg-muted p-2 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {languages.find(l => l.id === selectedLanguage)?.icon}
                      {languages.find(l => l.id === selectedLanguage)?.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {isRunning ? 'Running' : 'Ready'}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCode(languages.find(l => l.id === selectedLanguage)?.defaultCode || '')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm bg-background resize-none focus:outline-none"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Output Console */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Output Console
                </CardTitle>
                <Button size="sm" variant="outline" onClick={handleClearOutput}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                {output.length === 0 ? (
                  <p className="text-muted-foreground">No output yet. Run your code to see results.</p>
                ) : (
                  output.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 mb-1">
                      {getOutputIcon(item.type)}
                      <span className="flex-1">{item.message}</span>
                      <span className="text-xs opacity-60">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Language Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Available Packages</h4>
                <div className="flex flex-wrap gap-1">
                  {languages.find(l => l.id === selectedLanguage)?.packages.map((pkg) => (
                    <Badge key={pkg} variant="outline" className="text-xs">
                      {pkg}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span>12.5 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Execution Time:</span>
                  <span>{isRunning ? 'Running...' : '0.32s'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={isRunning ? "default" : "secondary"}>
                    {isRunning ? 'Running' : 'Idle'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Code Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                     onClick={() => loadExample(example)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{example.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {languages.find(l => l.id === example.language)?.icon}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{example.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodeExecutionEnvironment;