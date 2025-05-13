
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QgisProject = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">QGIS Project Integration</h1>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-700">
            <strong>Free Trial:</strong> You have access to this section for 1 day in trial mode. <a href="#" className="text-blue-600 hover:underline">Upgrade</a> to continue using QGIS Project integration after your trial ends.
          </p>
        </div>
        
        <div className="mb-8 max-w-3xl">
          <p className="text-lg text-muted-foreground">
            Seamlessly integrate your QGIS projects into the web platform. Upload, share, and collaborate 
            on QGIS projects with team members and clients.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Upload QGIS Project</CardTitle>
              <CardDescription>Share your project files with collaborators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-accent/50 rounded-lg p-10 text-center">
                <div className="mb-4 text-muted-foreground">
                  Drag and drop your .qgz or .qgs files here
                </div>
                <Button>Select Files</Button>
                <div className="mt-4 text-sm text-muted-foreground">
                  Maximum file size: 50MB
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Collaboration</CardTitle>
              <CardDescription>Work together on QGIS projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Collaborate with team members on QGIS projects:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Share project files with specific users or teams</li>
                <li>Control access permissions (view, edit, admin)</li>
                <li>Track changes and maintain version history</li>
                <li>Add comments and annotations to specific features</li>
                <li>Export maps and visualizations for reports</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button>Manage Collaborators</Button>
            </CardFooter>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Your QGIS Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Urban Development Analysis",
              lastEdited: "2 days ago",
              layers: 12,
              collaborators: 3,
              status: "Active"
            },
            {
              name: "Watershed Delineation",
              lastEdited: "1 week ago",
              layers: 8,
              collaborators: 2,
              status: "Active"
            },
            {
              name: "Transportation Network",
              lastEdited: "3 weeks ago",
              layers: 15,
              collaborators: 5,
              status: "Archived"
            }
          ].map((project, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>Last edited: {project.lastEdited}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Layers:</span>
                    <span>{project.layers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Collaborators:</span>
                    <span>{project.collaborators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={project.status === "Active" ? "text-green-600" : "text-gray-500"}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">View</Button>
                <Button size="sm">Open in Web</Button>
              </CardFooter>
            </Card>
          ))}
          
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <p className="text-muted-foreground mb-4">Create a new QGIS project</p>
              <Button>New Project</Button>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">QGIS Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tutorials & Documentation</CardTitle>
              <CardDescription>Learn how to make the most of QGIS</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Getting Started with QGIS</span>
                  <Button variant="link" className="p-0">View</Button>
                </li>
                <li className="flex justify-between">
                  <span>Advanced Spatial Analysis in QGIS</span>
                  <Button variant="link" className="p-0">View</Button>
                </li>
                <li className="flex justify-between">
                  <span>Creating Beautiful Maps</span>
                  <Button variant="link" className="p-0">View</Button>
                </li>
                <li className="flex justify-between">
                  <span>QGIS Python Scripting</span>
                  <Button variant="link" className="p-0">View</Button>
                </li>
                <li className="flex justify-between">
                  <span>Working with PostGIS in QGIS</span>
                  <Button variant="link" className="p-0">View</Button>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Browse All Tutorials</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plugin Repository</CardTitle>
              <CardDescription>Enhance your QGIS workflow with plugins</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>QuickMapServices</span>
                  <Button variant="link" className="p-0">Install</Button>
                </li>
                <li className="flex justify-between">
                  <span>Processing Toolbox Plus</span>
                  <Button variant="link" className="p-0">Install</Button>
                </li>
                <li className="flex justify-between">
                  <span>QGIS Cloud Publisher</span>
                  <Button variant="link" className="p-0">Install</Button>
                </li>
                <li className="flex justify-between">
                  <span>TimeManager</span>
                  <Button variant="link" className="p-0">Install</Button>
                </li>
                <li className="flex justify-between">
                  <span>Resource Sharing</span>
                  <Button variant="link" className="p-0">Install</Button>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Browse All Plugins</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QgisProject;
