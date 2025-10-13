import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalysisResultsProps {
  results: any[];
}

const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No analysis results yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Run an analysis to see results here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">Analysis Results</h2>
        <p className="text-xs text-muted-foreground">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
      </div>

      {results.map((result, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{result.tool}</CardTitle>
            <CardDescription className="text-xs">
              {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.result && (
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Output: </span>
                  <span className="font-medium">{result.result.name}</span>
                </div>
                
                {result.result.type && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Type: </span>
                    <span>{result.result.type}</span>
                  </div>
                )}

                {result.result.features_count !== undefined && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Features: </span>
                    <span>{result.result.features_count}</span>
                  </div>
                )}

                {result.result.metadata && (
                  <div className="p-2 bg-muted rounded text-xs">
                    <p className="font-medium mb-1">Metadata</p>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result.result.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisResults;