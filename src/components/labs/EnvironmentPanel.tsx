import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Globe,
  Terminal,
  Database,
  Code2
} from 'lucide-react';

interface EnvironmentPanelProps {
  activeTab: string;
}

const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({ activeTab }) => {
  const environments = {
    python: {
      title: 'Python Environment',
      icon: Code2,
      specs: [
        { name: 'Python', version: '3.9.18', status: 'ready' },
        { name: 'GeoPandas', version: '0.14.0', status: 'ready' },
        { name: 'Rasterio', version: '1.3.8', status: 'ready' },
        { name: 'Scikit-learn', version: '1.3.0', status: 'ready' },
        { name: 'Matplotlib', version: '3.7.2', status: 'ready' },
        { name: 'NumPy', version: '1.24.4', status: 'ready' },
        { name: 'Pandas', version: '2.0.3', status: 'ready' },
        { name: 'Shapely', version: '2.0.1', status: 'ready' },
        { name: 'Folium', version: '0.14.0', status: 'ready' },
        { name: 'PyProj', version: '3.6.0', status: 'ready' }
      ],
      system: {
        memory: '16 GB',
        cpu: '4 cores',
        storage: '100 GB SSD',
        gpu: 'Tesla T4 (Pro)'
      }
    },
    gee: {
      title: 'Google Earth Engine',
      icon: Globe,
      specs: [
        { name: 'Earth Engine API', version: '0.1.370', status: 'ready' },
        { name: 'JavaScript Engine', version: 'V8', status: 'ready' },
        { name: 'Landsat Collection', version: '2', status: 'ready' },
        { name: 'Sentinel-2', version: 'L2A', status: 'ready' },
        { name: 'MODIS', version: '006', status: 'ready' },
        { name: 'Climate Data', version: 'Latest', status: 'ready' },
        { name: 'Population Data', version: 'GHS 2023', status: 'ready' },
        { name: 'Topography', version: 'SRTM 30m', status: 'ready' }
      ],
      system: {
        compute: 'Google Cloud',
        storage: 'Petabyte Scale',
        latency: '< 100ms',
        availability: '99.9%'
      }
    },
    postgis: {
      title: 'PostGIS Database',
      icon: Database,
      specs: [
        { name: 'PostgreSQL', version: '15.4', status: 'ready' },
        { name: 'PostGIS', version: '3.4.0', status: 'ready' },
        { name: 'GEOS', version: '3.12.0', status: 'ready' },
        { name: 'PROJ', version: '9.3.0', status: 'ready' },
        { name: 'GDAL', version: '3.7.2', status: 'ready' },
        { name: 'pgRouting', version: '3.5.0', status: 'ready' },
        { name: 'PostGIS Topology', version: '3.4.0', status: 'ready' },
        { name: 'PostGIS Raster', version: '3.4.0', status: 'ready' }
      ],
      system: {
        memory: '32 GB RAM',
        storage: '1 TB NVMe',
        connections: '200 max',
        backup: 'Daily'
      }
    }
  };

  const currentEnv = environments[activeTab as keyof typeof environments];

  if (!currentEnv) return null;

  const IconComponent = currentEnv.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          {currentEnv.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Versions */}
        <div>
          <h4 className="font-medium mb-3">Installed Packages</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {currentEnv.specs.map((spec, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium">{spec.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {spec.version}
                  </Badge>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Resources */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            System Resources
          </h4>
          <div className="space-y-2">
            {Object.entries(currentEnv.system).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Environment Ready</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All dependencies verified and compatible
          </p>
        </div>

        {/* Quick Actions */}
        {activeTab === 'python' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4 text-blue-500" />
              <span>Jupyter Notebook Ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-green-500" />
              <span>GPU Acceleration Available</span>
            </div>
          </div>
        )}

        {activeTab === 'gee' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Code Editor Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-green-500" />
              <span>All Datasets Accessible</span>
            </div>
          </div>
        )}

        {activeTab === 'postgis' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-blue-500" />
              <span>Connection Pool Ready</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Spatial Indexes Optimized</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnvironmentPanel;