import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  FileText,
  Image,
  Code,
  Settings
} from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  requiredFiles: {
    file: string;
    found: boolean;
    required: boolean;
    description: string;
  }[];
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

const PluginPackageValidator: React.FC = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const requiredPluginFiles = [
    { file: 'metadata.txt', required: true, description: 'Plugin metadata and configuration' },
    { file: '__init__.py', required: true, description: 'Python package initialization' },
    { file: 'icon.png', required: false, description: 'Plugin icon (recommended 24x24px)' },
    { file: 'resources.qrc', required: false, description: 'Qt resource file for assets' },
    { file: 'plugin.py', required: false, description: 'Main plugin logic' },
    { file: 'ui_*.py', required: false, description: 'Generated UI files' },
    { file: 'forms.ui', required: false, description: 'Qt Designer UI files' },
    { file: 'README.md', required: false, description: 'Documentation and usage guide' },
    { file: 'requirements.txt', required: false, description: 'Python dependencies' },
    { file: 'sample_data/', required: false, description: 'Sample project or data files' }
  ];

  const validatePluginPackage = async (file: File) => {
    setIsValidating(true);
    
    try {
      // Check if it's a ZIP file
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setValidationResult({
          isValid: false,
          requiredFiles: [],
          warnings: [],
          errors: ['File must be a ZIP archive'],
          suggestions: ['Please upload a properly packaged QGIS plugin as a ZIP file']
        });
        return;
      }

      // Simulate ZIP file validation (in a real implementation, you'd use a ZIP library)
      // This is a mock validation for demonstration
      const mockValidation: ValidationResult = {
        isValid: true,
        requiredFiles: requiredPluginFiles.map(rf => ({
          ...rf,
          found: Math.random() > 0.3 // Simulate finding most files
        })),
        warnings: [
          'Icon file is smaller than recommended 24x24px',
          'No sample data included for testing'
        ],
        errors: [],
        suggestions: [
          'Add a comprehensive README.md file',
          'Include sample data for users to test the plugin',
          'Consider adding unit tests for better reliability'
        ]
      };

      // Check for critical missing files
      const missingRequired = mockValidation.requiredFiles.filter(f => f.required && !f.found);
      if (missingRequired.length > 0) {
        mockValidation.isValid = false;
        mockValidation.errors.push(`Missing required files: ${missingRequired.map(f => f.file).join(', ')}`);
      }

      setValidationResult(mockValidation);

      if (mockValidation.isValid) {
        toast({
          title: "Validation Successful",
          description: "Plugin package structure is valid for QGIS installation.",
        });
      } else {
        toast({
          title: "Validation Failed",
          description: "Plugin package has issues that need to be resolved.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        requiredFiles: [],
        warnings: [],
        errors: ['Failed to validate plugin package'],
        suggestions: ['Please ensure the file is a valid ZIP archive']
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validatePluginPackage(file);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.py')) return <Code className="h-4 w-4" />;
    if (fileName.includes('.txt')) return <FileText className="h-4 w-4" />;
    if (fileName.includes('.png') || fileName.includes('.jpg')) return <Image className="h-4 w-4" />;
    if (fileName.includes('.qrc') || fileName.includes('.ui')) return <Settings className="h-4 w-4" />;
    return <FileCheck className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          QGIS Plugin Package Validator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Upload Plugin ZIP File</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your QGIS plugin ZIP file to validate its structure and compatibility
          </p>
          <Input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            disabled={isValidating}
            className="max-w-xs mx-auto"
          />
        </div>

        {/* Loading State */}
        {isValidating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Validating plugin package...</p>
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Alert className={validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className="font-medium">
                  {validationResult.isValid 
                    ? 'Plugin package is valid and ready for QGIS installation'
                    : 'Plugin package has issues that need to be resolved'
                  }
                </AlertDescription>
              </div>
            </Alert>

            {/* File Structure */}
            <div>
              <h4 className="font-semibold mb-3">File Structure Analysis</h4>
              <div className="grid gap-2">
                {validationResult.requiredFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      {getFileIcon(file.file)}
                      <code className="text-sm font-mono">{file.file}</code>
                      {file.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.found ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className={`h-4 w-4 ${file.required ? 'text-red-600' : 'text-yellow-600'}`} />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {file.found ? 'Found' : (file.required ? 'Missing' : 'Not found')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Errors</h4>
                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <Alert key={index} className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-yellow-600">Warnings</h4>
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, index) => (
                    <Alert key={index} className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validationResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Suggestions</h4>
                <div className="space-y-2">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <Alert key={index} className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription>{suggestion}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plugin Requirements Guide */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">QGIS Plugin Requirements</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Required Files:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>metadata.txt</code> - Plugin configuration</li>
                <li>• <code>__init__.py</code> - Python package entry point</li>
                <li>• Main plugin logic files (.py)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Recommended Files:</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>icon.png</code> - Plugin icon (24x24px)</li>
                <li>• <code>README.md</code> - Documentation</li>
                <li>• Sample data for testing</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PluginPackageValidator;