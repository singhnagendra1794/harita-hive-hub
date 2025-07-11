import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Upload, 
  Download, 
  Play, 
  Cpu, 
  Image, 
  Layers, 
  Target, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const GeoAIEngine = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(65);

  const pretrainedModels = [
    { id: 1, name: 'Land Classification', accuracy: '94%', description: 'Classify land use types from satellite imagery', status: 'ready' },
    { id: 2, name: 'Change Detection', accuracy: '91%', description: 'Detect temporal changes in land cover', status: 'ready' },
    { id: 3, name: 'Flood Prediction', accuracy: '89%', description: 'Predict flood risk areas using terrain and weather data', status: 'ready' },
    { id: 4, name: 'Object Extraction', accuracy: '96%', description: 'Extract buildings, roads, and infrastructure', status: 'ready' },
    { id: 5, name: 'Crop Monitoring', accuracy: '92%', description: 'Monitor crop health and yield estimation', status: 'ready' },
    { id: 6, name: 'Deforestation Detection', accuracy: '88%', description: 'Identify deforestation patterns over time', status: 'ready' },
  ];

  const trainingJobs = [
    { id: 1, name: 'Custom Land Use Model', progress: 85, status: 'training', startedAt: '2 hours ago', estimatedCompletion: '30 min' },
    { id: 2, name: 'Urban Growth Prediction', progress: 100, status: 'completed', startedAt: '1 day ago', estimatedCompletion: 'Completed' },
    { id: 3, name: 'Mining Site Detection', progress: 42, status: 'training', startedAt: '4 hours ago', estimatedCompletion: '2 hours' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Advanced GeoAI Engine</h1>
          <p className="text-xl text-muted-foreground">
            Pre-trained models and no-code AI training for geospatial intelligence
          </p>
          <Badge variant="secondary" className="mt-2">Enterprise Only</Badge>
        </div>

        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models">Pre-trained Models</TabsTrigger>
            <TabsTrigger value="training">Custom Training</TabsTrigger>
            <TabsTrigger value="inference">Inference Engine</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pretrainedModels.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {model.name}
                      </span>
                      <Badge variant="default">{model.accuracy}</Badge>
                    </CardTitle>
                    <CardDescription>{model.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Ready for inference</span>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full">Deploy Model</Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">API Docs</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance Metrics</CardTitle>
                <CardDescription>Comparative analysis of pre-trained models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">94.2%</div>
                      <div className="text-sm text-muted-foreground">Average Accuracy</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">1.2s</div>
                      <div className="text-sm text-muted-foreground">Avg Inference Time</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">2.4GB</div>
                      <div className="text-sm text-muted-foreground">Total Model Size</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Train Custom Model
                  </CardTitle>
                  <CardDescription>No-code interface for training custom AI models</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input placeholder="Custom Land Use Classifier" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Base Model</Label>
                    <select className="w-full p-2 border rounded">
                      <option>ResNet-50 (Image Classification)</option>
                      <option>U-Net (Semantic Segmentation)</option>
                      <option>YOLO (Object Detection)</option>
                      <option>Vision Transformer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Training Data</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Drop your training images here</p>
                      <p className="text-sm text-muted-foreground">Supports GeoTIFF, PNG, JPG formats</p>
                      <Button variant="outline" className="mt-2">Browse Files</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Epochs</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Learning Rate</Label>
                      <Input placeholder="0.001" />
                    </div>
                  </div>

                  <Button className="w-full" disabled={isTraining}>
                    {isTraining ? 'Training in Progress...' : 'Start Training'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Jobs</CardTitle>
                  <CardDescription>Monitor active and completed training jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingJobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{job.name}</h4>
                          <Badge variant={job.status === 'completed' ? 'default' : job.status === 'training' ? 'secondary' : 'destructive'}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Started: {job.startedAt}</span>
                            <span>ETA: {job.estimatedCompletion}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">View Logs</Button>
                          {job.status === 'completed' && (
                            <Button size="sm" variant="outline">Deploy Model</Button>
                          )}
                          {job.status === 'training' && (
                            <Button size="sm" variant="destructive">Stop Training</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inference" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Inference Engine
                </CardTitle>
                <CardDescription>Process imagery through deployed AI models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Model</Label>
                      <select className="w-full p-2 border rounded">
                        <option>Land Classification (94% accuracy)</option>
                        <option>Change Detection (91% accuracy)</option>
                        <option>Flood Prediction (89% accuracy)</option>
                        <option>Object Extraction (96% accuracy)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Input Imagery</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Upload satellite or aerial imagery</p>
                        <Button variant="outline" className="mt-2">Browse Files</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Processing Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="batch-process" defaultChecked />
                          <Label htmlFor="batch-process">Batch Processing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="confidence-scores" defaultChecked />
                          <Label htmlFor="confidence-scores">Include Confidence Scores</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="export-vectors" />
                          <Label htmlFor="export-vectors">Export as Vector Data</Label>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Processing
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Processing Queue</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Land_Cover_2024.tif</span>
                          <Badge variant="secondary">Processing</Badge>
                        </div>
                        <Progress value={75} className="mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Land Classification Model</span>
                          <span>2 min remaining</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Urban_Change_Analysis.tif</span>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Change Detection Model</span>
                          <span>3 min ago</span>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Download className="h-4 w-4 mr-2" />
                          Download Results
                        </Button>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Flood_Risk_Assessment.tif</span>
                          <Badge variant="outline">Queued</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Flood Prediction Model
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Models Deployed</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+3 this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Images Processed</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24,572</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">+2.1% improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2s</div>
                  <p className="text-xs text-muted-foreground">-0.3s faster</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Analysis Results</CardTitle>
                  <CardDescription>Latest AI model predictions and classifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Agricultural Land Detection</p>
                        <p className="text-sm text-muted-foreground">Punjab Region Analysis</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">96.5% Confidence</Badge>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Urban Growth Prediction</p>
                        <p className="text-sm text-muted-foreground">Delhi NCR Expansion</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">89.2% Confidence</Badge>
                        <p className="text-sm text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Flood Risk Assessment</p>
                        <p className="text-sm text-muted-foreground">Coastal Areas, Kerala</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">High Risk</Badge>
                        <p className="text-sm text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Trends</CardTitle>
                  <CardDescription>Accuracy and efficiency metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Performance analytics chart</p>
                      <p className="text-sm text-muted-foreground">Real-time model metrics visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Export & Integration</CardTitle>
                <CardDescription>Download results and integrate with external systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as GeoTIFF
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as Shapefile
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GeoAIEngine;