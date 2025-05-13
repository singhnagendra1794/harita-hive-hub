
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Layers, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SpatialJoinTool = () => {
  const [targetLayer, setTargetLayer] = useState("census");
  const [joinLayer, setJoinLayer] = useState("schools");
  const [spatialRelation, setSpatialRelation] = useState("contains");
  const [showResults, setShowResults] = useState(false);

  const layerMeta = {
    census: {
      title: "Census Tracts",
      type: "Polygons",
      count: 120,
      attributes: ["TRACT_ID", "POP_2020", "MED_INCOME", "POP_DENSITY"],
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    schools: {
      title: "Schools",
      type: "Points",
      count: 45,
      attributes: ["SCHOOL_ID", "SCHOOL_NAME", "LEVEL", "ENROLLMENT"],
      color: "bg-green-100 text-green-800 border-green-300",
    },
    rivers: {
      title: "Rivers",
      type: "Lines",
      count: 18,
      attributes: ["RIVER_ID", "NAME", "LENGTH_KM", "FLOW_RATE"],
      color: "bg-cyan-100 text-cyan-800 border-cyan-300",
    },
    parks: {
      title: "Parks",
      type: "Polygons",
      count: 32,
      attributes: ["PARK_ID", "NAME", "AREA_SQKM", "TYPE"],
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    incidents: {
      title: "Incident Reports",
      type: "Points",
      count: 87,
      attributes: ["INC_ID", "TYPE", "DATE", "SEVERITY"],
      color: "bg-red-100 text-red-800 border-red-300",
    },
  };
  
  const resultAttributes = showResults ? [
    { name: "TRACT_ID", from: "Target", value: "CT10025" },
    { name: "POP_2020", from: "Target", value: "3256" },
    { name: "MED_INCOME", from: "Target", value: "$58,450" },
    { name: "SCHOOL_COUNT", from: "Join", value: "3" },
    { name: "SCHOOL_NAMES", from: "Join", value: "Washington HS, Lincoln MS, Jefferson ES" },
    { name: "AVG_ENROLLMENT", from: "Calculated", value: "523" },
  ] : [];

  const handleJoin = () => {
    setShowResults(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Spatial Join Tool</CardTitle>
        <CardDescription>
          Combine attributes from multiple datasets based on their spatial relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Layer</Label>
            <Select value={targetLayer} onValueChange={setTargetLayer}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(layerMeta).map(key => (
                  <SelectItem key={key} value={key}>
                    {layerMeta[key].title} ({layerMeta[key].type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <Layers className="h-4 w-4" />
              {layerMeta[targetLayer].count} features
            </div>
          </div>
        
          <div className="space-y-2">
            <Label>Join Layer</Label>
            <Select value={joinLayer} onValueChange={setJoinLayer}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(layerMeta)
                  .filter(key => key !== targetLayer)
                  .map(key => (
                    <SelectItem key={key} value={key}>
                      {layerMeta[key].title} ({layerMeta[key].type})
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <Layers className="h-4 w-4" />
              {layerMeta[joinLayer].count} features
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Spatial Relationship</Label>
          <Select value={spatialRelation} onValueChange={setSpatialRelation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="within">Within</SelectItem>
              <SelectItem value="intersects">Intersects</SelectItem>
              <SelectItem value="touches">Touches</SelectItem>
              <SelectItem value="crosses">Crosses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center p-3 bg-muted/50 rounded-md">
          <div className="flex-1 text-sm">
            <p className="font-medium">Join Preview</p>
            <p className="text-muted-foreground">
              {`Joining ${layerMeta[targetLayer].title} with ${layerMeta[joinLayer].title} where features ${spatialRelation === "contains" ? "contain" : spatialRelation === "within" ? "are within" : spatialRelation} each other`}
            </p>
          </div>
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between items-center">
            <Label>Available Attributes</Label>
            <span className="text-xs text-muted-foreground">{layerMeta[targetLayer].attributes.length + layerMeta[joinLayer].attributes.length} total</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {layerMeta[targetLayer].attributes.map(attr => (
              <Badge key={attr} variant="outline" className={`${layerMeta[targetLayer].color} border`}>
                {attr}
              </Badge>
            ))}
            {layerMeta[joinLayer].attributes.map(attr => (
              <Badge key={attr} variant="outline" className={`${layerMeta[joinLayer].color} border`}>
                {attr}
              </Badge>
            ))}
          </div>
        </div>

        {showResults && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Spatial Join Result Preview</h4>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultAttributes.map(attr => (
                    <TableRow key={attr.name}>
                      <TableCell className="font-medium">{attr.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={attr.from === "Target" 
                          ? layerMeta[targetLayer].color 
                          : attr.from === "Join" 
                            ? layerMeta[joinLayer].color
                            : "bg-purple-100 text-purple-800 border-purple-300"
                        }>
                          {attr.from}
                        </Badge>
                      </TableCell>
                      <TableCell>{attr.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleJoin} className="w-full">Perform Spatial Join</Button>
      </CardFooter>
    </Card>
  );
};

export default SpatialJoinTool;
