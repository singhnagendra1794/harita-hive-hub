
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BufferAnalysis from "../components/spatial/BufferAnalysis";
import SpatialJoinTool from "../components/spatial/SpatialJoinTool";
import HeatmapTool from "../components/spatial/HeatmapTool";
import NetworkAnalysis from "../components/spatial/NetworkAnalysis";

const SpatialAnalysis = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };
  
  const renderSelectedTool = () => {
    switch(selectedTool) {
      case "buffer":
        return <BufferAnalysis />;
      case "spatial-join":
        return <SpatialJoinTool />;
      case "heatmap":
        return <HeatmapTool />;
      case "network":
        return <NetworkAnalysis />;
      default:
        return null;
    }
  };

  const tools = [
    {
      id: "buffer",
      title: "Buffer Analysis",
      description: "Create buffer zones around points, lines, or polygons to analyze proximity.",
      complexity: "Basic"
    },
    {
      id: "spatial-join",
      title: "Spatial Join",
      description: "Combine attributes from multiple datasets based on spatial relationships.",
      complexity: "Intermediate"
    },
    {
      id: "heatmap",
      title: "Heatmap Generation",
      description: "Create density maps to visualize concentrated areas of point data.",
      complexity: "Basic"
    },
    {
      id: "network",
      title: "Network Analysis",
      description: "Calculate optimal routes, service areas, and connectivity metrics.",
      complexity: "Advanced"
    },
    {
      id: "interpolation",
      title: "Spatial Interpolation",
      description: "Predict values at unmeasured locations using methods like IDW and Kriging.",
      complexity: "Advanced"
    },
    {
      id: "cluster",
      title: "Cluster Analysis",
      description: "Identify statistically significant spatial clusters in your data.",
      complexity: "Advanced"
    }
  ];
  
  return (
    <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">QGIS Processing Tools</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Powerful QGIS processing tools for analyzing and visualizing geospatial data, with integrations for Python, SQL, and other analysis platforms.
        </p>
        
        {selectedTool ? (
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTool(null)}
              className="mb-4"
            >
              ← Back to all tools
            </Button>
            {renderSelectedTool()}
          </div>
        ) : (
          <Tabs defaultValue="tools">
            <TabsList className="mb-6">
              <TabsTrigger value="tools">Processing Tools</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <Card key={tool.id}>
                    <CardHeader>
                      <CardTitle>{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-sm ${
                          tool.complexity === "Basic" ? "bg-green-100 text-green-800" :
                          tool.complexity === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {tool.complexity}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleToolSelect(tool.id)}
                          disabled={tool.id !== "buffer" && tool.id !== "spatial-join" && tool.id !== "heatmap" && tool.id !== "network"}
                        >
                          Try Tool
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="integrations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Python Integration</CardTitle>
                    <CardDescription>Connect your QGIS processing workflows with Python</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Integrate with popular Python libraries:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>GeoPandas for vector data operations</li>
                      <li>Rasterio for raster data processing</li>
                      <li>Shapely for geometry operations</li>
                      <li>PySAL for spatial statistics</li>
                      <li>QGIS Python API (PyQGIS)</li>
                    </ul>
                    <Button className="mt-4">Connect Python</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>SQL Integration</CardTitle>
                    <CardDescription>Perform spatial queries with PostGIS and SQL</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Execute spatial SQL queries with:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>PostGIS spatial functions</li>
                      <li>Spatial indexing for performance</li>
                      <li>Complex spatial relationships</li>
                      <li>Spatial aggregation</li>
                    </ul>
                    <Button className="mt-4">Connect SQL Database</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Excel & CSV Integration</CardTitle>
                    <CardDescription>Work with tabular data in familiar formats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Import and export spatial data with:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>CSV with coordinate columns</li>
                      <li>Excel workbooks with spatial data</li>
                      <li>Automatic geocoding of addresses</li>
                      <li>Direct visualization of tabular data</li>
                    </ul>
                    <Button className="mt-4">Upload Spreadsheet</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>BI Tool Integration</CardTitle>
                    <CardDescription>Connect with PowerBI, Tableau and other visualization tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Enhance your business intelligence with:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>PowerBI spatial visualizations</li>
                      <li>Tableau map layers and analysis</li>
                      <li>Custom geospatial dashboards</li>
                      <li>Real-time data connections</li>
                    </ul>
                    <Button className="mt-4">Connect BI Tool</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="examples">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Transportation Accessibility",
                    description: "Analyzing accessibility to public transportation using network analysis.",
                    tools: "Network Analysis, Python"
                  },
                  {
                    title: "Real Estate Market Analysis",
                    description: "Examining property values based on spatial factors and neighborhood characteristics.",
                    tools: "Spatial Regression, SQL"
                  },
                  {
                    title: "Environmental Impact Assessment",
                    description: "Evaluating potential environmental impacts of proposed development projects.",
                    tools: "Overlay Analysis, PowerBI"
                  },
                  {
                    title: "Customer Catchment Analysis",
                    description: "Determining service areas and potential customer reach for retail locations.",
                    tools: "Heatmap, Tableau"
                  },
                  {
                    title: "Public Health Monitoring",
                    description: "Mapping disease prevalence and identifying spatial patterns in health data.",
                    tools: "Cluster Analysis, Python"
                  },
                  {
                    title: "Utility Network Optimization",
                    description: "Optimizing utility infrastructure placement and maintenance scheduling.",
                    tools: "Network Analysis, SQL"
                  }
                ].map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{example.title}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="bg-accent/30 px-2 py-1 rounded text-sm">
                          {example.tools}
                        </span>
                        <Button variant="outline" size="sm">View Example</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
  );
};

export default SpatialAnalysis;
