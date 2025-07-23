import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  MessageCircle, 
  Download, 
  Settings, 
  Play,
  Code,
  Brain,
  Sparkles,
  Send,
  HelpCircle,
  Lightbulb,
  FileText,
  Save,
  Share,
  Eye,
  Zap,
  Target
} from 'lucide-react';

interface RightSidebarProps {
  selectedModel: string;
  currentWorkflow: any;
  runningJobs: any[];
  onExport: (type: string, data: any) => void;
  onOpenChatbot: () => void;
}

const RightSidebar = ({ selectedModel, currentWorkflow, runningJobs, onExport, onOpenChatbot }: RightSidebarProps) => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [chatMessage, setChatMessage] = useState('');
  const [selectedExportFormat, setSelectedExportFormat] = useState('geojson');
  const [modelParameters, setModelParameters] = useState({
    confidence: [0.5],
    batchSize: [32],
    epochs: [10],
    learningRate: [0.001]
  });

  const quickQuestions = [
    "Which model is best for land cover classification?",
    "How to improve my model accuracy?",
    "What data preprocessing is needed?",
    "Explain the NDVI workflow results",
    "How to export results to QGIS?"
  ];

  const exportFormats = [
    { id: 'geojson', name: 'GeoJSON', description: 'Web-friendly vector format' },
    { id: 'shapefile', name: 'Shapefile', description: 'Industry standard vector format' },
    { id: 'geotiff', name: 'GeoTIFF', description: 'Georeferenced raster format' },
    { id: 'csv', name: 'CSV', description: 'Tabular data format' },
    { id: 'kml', name: 'KML', description: 'Google Earth format' },
    { id: 'pdf', name: 'PDF Report', description: 'Analysis summary document' }
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Open the main chatbot with the pre-filled question
    onOpenChatbot();
    setChatMessage('');
  };

  const handleQuickQuestion = (question: string) => {
    setChatMessage(question);
    // Auto-send the question
    setTimeout(() => {
      onOpenChatbot();
      setChatMessage('');
    }, 100);
  };

  const handleExport = () => {
    const exportData = {
      format: selectedExportFormat,
      timestamp: new Date().toISOString(),
      workflow: currentWorkflow?.title || 'Unnamed Workflow',
      layers: runningJobs.length
    };
    
    onExport(selectedExportFormat, exportData);
  };

  return (
    <div className="w-80 bg-[#1B263B] border-l border-[#43AA8B]/20 flex flex-col text-[#F9F9F9]">
      {/* Header */}
      <div className="p-4 border-b border-[#43AA8B]/20">
        <h3 className="text-lg font-semibold text-white mb-1">AI Assistant & Tools</h3>
        <p className="text-xs text-[#F9F9F9]/70">Get help and manage outputs</p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-[#0D1B2A] border-b border-[#43AA8B]/20 rounded-none justify-start">
          <TabsTrigger value="assistant" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
            <MessageCircle className="h-4 w-4 mr-2" />
            AVA
          </TabsTrigger>
          <TabsTrigger value="parameters" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
            <Settings className="h-4 w-4 mr-2" />
            Params
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* AI Assistant Tab */}
          <TabsContent value="assistant" className="m-0 h-full flex flex-col">
            <div className="p-4 space-y-4 flex-1">
              {/* AVA Status */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F4D35E]/10 rounded-full">
                      <Brain className="h-5 w-5 text-[#F4D35E]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">AVA Copilot</p>
                      <p className="text-xs text-[#F9F9F9]/70">Ready to assist with GeoAI</p>
                    </div>
                    <div className="ml-auto">
                      <div className="h-2 w-2 bg-[#43AA8B] rounded-full animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Questions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[#F4D35E]" />
                  Quick Questions
                </h4>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 border-[#43AA8B]/30 text-[#F9F9F9] hover:bg-[#43AA8B]/10 text-xs leading-relaxed"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0 text-[#43AA8B]" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Workflow Suggestions */}
              {currentWorkflow && (
                <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#F4D35E]" />
                      Smart Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-[#F9F9F9]/70 space-y-2">
                      <p>• Consider increasing batch size for faster processing</p>
                      <p>• Add data augmentation to improve accuracy</p>
                      <p>• Try ensemble methods for better results</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Tips */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-[#F9F9F9]/70 space-y-2">
                    <p>• Use cloud masking for better satellite imagery analysis</p>
                    <p>• Normalize your data before training ML models</p>
                    <p>• Validate results with ground truth data</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#43AA8B]/20">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask AVA about your GeoAI workflow..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 min-h-[80px] bg-[#0D1B2A] border-[#43AA8B]/30 text-[#F9F9F9] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-[#F4D35E] hover:bg-[#F4D35E]/90 text-[#0D1B2A] self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="m-0 h-full">
            <div className="p-4 space-y-4">
              {/* Model Parameters */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Model Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-[#F9F9F9]/70">Confidence Threshold</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Slider
                        value={modelParameters.confidence}
                        onValueChange={(value) => setModelParameters(prev => ({ ...prev, confidence: value }))}
                        max={1}
                        min={0}
                        step={0.01}
                        className="flex-1"
                      />
                      <span className="text-xs text-[#F9F9F9] w-12">{modelParameters.confidence[0].toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-[#F9F9F9]/70">Batch Size</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Slider
                        value={modelParameters.batchSize}
                        onValueChange={(value) => setModelParameters(prev => ({ ...prev, batchSize: value }))}
                        max={128}
                        min={8}
                        step={8}
                        className="flex-1"
                      />
                      <span className="text-xs text-[#F9F9F9] w-12">{modelParameters.batchSize[0]}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-[#F9F9F9]/70">Epochs</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Slider
                        value={modelParameters.epochs}
                        onValueChange={(value) => setModelParameters(prev => ({ ...prev, epochs: value }))}
                        max={100}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-[#F9F9F9] w-12">{modelParameters.epochs[0]}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-[#F9F9F9]/70">Learning Rate</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Slider
                        value={modelParameters.learningRate}
                        onValueChange={(value) => setModelParameters(prev => ({ ...prev, learningRate: value }))}
                        max={0.01}
                        min={0.0001}
                        step={0.0001}
                        className="flex-1"
                      />
                      <span className="text-xs text-[#F9F9F9] w-12">{modelParameters.learningRate[0].toFixed(4)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Options */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Processing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Use GPU Acceleration</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Data Augmentation</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Cloud Masking</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Auto-preprocessing</Label>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Apply Button */}
              <Button className="w-full bg-[#43AA8B] hover:bg-[#43AA8B]/90">
                <Play className="h-4 w-4 mr-2" />
                Apply Parameters
              </Button>
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="m-0 h-full">
            <div className="p-4 space-y-4">
              {/* Export Format Selection */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Export Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedExportFormat} onValueChange={setSelectedExportFormat}>
                    <SelectTrigger className="bg-[#1B263B] border-[#43AA8B]/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1B263B] border-[#43AA8B]/30">
                      {exportFormats.map(format => (
                        <SelectItem key={format.id} value={format.id} className="text-[#F9F9F9]">
                          <div>
                            <div className="font-medium">{format.name}</div>
                            <div className="text-xs text-[#F9F9F9]/50">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Include Metadata</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Compress Output</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#F9F9F9]/70">Include Analysis Report</Label>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Export Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-[#F4D35E] hover:bg-[#F4D35E]/90 text-[#0D1B2A]"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="border-[#43AA8B]/50 text-[#43AA8B]">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#43AA8B]/50 text-[#43AA8B]">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Export History */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Recent Exports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-[#F9F9F9]/50 text-center py-4">
                    No recent exports
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RightSidebar;