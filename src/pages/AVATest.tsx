import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AVAChatInterface } from '@/components/ava/AVAChatInterface';
import { Sparkles } from 'lucide-react';

export const AVATestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AVA AI Assistant Test</h1>
          </div>
          <p className="text-muted-foreground">
            Test AVA's capabilities with geospatial questions and workflows
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">GIS Workflows</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "How do I create a buffer in QGIS?"</li>
                <li>• "Show me Python code for reading shapefiles"</li>
                <li>• "Help me with PostGIS spatial queries"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Analysis & Automation</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "How to detect land use changes?"</li>
                <li>• "Automate map creation with Python"</li>
                <li>• "Best practices for DEM processing"</li>
              </ul>
            </div>
          </div>
        </Card>

        <AVAChatInterface 
          contextType="testing"
          className="min-h-[600px]"
        />
      </div>
    </div>
  );
};

export default AVATestPage;