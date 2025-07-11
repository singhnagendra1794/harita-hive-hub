import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Info, MapPin } from 'lucide-react';

export interface CoordinateSystem {
  id: string;
  name: string;
  epsg: string;
  description: string;
  region: string;
  units: string;
}

export const coordinateSystems: CoordinateSystem[] = [
  {
    id: 'wgs84',
    name: 'WGS 84',
    epsg: 'EPSG:4326',
    description: 'World Geodetic System 1984',
    region: 'Global',
    units: 'Degrees'
  },
  {
    id: 'web-mercator',
    name: 'Web Mercator',
    epsg: 'EPSG:3857',
    description: 'Web Mercator projection',
    region: 'Global',
    units: 'Meters'
  },
  {
    id: 'utm-44n',
    name: 'UTM Zone 44N',
    epsg: 'EPSG:32644',
    description: 'Universal Transverse Mercator Zone 44N',
    region: 'India (Central)',
    units: 'Meters'
  },
  {
    id: 'utm-43n',
    name: 'UTM Zone 43N',
    epsg: 'EPSG:32643',
    description: 'Universal Transverse Mercator Zone 43N',
    region: 'India (Western)',
    units: 'Meters'
  },
  {
    id: 'utm-45n',
    name: 'UTM Zone 45N',
    epsg: 'EPSG:32645',
    description: 'Universal Transverse Mercator Zone 45N',
    region: 'India (Eastern)',
    units: 'Meters'
  }
];

interface CoordinateSystemSelectorProps {
  currentCRS: string;
  onCRSChange: (crs: CoordinateSystem) => void;
  className?: string;
}

const CoordinateSystemSelector: React.FC<CoordinateSystemSelectorProps> = ({
  currentCRS,
  onCRSChange,
  className = ''
}) => {
  const selectedCRS = coordinateSystems.find(crs => crs.id === currentCRS);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Coordinate System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="crs-select" className="text-xs">
            Select Projection
          </Label>
          <Select value={currentCRS} onValueChange={(value) => {
            const crs = coordinateSystems.find(c => c.id === value);
            if (crs) onCRSChange(crs);
          }}>
            <SelectTrigger id="crs-select">
              <SelectValue placeholder="Choose coordinate system..." />
            </SelectTrigger>
            <SelectContent>
              {coordinateSystems.map((crs) => (
                <SelectItem key={crs.id} value={crs.id}>
                  <div>
                    <div className="font-medium">{crs.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {crs.epsg} • {crs.region}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCRS && (
          <div className="p-2 bg-muted rounded-lg space-y-1">
            <div className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">{selectedCRS.name} ({selectedCRS.epsg})</p>
                <p className="text-muted-foreground">{selectedCRS.description}</p>
                <p className="text-muted-foreground">Units: {selectedCRS.units}</p>
                <p className="text-muted-foreground">Region: {selectedCRS.region}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoordinateSystemSelector;