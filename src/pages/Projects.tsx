

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Projects = () => {
  return (
    <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Geospatial Projects</h1>
        
        <div className="mb-8">
          <p className="text-lg text-muted-foreground">
            Explore real-world geospatial projects, contribute to ongoing initiatives, and share your own work with the community.
          </p>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Featured Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Urban Heat Island Analysis",
              description: "Analyzing urban heat patterns using satellite imagery and ground measurements to identify vulnerable areas.",
              category: "Climate",
              tech: "Remote Sensing, Python"
            },
            {
              title: "Emergency Response Routing",
              description: "Developing optimal routing algorithms for emergency vehicles based on real-time traffic data.",
              category: "Public Safety",
              tech: "Network Analysis, QGIS"
            },
            {
              title: "Flood Risk Assessment",
              description: "Modeling flood risks using elevation data, precipitation patterns, and land use information.",
              category: "Disaster Management",
              tech: "Hydrological Modeling, ArcGIS"
            },
            {
              title: "Agricultural Yield Prediction",
              description: "Predicting crop yields based on multispectral imagery, weather data, and soil conditions.",
              category: "Agriculture",
              tech: "Machine Learning, Earth Engine"
            },
            {
              title: "Biodiversity Mapping",
              description: "Mapping species distribution and habitat connectivity to support conservation efforts.",
              category: "Environmental",
              tech: "Spatial Statistics, R"
            },
            {
              title: "Smart City Dashboard",
              description: "Interactive dashboard for monitoring urban infrastructure, traffic, and environmental metrics.",
              category: "Smart Cities",
              tech: "Web GIS, JavaScript"
            }
          ].map((project, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">{project.category}</span>
                  <span className="bg-accent/30 px-2 py-1 rounded text-sm">{project.tech}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Project</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="bg-accent/20 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Start Your Own Project</h2>
          <p className="mb-4">
            Have a great idea for a geospatial project? Share it with the community and find collaborators.
          </p>
          <Button>Create New Project</Button>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Project Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Climate & Environment",
            "Urban Planning",
            "Transportation",
            "Public Health",
            "Agriculture",
            "Conservation",
            "Utilities",
            "Education"
          ].map((category, index) => (
            <Card key={index} className="text-center hover:bg-accent/10 cursor-pointer">
              <CardContent className="py-6">
                {category}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
