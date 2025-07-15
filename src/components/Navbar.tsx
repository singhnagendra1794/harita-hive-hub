
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Menu, X, ChevronDown, User, LogOut, Settings, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isSuperAdmin } = useUserRoles();
  const { hasAccess } = usePremiumAccess();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const learningLinks = [
    { href: "/browse-courses", label: "Browse Courses" },
    ...(user && hasAccess('pro') ? [{ href: "/project-templates", label: "Project Templates" }] : []),
    { href: "/code-snippets", label: "Code Library" },
    { href: "/live-classes", label: "Live Classes" },
  ];

  const toolsLinks = [
    ...(user && hasAccess('pro') ? [{ href: "/map-playground", label: "Map Playground" }] : []),
    { href: "/spatial-analysis", label: "Spatial Analysis" },
    ...(user && hasAccess('pro') ? [{ href: "/geoai-lab", label: "GeoAI Lab" }] : []),
    ...(user && hasAccess('pro') ? [{ href: "/geo-processing-lab", label: "Geo Processing Lab" }] : []),
    ...(user && hasAccess('enterprise') ? [{ href: "/webgis-builder", label: "Web GIS Builder" }] : []),
  ];

  const marketplaceLinks = [
    ...(user && hasAccess('pro') ? [{ href: "/gis-marketplace", label: "GIS Tools" }] : []),
    ...(user && hasAccess('pro') ? [{ href: "/plugin-marketplace", label: "Plugins & Scripts" }] : []),
    { href: "/talent-pool", label: "Hire Talent" },
    { href: "/task-board", label: "Freelance Projects" },
    { href: "/certifications", label: "Certifications" },
    { href: "/corporate-training", label: "Corporate Training" },
  ];

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/c5358765-5f6a-4c01-bb00-5f17261ffd2d.png" 
                alt="Harita Hive Logo" 
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold text-primary">Harita Hive</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {/* Learning Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  Learning <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {learningLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {toolsLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marketplace Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  Marketplace <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {marketplaceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/community">
              <Button variant="ghost">Community</Button>
            </Link>

            <Link to="/upcoming-course">
              <Button variant="ghost">Upcoming Course</Button>
            </Link>

            <Link to="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {user.user_metadata?.full_name || user.email}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isSuperAdmin() && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/notes" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      My Notes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background">
              {/* Learning Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Learning</div>
                {learningLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Tools Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Tools</div>
                {toolsLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Marketplace Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Marketplace</div>
                {marketplaceLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Link
                to="/community"
                className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Community
              </Link>

              <Link
                to="/upcoming-course"
                className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Upcoming Course
              </Link>

              <Link
                to="/pricing"
                className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>

              {/* Auth section */}
              <div className="border-t pt-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {isSuperAdmin() && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
