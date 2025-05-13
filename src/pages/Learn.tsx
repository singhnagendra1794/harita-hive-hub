
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Learn = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Learning Resources</h1>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-700">
            <strong>Free Trial:</strong> You have access to this section for 7 days in trial mode. <a href="#" className="text-blue-600 hover:underline">Upgrade</a> to continue learning after your trial ends.
          </p>
        </div>
        
        <div className="aspect-w-16 aspect-h-9 mb-8">
          <iframe 
            width="100%" 
            height="500" 
            src="https://www.youtube.com/embed/3w308TTUVco?si=IxR_hQRga-TmUfCT" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            className="rounded-lg shadow-lg"
          ></iframe>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Featured Courses</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Introduction to GIS",
              description: "Learn the fundamentals of Geographic Information Systems and spatial data handling.",
              level: "Beginner",
              duration: "4 weeks"
            },
            {
              title: "Advanced Spatial Analysis with Python",
              description: "Master spatial analysis techniques using Python libraries like GeoPandas, Rasterio, and Folium.",
              level: "Intermediate",
              duration: "6 weeks"
            },
            {
              title: "Web GIS Development",
              description: "Build interactive web-based GIS applications using modern frameworks and APIs.",
              level: "Advanced",
              duration: "8 weeks"
            },
            {
              title: "Remote Sensing Fundamentals",
              description: "Learn how to acquire, process, and interpret satellite imagery for geospatial applications.",
              level: "Intermediate",
              duration: "5 weeks"
            },
            {
              title: "QGIS for Professionals",
              description: "Master the open-source QGIS software for professional mapping and analysis.",
              level: "Intermediate",
              duration: "6 weeks"
            },
            {
              title: "Spatial Data Science",
              description: "Apply data science techniques to spatial problems using R and Python.",
              level: "Advanced",
              duration: "10 weeks"
            }
          ].map((course, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between text-sm">
                  <span className="bg-accent/50 px-2 py-1 rounded">{course.level}</span>
                  <span>{course.duration}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Enroll Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Learning Paths</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>GIS Analyst Path</CardTitle>
              <CardDescription>Master the skills required to become a professional GIS Analyst</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-1">
                <li>Introduction to GIS</li>
                <li>Cartography and Map Design</li>
                <li>Spatial Analysis Fundamentals</li>
                <li>GIS Database Management</li>
                <li>Advanced Analysis Techniques</li>
              </ol>
            </CardContent>
            <CardFooter>
              <Button>Start This Path</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Geospatial Developer Path</CardTitle>
              <CardDescription>Build your skills as a GIS application developer</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-1">
                <li>Python for Geospatial Analysis</li>
                <li>Web Mapping APIs</li>
                <li>Database Integration</li>
                <li>Full-stack Geospatial Applications</li>
                <li>Cloud GIS Architecture</li>
              </ol>
            </CardContent>
            <CardFooter>
              <Button>Start This Path</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Learn;
