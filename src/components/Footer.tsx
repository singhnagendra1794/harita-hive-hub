
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">HaritaHive</h3>
            <p className="text-muted-foreground">
              One stop solution for Geospatial Professionals. Empowering students, professionals, companies, and government officials with cutting-edge geospatial tools and resources.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link to="/learn" className="text-muted-foreground hover:text-foreground">Learn</Link></li>
              <li><Link to="/projects" className="text-muted-foreground hover:text-foreground">Projects</Link></li>
              <li><Link to="/spatial-analysis" className="text-muted-foreground hover:text-foreground">Spatial Analysis</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/geo-dashboard" className="text-muted-foreground hover:text-foreground">Geo-Dashboard</Link></li>
              <li><Link to="/job-posting" className="text-muted-foreground hover:text-foreground">Job Posting</Link></li>
              <li><Link to="/resume-posting" className="text-muted-foreground hover:text-foreground">Resume Posting</Link></li>
              <li><Link to="/qgis-project" className="text-muted-foreground hover:text-foreground">QGIS Project</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li><a href="https://www.linkedin.com/in/singhnagendra1/" className="text-muted-foreground hover:text-foreground">LinkedIn</a></li>
              <li><a href="mailto:contact@haritahive.com" className="text-muted-foreground hover:text-foreground">contact@haritahive.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HaritaHive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
