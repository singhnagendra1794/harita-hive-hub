
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
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link to="/auth">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
        
        {/* Community Integration */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a 
            href="https://chat.whatsapp.com/EMJJZCTuiuD0zQ66IhhZpA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            📱 Join WhatsApp Community (75+ members)
          </a>
          <a 
            href="https://discord.gg/haritahive" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 transition-colors"
          >
            💬 Join our growing GIS community on Discord
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
