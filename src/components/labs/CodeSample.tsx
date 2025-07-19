import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Download, 
  Play, 
  FileText, 
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Code2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CodeSampleProps {
  title: string;
  description: string;
  useCase: string;
  code: string;
  datasets: string[];
  environments: Record<string, string>;
  language: 'python' | 'javascript' | 'sql';
  onCopyCode: (code: string) => void;
  onDownloadDataset: (dataset: string) => void;
}

const CodeSample: React.FC<CodeSampleProps> = ({
  title,
  description,
  useCase,
  code,
  datasets,
  environments,
  language,
  onCopyCode,
  onDownloadDataset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const getLanguageColor = () => {
    switch (language) {
      case 'python': return 'text-blue-600';
      case 'javascript': return 'text-yellow-600';
      case 'sql': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case 'python': return '🐍';
      case 'javascript': return '🟨';
      case 'sql': return '🗄️';
      default: return '💻';
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getLanguageIcon()}</span>
              <CardTitle className="text-xl">{title}</CardTitle>
              <Badge variant="outline" className={getLanguageColor()}>
                {language.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{description}</p>
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Use Case:</span>
              <span className="text-muted-foreground">{useCase}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyCode(code)}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            {language === 'python' && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRunCode}
                disabled={isRunning}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Code Block */}
        <div className="relative">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{title.toLowerCase().replace(/\s+/g, '_')}.{language === 'javascript' ? 'js' : language === 'sql' ? 'sql' : 'py'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Environment Requirements */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="font-medium">Environment Requirements</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(environments).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium">{key}:</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Sample Datasets */}
        {datasets.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sample Datasets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {datasets.map((dataset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadDataset(dataset)}
                  className="gap-2 justify-start"
                >
                  <Download className="h-4 w-4" />
                  {dataset}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Execution Output (for Python) */}
        {isRunning && language === 'python' && (
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="animate-pulse">
              $ python {title.toLowerCase().replace(/\s+/g, '_')}.py<br/>
              Loading required libraries...<br/>
              Processing data...<br/>
              <span className="text-yellow-400">⚡ Executing analysis...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeSample;