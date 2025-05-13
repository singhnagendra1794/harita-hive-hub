
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">HaritaHive</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="block md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/learn">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Learn
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/projects">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Projects
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/spatial-analysis">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Spatial Analysis
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/geo-dashboard">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Geo-Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/job-posting">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Job Posting
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/resume-posting">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Resume Posting
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/qgis-project">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  QGIS Project
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <nav className="container py-4 flex flex-col space-y-2">
              <Link to="/" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/learn" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Learn</Link>
              <Link to="/projects" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Projects</Link>
              <Link to="/spatial-analysis" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Spatial Analysis</Link>
              <Link to="/geo-dashboard" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Geo-Dashboard</Link>
              <Link to="/job-posting" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Job Posting</Link>
              <Link to="/resume-posting" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>Resume Posting</Link>
              <Link to="/qgis-project" className="px-4 py-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>QGIS Project</Link>
            </nav>
          </div>
        )}

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
