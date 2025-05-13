
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const dummyData = [
  { name: "Urban", value: 400 },
  { name: "Forest", value: 300 },
  { name: "Agriculture", value: 250 },
  { name: "Water", value: 200 },
  { name: "Barren", value: 100 },
];

const barChartConfig = {
  urban: { label: "Urban", color: "#4f46e5" },
  forest: { label: "Forest", color: "#16a34a" },
  agriculture: { label: "Agriculture", color: "#ca8a04" },
  water: { label: "Water", color: "#0891b2" },
  barren: { label: "Barren", color: "#a16207" },
};

const GeoDashboard = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Geo-Dashboard</h1>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-700">
            <strong>Free Trial:</strong> You have access to this section for 1 day in trial mode. <a href="#" className="text-blue-600 hover:underline">Upgrade</a> to continue using Geo-Dashboard after your trial ends.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Visualize spatial data with customizable layers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-w-16 aspect-h-9 bg-accent/20 rounded-md flex items-center justify-center h-80">
                <p className="text-muted-foreground">[Interactive Map Placeholder]</p>
                <p className="text-sm">Map visualization would appear here in the full version</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="mr-2">Toggle Layers</Button>
              <Button variant="outline">Export Map</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Land Cover Analysis</CardTitle>
              <CardDescription>Distribution by area type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-80">
                <BarChart data={dummyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Connect your data for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>GeoJSON Files</span>
                  <Button size="sm">Upload</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shapefiles</span>
                  <Button size="sm">Upload</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>CSV with Coordinates</span>
                  <Button size="sm">Upload</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Connection</span>
                  <Button size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>WMS/WFS Services</span>
                  <Button size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Key metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-accent/10 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Total Area</div>
                  <div className="text-2xl font-bold">1,250 km²</div>
                </div>
                <div className="bg-accent/10 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Population</div>
                  <div className="text-2xl font-bold">3.2M</div>
                </div>
                <div className="bg-accent/10 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Data Points</div>
                  <div className="text-2xl font-bold">26,458</div>
                </div>
              </div>
              
              <div className="bg-accent/20 p-4 rounded-md">
                <h4 className="font-medium mb-2">Integration Tools</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm">PowerBI</Button>
                  <Button variant="outline" size="sm">Tableau</Button>
                  <Button variant="outline" size="sm">Excel</Button>
                  <Button variant="outline" size="sm">Python</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Export Report</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Saved Views</CardTitle>
              <CardDescription>Access your custom dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">Urban Growth Analysis</Button>
                <Button variant="outline" className="w-full justify-start">Transportation Network</Button>
                <Button variant="outline" className="w-full justify-start">Environmental Monitoring</Button>
                <Button variant="outline" className="w-full justify-start">Population Density</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Create New View</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default GeoDashboard;
