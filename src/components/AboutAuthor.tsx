
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutAuthor = () => {
  return (
    <section className="py-16 bg-accent/10">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">About The Author, Mentor & Tutor</h2>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Nagendra Singh</CardTitle>
            <CardDescription>
              Entrepreneur | Geospatial Technologist | AI Visionary | Mentor & Tutor
            </CardDescription>
            <CardDescription>
              <a href="https://www.linkedin.com/in/singhnagendra1/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                LinkedIn Profile
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-lg leading-relaxed">
                  Nagendra Singh is a driven entrepreneur from India with a passion for geospatial intelligence, AI, and real-world problem-solving. With deep expertise in both traditional GIS and modern technologies like cloud computing, spatial AI, and no-code platforms, he is on a mission to democratize spatial knowledge and build next-gen location-aware solutions for the globe.
                </p>
              </div>

              <div>
                <p className="leading-relaxed">
                  His work blends technical depth, entrepreneurial grit, and a commitment to simplifying complex domains for learners and decision-makers alike. Nagendra's upcoming ventures include AI-driven personal digital concierges, and geospatial avatars — all anchored by the idea that space is the next frontier of intelligence.
                </p>
              </div>

              <h3 className="font-bold text-lg mt-6">Professional Experience</h3>
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
                <li>Entrepreneurial venture development in geospatial AI and no-code platforms</li>
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

              <h3 className="font-bold text-lg mt-6">Mentorship & Education</h3>
              <p>
                In parallel with his leadership role, Nagendra is deeply committed to mentorship and capacity building in the geospatial community. He actively mentors students and professionals, and is in the process of launching a structured online course to bridge academic knowledge with practical, industry-oriented GIS applications.
              </p>

              <div className="bg-accent/20 p-4 rounded-lg mt-6">
                <p className="italic">
                  "This platform reflects his journey, his curiosity, and his commitment to helping others unlock the transformative potential of geospatial technology."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutAuthor;
