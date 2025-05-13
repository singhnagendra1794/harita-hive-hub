
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/20">
      <div className="container text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Empowering the World of GIS
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          The one-stop solution for all geospatial professionals, students, companies, and government officials.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/learn">
            <Button size="lg">Start Learning</Button>
          </Link>
          <Link to="/projects">
            <Button size="lg" variant="outline">Explore Projects</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
