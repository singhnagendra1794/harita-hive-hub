
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const JobPosting = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Job Posting</h1>
        
        <div className="mb-8 max-w-3xl">
          <p className="text-lg text-muted-foreground">
            Connect with talented geospatial professionals or find your next GIS career opportunity. 
            Companies can post open positions, and job seekers can browse and apply directly.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>For Companies</CardTitle>
              <CardDescription>Find the perfect talent for your geospatial projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Post job openings and connect with qualified GIS professionals</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reach a targeted audience of GIS specialists</li>
                <li>Review applicant profiles and portfolios</li>
                <li>Connect directly with potential candidates</li>
                <li>Showcase your company to the GIS community</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Post a Job</Button>
            </CardFooter>
          </Card>
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>For Job Seekers</CardTitle>
              <CardDescription>Take the next step in your GIS career</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Find opportunities that match your skills and career goals</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Browse jobs from top geospatial employers</li>
                <li>Create a professional profile to showcase your skills</li>
                <li>Get notified about relevant opportunities</li>
                <li>Connect directly with hiring managers</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Browse Jobs</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="bg-accent/20 p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Search Job Listings</h3>
              <p className="text-muted-foreground">Find the perfect opportunity for your skills</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:w-2/3">
              <div className="flex-1">
                <Input placeholder="Keywords (e.g., GIS Analyst, Remote Sensing)" />
              </div>
              <div className="flex-1">
                <Input placeholder="Location" />
              </div>
              <Button>Search</Button>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mt-12 mb-6">Featured Job Listings</h2>
        
        <div className="space-y-6">
          {[
            {
              title: "GIS Analyst",
              company: "Environmental Consulting Group",
              location: "San Francisco, CA",
              type: "Full-time",
              description: "Join our team to work on environmental impact assessments and spatial analysis for major infrastructure projects.",
              skills: ["ArcGIS", "Python", "Remote Sensing"]
            },
            {
              title: "Remote Sensing Specialist",
              company: "Global Mapping Solutions",
              location: "Remote",
              type: "Contract",
              description: "Process and analyze satellite imagery to support climate change monitoring and land use classification projects.",
              skills: ["Satellite Imagery", "ENVI", "Machine Learning"]
            },
            {
              title: "GIS Developer",
              company: "UrbanPlan Technologies",
              location: "Austin, TX",
              type: "Full-time",
              description: "Build web mapping applications and geospatial tools to support urban planning decision-making processes.",
              skills: ["JavaScript", "Mapbox", "PostGIS"]
            },
            {
              title: "Geospatial Data Scientist",
              company: "DataGeo Analytics",
              location: "Chicago, IL",
              type: "Full-time",
              description: "Apply machine learning and statistical models to geospatial data for predictive insights and pattern detection.",
              skills: ["Python", "R", "Machine Learning", "GeoPandas"]
            }
          ].map((job, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary text-sm px-2 py-1 rounded">{job.location}</span>
                    <span className="bg-accent/30 text-sm px-2 py-1 rounded">{job.type}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="bg-muted text-sm px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Apply Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default JobPosting;
