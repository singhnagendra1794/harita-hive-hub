
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BasemapSwitcher, { BasemapOption, basemapOptions } from './BasemapSwitcher';
import LayerControl, { Layer } from './LayerControl';
import QGISProjectUploader, { QGISProject } from './QGISProjectUploader';
import GISAnalysisTools from './GISAnalysisTools';

const AdvancedMapPlayground = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [currentBasemap, setCurrentBasemap] = useState('osm');
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'basemap',
      name: 'OpenStreetMap',
      type: 'basemap',
      visible: true,
      opacity: 1.0
    },
    {
      id: 'buildings',
      name: 'Building Footprints',
      type: 'vector',
      visible: true,
      opacity: 0.8,
      features: 1245,
      style: 'polygon-fill'
    },
    {
      id: 'roads',
      name: 'Road Network',
      type: 'vector',
      visible: true,
      opacity: 0.9,
      features: 567,
      style: 'line-stroke'
    },
    {
      id: 'elevation',
      name: 'Digital Elevation Model',
      type: 'raster',
      visible: false,
      opacity: 0.6
    }
  ]);
  const { toast } = useToast();

  const handleBasemapChange = (basemap: BasemapOption) => {
    setCurrentBasemap(basemap.id);
    
    // Update basemap layer
    setLayers(layers.map(layer => 
      layer.type === 'basemap' 
        ? { ...layer, name: basemap.name }
        : layer
    ));
    
    toast({
      title: "Basemap Changed",
      description: `Switched to ${basemap.name}`,
    });
  };

  const handleLayerToggle = (layerId: string) => {
    setLayers(layers.map(layer =>
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayers(layers.map(layer =>
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  };

  const handleQGISProjectSelect = (project: QGISProject) => {
    // Simulate loading QGIS project layers
    const newLayers: Layer[] = Array.from({ length: project.layers }, (_, i) => ({
      id: `qgis-${project.id}-layer-${i}`,
      name: `${project.name} Layer ${i + 1}`,
      type: Math.random() > 0.5 ? 'vector' : 'raster',
      visible: true,
      opacity: 0.8,
      features: Math.floor(Math.random() * 1000) + 100
    }));

    setLayers([...layers, ...newLayers]);
    
    toast({
      title: "QGIS Project Loaded",
      description: `${project.name} with ${project.layers} layers has been added to the map.`,
    });
  };

  const handleAnalysisRun = (tool: string, params: any) => {
    console.log(`Running ${tool} analysis with params:`, params);
    // Analysis results would be processed here
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden"
      >
        {/* Enhanced Map Visualization */}
        <div className="absolute inset-0 bg-blue-50">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="advanced-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#advanced-grid)" />
              
              {/* Simulate some geographic features */}
              <circle cx="200" cy="150" r="30" fill="#3b82f6" opacity="0.6" />
              <circle cx="400" cy="200" r="20" fill="#ef4444" opacity="0.6" />
              <circle cx="600" cy="180" r="25" fill="#22c55e" opacity="0.6" />
              
              {/* Simulate road network */}
              <path d="M 0 200 Q 200 150 400 200 T 800 180" stroke="#64748b" strokeWidth="3" fill="none" opacity="0.7" />
              <path d="M 300 0 L 350 400" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.7" />
            </svg>
          </div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center z-5">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-muted-foreground mb-2">Advanced Web GIS Platform</h3>
            <p className="text-sm text-muted-foreground mb-4">
              QGIS-powered mapping with {layers.filter(l => l.visible).length} active layers
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">Zoom to Extent</Button>
              <Button variant="outline" size="sm">Identify Features</Button>
              <Button variant="outline" size="sm">Measure Tool</Button>
            </div>
          </div>
        </div>

        {/* Feature indicators for visible layers */}
        {layers.filter(layer => layer.visible && layer.features).map((layer, index) => (
          <div
            key={layer.id}
            className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
            style={{
              left: `${20 + (index * 12) % 70}%`,
              top: `${25 + (index * 8) % 50}%`,
              opacity: layer.opacity
            }}
            title={`${layer.name} - ${layer.features} features`}
          />
        ))}
      </div>

      {/* UI Controls */}
      <BasemapSwitcher 
        currentBasemap={currentBasemap}
        onBasemapChange={handleBasemapChange}
      />
      
      <LayerControl
        layers={layers}
        onLayerToggle={handleLayerToggle}
        onOpacityChange={handleOpacityChange}
      />

      {/* Bottom Panel with Tabs */}
      <div className="absolute bottom-4 right-4 left-96 z-10">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">QGIS Projects</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Tools</TabsTrigger>
            <TabsTrigger value="export">Export & Share</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-2">
            <Card>
              <CardContent className="p-4">
                <QGISProjectUploader onProjectSelect={handleQGISProjectSelect} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-2">
            <Card>
              <CardContent className="p-4">
                <GISAnalysisTools onAnalysisRun={handleAnalysisRun} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="mt-2">
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <h3 className="font-medium mb-2">Export & Share Options</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export maps, share projects, and download analysis results
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">Export PDF</Button>
                    <Button variant="outline" size="sm">Share Link</Button>
                    <Button variant="outline" size="sm">Download Data</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedMapPlayground;
