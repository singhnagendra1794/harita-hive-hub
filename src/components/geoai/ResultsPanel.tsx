
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Download, Eye, EyeOff, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsPanelProps {
  results: any[];
  uploadedData: any[];
  onDataToggle: (id: string) => void;
}

const ResultsPanel = ({ results, uploadedData, onDataToggle }: ResultsPanelProps) => {
  const { toast } = useToast();

  const downloadResult = (result: any) => {
    toast({
      title: "Download started",
      description: `Downloading ${result.output.name}...`,
    });
    // In real implementation, this would trigger actual download
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Layer Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Layers</CardTitle>
          <CardDescription className="text-xs">
            Toggle layer visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {uploadedData.map((data) => (
                <div key={data.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-xs font-medium">{data.name}</span>
                  </div>
                  <Switch
                    checked={data.visible}
                    onCheckedChange={() => onDataToggle(data.id)}
                    size="sm"
                  />
                </div>
              ))}
              {uploadedData.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No data uploaded yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Analysis Results</CardTitle>
          <CardDescription className="text-xs">
            View and download processed data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={result.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="text-xs font-medium">{result.tool}</p>
                          <p className="text-xs text-muted-foreground">
                            Input: {result.input}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleString()}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDataToggle(result.output.id)}
                          disabled={result.status !== 'completed'}
                        >
                          {result.output.visible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadResult(result)}
                          disabled={result.status !== 'completed'}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < results.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No analysis results yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analysis History Summary */}
      {results.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">
                  {results.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-600">
                  {results.filter(r => r.status === 'processing').length}
                </p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsPanel;
