
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/c5358765-5f6a-4c01-bb00-5f17261ffd2d.png" 
                alt="Harita Hive Logo" 
                className="h-8 w-8"
                loading="lazy"
                decoding="async"
              />
              <span className="font-bold text-xl">Harita Hive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your comprehensive platform for geospatial learning, tools, and community.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/home" className="block text-muted-foreground hover:text-primary">
                Home
              </Link>
              <Link to="/learn" className="block text-muted-foreground hover:text-primary">
                Learn
              </Link>
              <Link to="/map-playground" className="block text-muted-foreground hover:text-primary">
                Map Playground
              </Link>
              <Link to="/community" className="block text-muted-foreground hover:text-primary">
                Community
              </Link>
              <Link to="/beta" className="block text-muted-foreground hover:text-primary">
                Beta Program
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <div className="space-y-2 text-sm">
              <Link to="/code-snippets" className="block text-muted-foreground hover:text-primary">
                Code Snippets
              </Link>
              <Link to="/project-templates" className="block text-muted-foreground hover:text-primary">
                Project Templates
              </Link>
              <Link to="/job-posting" className="block text-muted-foreground hover:text-primary">
                Job Board
              </Link>
              <Link to="/live-classes" className="block text-muted-foreground hover:text-primary">
                Live Classes
              </Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-primary">
                Pricing
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@haritahive.com" className="hover:text-primary">
                  contact@haritahive.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+919027608557" className="hover:text-primary">
                  +91 9027608557
                </a>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Sambhal, UP, India</span>
              </div>
            </div>
            <div className="space-y-2">
              <Link to="/newsletter" className="inline-block">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors">
                  Subscribe to Newsletter
                </button>
              </Link>
              <div>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Harita Hive. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-primary">Refund Policy</Link>
            <Link to="/investors" className="hover:text-primary">Investors</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
