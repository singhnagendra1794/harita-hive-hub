
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutAuthor = () => {
  return (
    <section className="py-16 bg-accent/10">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">About The Author & Mentor</h2>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Nagendra Singh</CardTitle>
            <CardDescription>
              <a href="https://www.linkedin.com/in/singhnagendra1/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                LinkedIn Profile
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                With over 8 years of experience in the geospatial domain, Nagendra Singh has successfully led multidisciplinary teams up to 55 members in designing and deploying scalable GIS solutions across diverse sectors, including smart cities, climate resilience, infrastructure, environmental risk, and public safety.
              </p>

              <h3 className="font-bold text-lg mt-6">Core Competencies</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>AI-powered spatial analysis for urban planning, ESG, infrastructure, and transport</li>
                <li>GIS automation and predictive modeling using Python, GEE, PySpark, and Arcpy</li>
                <li>Cloud-based GIS deployment on AWS, Google Cloud, PostGIS, and BigQuery GIS</li>
                <li>Development of interactive GIS applications using Mapbox, Streamlit, and FastAPI</li>
                <li>Agile team leadership and stakeholder engagement across public and private sectors</li>
              </ul>

              <h3 className="font-bold text-lg mt-6">Achievements</h3>
              <p>
                He has delivered geospatial intelligence and analytics solutions to organizations such as ADB, NABARD, NSF, and global consulting firms resulting in:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>30%+ reduction in project timelines through GIS automation</li>
                <li>AI models for land-use, crime, and infrastructure planning</li>
                <li>Deployment of cloud-native GIS systems for scalable, real-time analytics</li>
              </ul>

              <p className="mt-4">
                In parallel with his leadership role, Nagendra is deeply committed to mentorship and capacity building in the geospatial community. He actively mentors students and professionals, and is in the process of launching a structured online course to bridge academic knowledge with practical, industry-oriented GIS applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutAuthor;
