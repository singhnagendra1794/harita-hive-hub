
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import BenefitsSection from "../components/BenefitsSection";
import AboutAuthor from "../components/AboutAuthor";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Layout>
      <HeroSection />
      
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">About HaritaHive</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              HaritaHive is the one-stop solution for geospatial professionals, providing cutting-edge tools, resources, and a community for everyone in the GIS ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-accent/10 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Learning Resources</h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive tutorials, courses, and hands-on projects to enhance your GIS skills.
              </p>
              <Link to="/learn">
                <Button variant="outline" size="sm">Explore Learning</Button>
              </Link>
            </div>
            
            <div className="bg-accent/10 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Powerful Analysis Tools</h3>
              <p className="text-muted-foreground mb-4">
                Access advanced spatial analysis capabilities, integrated with Python, SQL, and more.
              </p>
              <Link to="/spatial-analysis">
                <Button variant="outline" size="sm">Try Analysis Tools</Button>
              </Link>
            </div>
            
            <div className="bg-accent/10 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Career Opportunities</h3>
              <p className="text-muted-foreground mb-4">
                Connect with employers and professionals, and showcase your skills to the community.
              </p>
              <Link to="/job-posting">
                <Button variant="outline" size="sm">View Opportunities</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <BenefitsSection />
      <AboutAuthor />
      
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the HaritaHive community today and unlock the full potential of geospatial technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary">Sign Up Now</Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Explore Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
