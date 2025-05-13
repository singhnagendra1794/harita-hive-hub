
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResumePosting = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Resume Posting</h1>
        
        <div className="mb-8 max-w-3xl">
          <p className="text-lg text-muted-foreground">
            Showcase your geospatial skills and experience to potential employers. 
            Create a professional profile highlighting your expertise in GIS, remote sensing, 
            spatial analysis, and other geospatial domains.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>Stand out to potential employers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Build a comprehensive profile to showcase your geospatial expertise</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Highlight your technical skills and software proficiency</li>
                <li>Showcase your project portfolio with maps and visualizations</li>
                <li>Detail your education and professional certifications</li>
                <li>List your work experience and achievements</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Create Profile</Button>
            </CardFooter>
          </Card>
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Browse Talent</CardTitle>
              <CardDescription>For employers seeking geospatial professionals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Find qualified GIS professionals for your team</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Search by skills, experience level, and location</li>
                <li>View detailed profiles and portfolios</li>
                <li>Contact candidates directly through the platform</li>
                <li>Save favorite profiles for future opportunities</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Search Profiles</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="bg-accent/20 p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Find Talent</h3>
              <p className="text-muted-foreground">Search for GIS professionals with the right skills</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:w-2/3">
              <div className="flex-1">
                <Input placeholder="Skills (e.g., ArcGIS, Python, Remote Sensing)" />
              </div>
              <div className="flex-1">
                <Input placeholder="Location" />
              </div>
              <Button>Search</Button>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Featured Professionals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Alex Johnson",
              title: "GIS Analyst & Developer",
              location: "Seattle, WA",
              experience: "5 years",
              skills: ["ArcGIS", "Python", "JavaScript", "QGIS"],
              description: "Experienced GIS professional specializing in web mapping applications and spatial analysis for environmental projects."
            },
            {
              name: "Samantha Chen",
              title: "Remote Sensing Specialist",
              location: "Boston, MA",
              experience: "8 years",
              skills: ["Satellite Imagery", "Machine Learning", "Google Earth Engine", "ENVI"],
              description: "Remote sensing expert with experience in land cover classification, change detection, and environmental monitoring."
            },
            {
              name: "Marcus Williams",
              title: "Geospatial Database Administrator",
              location: "Denver, CO",
              experience: "6 years",
              skills: ["PostGIS", "SQL", "Database Design", "Data Migration"],
              description: "Database specialist focused on designing and optimizing geospatial databases for enterprise GIS systems."
            },
            {
              name: "Priya Patel",
              title: "GIS Application Developer",
              location: "Austin, TX",
              experience: "4 years",
              skills: ["React", "Mapbox GL", "Node.js", "PostgreSQL"],
              description: "Full-stack developer creating interactive web mapping applications for urban planning and real estate."
            },
            {
              name: "David Rodriguez",
              title: "Transportation GIS Analyst",
              location: "Chicago, IL",
              experience: "7 years",
              skills: ["Network Analysis", "ArcGIS", "Transportation Planning", "Python"],
              description: "Transportation specialist using GIS to optimize routing, analyze accessibility, and support infrastructure planning."
            },
            {
              name: "Emma Wilson",
              title: "Geospatial Data Scientist",
              location: "Remote",
              experience: "3 years",
              skills: ["R", "Python", "Machine Learning", "Statistical Analysis"],
              description: "Data scientist applying spatial statistics and machine learning to extract insights from geographic data."
            }
          ].map((profile, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.title}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">{profile.location}</span>
                  <span className="text-xs">•</span>
                  <span className="text-sm text-muted-foreground">{profile.experience} experience</span>
                </div>
                <p className="mb-4 text-sm">{profile.description}</p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="bg-accent/20 text-xs px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Profile</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ResumePosting;
