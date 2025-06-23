
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, Search, Copy, Download, Play } from "lucide-react";
import { useState } from "react";

const CodeSnippets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ 
    title: "", 
    description: "", 
    code: "", 
    language: "python" 
  });

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
QgsProject.instance().addMapLayer(buffer_layer)`,
      tags: ["qgis", "buffer", "pyqgis"],
      downloads: 45
    },
    {
      id: 2,
      title: "Shapefile Reader",
      description: "Read and process shapefiles using Python",
      language: "python",
      code: `import geopandas as gpd
import matplotlib.pyplot as plt

# Read shapefile
gdf = gpd.read_file('path/to/your/shapefile.shp')

# Display basic info
print(gdf.head())
print(gdf.crs)

# Plot the data
gdf.plot(figsize=(10, 10))
plt.title('Shapefile Visualization')
plt.show()`,
      tags: ["python", "shapefile", "geopandas"],
      downloads: 32
    },
    {
      id: 3,
      title: "Coordinate Transformation",
      description: "Transform coordinates between different CRS",
      language: "javascript",
      code: `// Using Proj4js for coordinate transformation
const proj4 = require('proj4');

// Define source and target projections
const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
const utm = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';

// Transform coordinates
const sourceCoords = [12.4924, 41.8902]; // Rome, Italy
const transformedCoords = proj4(wgs84, utm, sourceCoords);

console.log('Original:', sourceCoords);
console.log('Transformed:', transformedCoords);`,
      tags: ["javascript", "coordinates", "projection"],
      downloads: 28
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

  const handleCreateSnippet = () => {
    console.log("Creating snippet:", newSnippet);
    setIsCreating(false);
    setNewSnippet({ title: "", description: "", code: "", language: "python" });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Code Snippets</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collection of useful code snippets for GIS development and automation
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
                    <CardTitle className="text-lg">{snippet.title}</CardTitle>
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
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
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
