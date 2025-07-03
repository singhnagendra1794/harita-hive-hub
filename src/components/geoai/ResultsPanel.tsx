
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Download, Trash2, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GeoData, AnalysisResult } from '../../pages/GeoAILab';

interface ResultsPanelProps {
  results: AnalysisResult[];
  uploadedData: GeoData[];
  onDataToggle: (id: string) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  uploadedData,
  onDataToggle
}) => {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const getStatusIcon = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDataTypeIcon = (type: GeoData['type']) => {
    switch (type) {
      case 'vector': return '📍';
      case 'raster': return '🗺️';
      case 'satellite': return '🛰️';
      default: return '📄';
    }
  };

  return (
    <div className="h-full p-4">
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results" className="text-xs">Results</TabsTrigger>
          <TabsTrigger value="layers" className="text-xs">Layers</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Analysis Results ({results.length})</CardTitle>
              <CardDescription className="text-xs">
                Recent analysis outputs and processing status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No analysis results yet. Run some spatial analysis tools to see results here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedResult === result.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(result.status)}
                            <span className="font-medium text-sm truncate">{result.tool}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Input: {result.input}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {selectedResult === result.id && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <div className="text-xs">
                            <strong>Parameters:</strong>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.parameters, null, 2)}
                            </pre>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.output.format}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Layers ({uploadedData.length})</CardTitle>
              <CardDescription className="text-xs">
                Manage visibility and properties of data layers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {uploadedData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📂</div>
                  <p className="text-sm text-muted-foreground">
                    No data layers yet. Upload some geospatial data to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedData.map((data) => (
                    <div
                      key={data.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm">{getDataTypeIcon(data.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{data.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {data.format} • {data.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          onClick={() => onDataToggle(data.id)}
                        >
                          {data.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-1 h-6 w-6 text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Processing Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{results.length}</div>
                    <div className="text-xs text-muted-foreground">Total Analyses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {results.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{uploadedData.length}</div>
                    <div className="text-xs text-muted-foreground">Data Layers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">
                      {uploadedData.filter(d => d.visible).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Visible</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Data Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vector Data</span>
                    <Badge variant="secondary">
                      {uploadedData.filter(d => d.type === 'vector').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Raster Data</span>
                    <Badge variant="secondary">
                      {uploadedData.filter(d => d.type === 'raster').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satellite Data</span>
                    <Badge variant="secondary">
                      {uploadedData.filter(d => d.type === 'satellite').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsPanel;
