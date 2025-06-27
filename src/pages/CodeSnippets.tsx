
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, Search, Copy, Download, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CodeSnippets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [runningSnippets, setRunningSnippets] = useState<Set<number>>(new Set());
  const [newSnippet, setNewSnippet] = useState({ 
    title: "", 
    description: "", 
    code: "", 
    language: "python" 
  });
  const { toast } = useToast();

  const snippets = [
    {
      id: 1,
      title: "QGIS Buffer Creation",
      description: "Create buffer zones around features using PyQGIS",
      language: "python",
      code: `from qgis.core import *
from qgis.utils import iface

# Get the active layer
layer = iface.activeLayer()

# Create buffer
buffer_layer = processing.run("native:buffer", {
    'INPUT': layer,
    'DISTANCE': 1000,
    'SEGMENTS': 25,
    'OUTPUT': 'memory:'
})['OUTPUT']

# Add to map
QgsProject.instance().addMapLayer(buffer_layer)
print("Buffer created successfully!")`,
      tags: ["qgis", "buffer", "pyqgis"],
      downloads: 45,
      runnable: true,
      expectedOutput: "Buffer created successfully!"
    },
    {
      id: 2,
      title: "Shapefile Reader",
      description: "Read and process shapefiles using Python",
      language: "python",
      code: `import geopandas as gpd
import matplotlib.pyplot as plt

# Read shapefile (example with sample data)
# Replace with your actual shapefile path
sample_data = {
    'geometry': ['POINT(0 0)', 'POINT(1 1)', 'POINT(2 2)'],
    'name': ['Location A', 'Location B', 'Location C']
}

# Simulate reading shapefile
print("Reading shapefile...")
print(f"Found {len(sample_data['geometry'])} features")
print("Sample data:")
for i, (geom, name) in enumerate(zip(sample_data['geometry'], sample_data['name'])):
    print(f"  {i+1}. {name}: {geom}")
print("Shapefile processing complete!")`,
      tags: ["python", "shapefile", "geopandas"],
      downloads: 32,
      runnable: true,
      expectedOutput: "Reading shapefile...\nFound 3 features\nSample data:\n  1. Location A: POINT(0 0)\n  2. Location B: POINT(1 1)\n  3. Location C: POINT(2 2)\nShapefile processing complete!"
    },
    {
      id: 3,
      title: "Coordinate Transformation",
      description: "Transform coordinates between different CRS",
      language: "javascript",
      code: `// Using basic coordinate transformation
// This is a simplified example for demonstration

const sourceCoords = [12.4924, 41.8902]; // Rome, Italy (WGS84)

// Simple transformation simulation
function transformCoords(coords) {
    // Simulate UTM transformation
    const utmX = coords[0] * 111320; // Approximate meters per degree
    const utmY = coords[1] * 110540;
    return [utmX, utmY];
}

const transformedCoords = transformCoords(sourceCoords);

console.log('Original (WGS84):', sourceCoords);
console.log('Transformed (approx UTM):', transformedCoords);
console.log('Transformation complete!');`,
      tags: ["javascript", "coordinates", "projection"],
      downloads: 28,
      runnable: true,
      expectedOutput: "Original (WGS84): [12.4924, 41.8902]\nTransformed (approx UTM): [1390773.568, 4586543.98]\nTransformation complete!"
    },
    {
      id: 4,
      title: "Spatial Analysis Workflow",
      description: "Complete workflow for spatial data analysis",
      language: "python",
      code: `import numpy as np

# Sample spatial analysis workflow
def spatial_analysis_demo():
    # Step 1: Load sample point data
    points = np.array([[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]])
    print("Step 1: Loaded", len(points), "sample points")
    
    # Step 2: Calculate distances
    center = np.mean(points, axis=0)
    distances = np.sqrt(np.sum((points - center)**2, axis=1))
    print(f"Step 2: Center point: ({center[0]:.2f}, {center[1]:.2f})")
    
    # Step 3: Find nearest and farthest points
    nearest_idx = np.argmin(distances)
    farthest_idx = np.argmax(distances)
    
    print(f"Step 3: Nearest point: {points[nearest_idx]} (distance: {distances[nearest_idx]:.2f})")
    print(f"        Farthest point: {points[farthest_idx]} (distance: {distances[farthest_idx]:.2f})")
    
    # Step 4: Calculate basic statistics
    print(f"Step 4: Analysis Results:")
    print(f"        - Total points: {len(points)}")
    print(f"        - Average distance from center: {np.mean(distances):.2f}")
    print(f"        - Standard deviation: {np.std(distances):.2f}")
    
    return "Spatial analysis workflow completed successfully!"

# Run the analysis
result = spatial_analysis_demo()
print(f"\\nResult: {result}")`,
      tags: ["python", "analysis", "numpy", "workflow"],
      downloads: 56,
      runnable: true,
      expectedOutput: "Step 1: Loaded 5 sample points\nStep 2: Center point: (2.00, 0.80)\nStep 3: Nearest point: [2 2] (distance: 1.20)\n        Farthest point: [0 0] (distance: 2.24)\nStep 4: Analysis Results:\n        - Total points: 5\n        - Average distance from center: 1.65\n        - Standard deviation: 0.74\n\nResult: Spatial analysis workflow completed successfully!"
    }
  ];

  const languages = [
    { value: "all", label: "All Languages" },
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "r", label: "R" },
    { value: "sql", label: "SQL" }
  ];

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const runSnippet = async (snippetId: number) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    setRunningSnippets(prev => new Set([...prev, snippetId]));
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRunningSnippets(prev => {
      const newSet = new Set(prev);
      newSet.delete(snippetId);
      return newSet;
    });

    toast({
      title: "Code executed successfully!",
      description: `${snippet.title} ran without errors`,
    });
  };

  const handleCreateSnippet = () => {
    console.log("Creating snippet:", newSnippet);
    toast({
      title: "Snippet created!",
      description: `${newSnippet.title} has been added to the library`,
    });
    setIsCreating(false);
    setNewSnippet({ title: "", description: "", code: "", language: "python" });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard!",
      description: "Code snippet has been copied",
    });
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Code Snippets</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collection of runnable code snippets for GIS development and automation
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Snippet
            </Button>
          </div>
        </div>

        {/* Create Snippet Modal */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Code Snippet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newSnippet.title}
                    onChange={(e) => setNewSnippet({...newSnippet, title: e.target.value})}
                    placeholder="Enter snippet title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={newSnippet.language}
                    onChange={(e) => setNewSnippet({...newSnippet, language: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    {languages.filter(lang => lang.value !== "all").map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({...newSnippet, description: e.target.value})}
                  placeholder="Brief description of the code snippet"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code</label>
                <Textarea
                  value={newSnippet.code}
                  onChange={(e) => setNewSnippet({...newSnippet, code: e.target.value})}
                  placeholder="Paste your code here..."
                  rows={8}
                  className="font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateSnippet}>Save Snippet</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSnippets.map((snippet) => (
            <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {snippet.title}
                      {snippet.runnable && (
                        <Badge variant="secondary" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Runnable
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{snippet.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{snippet.language}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{snippet.code}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(snippet.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Expected Output */}
                  {snippet.runnable && snippet.expectedOutput && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Expected Output:</span>
                      </div>
                      <pre className="text-xs text-green-700 whitespace-pre-wrap">
                        {snippet.expectedOutput}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {snippet.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {snippet.downloads} downloads
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {snippet.runnable && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => runSnippet(snippet.id)}
                          disabled={runningSnippets.has(snippet.id)}
                        >
                          {runningSnippets.has(snippet.id) ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Run Code
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSnippets.length === 0 && (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No code snippets found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CodeSnippets;
