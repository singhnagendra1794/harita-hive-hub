
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
    { href: "/mentorship", label: "Expert Mentors" },
    { href: "/skill-copilot", label: "Skill Copilot" },
    { href: "/live-classes", label: "Live Classes" },
    ...(user && hasAccess('pro') ? [{ href: "/project-templates", label: "Project Templates" }] : []),
    { href: "/code-snippets", label: "Code Library" },
  ];

  const toolsLinks = [
    { href: "/toolkits", label: "Toolkits Hub" },
    ...(user && hasAccess('pro') ? [{ href: "/map-playground", label: "Map Playground" }] : []),
    { href: "/spatial-analysis", label: "Spatial Analysis" },
    ...(user && hasAccess('pro') ? [{ href: "/geoai-lab", label: "GeoAI Lab" }] : []),
    ...(user && hasAccess('pro') ? [{ href: "/geo-processing-lab", label: "Geo Processing Lab" }] : []),
    ...(user && hasAccess('pro') ? [{ href: "/labs", label: "Live Sandbox Labs" }] : []),
    ...(user && hasAccess('enterprise') ? [{ href: "/webgis-builder", label: "Web GIS Builder" }] : []),
  ];

  const workLinks = [
    
    { href: "/freelance-projects", label: "Freelance Hub" },
    { href: "/jobs-ai-discovery", label: "AI Job Discovery" },
    { href: "/talent-pool", label: "Hire Talent" },
    { href: "/certifications", label: "Certifications" },
    { href: "/geova", label: "GEOVA Mentor" },
    { href: "/corporate-training", label: "Corporate Training" },
  ];

  const createLinks = [
    { href: "/studio", label: "Content Studio" },
    ...(user && hasAccess('pro') ? [{ href: "/project-studio", label: "Project Studio" }] : []),
    ...(user && hasAccess('pro') ? [{ href: "/gis-marketplace", label: "GIS Tools" }] : []),
    ...(user && hasAccess('pro') ? [{ href: "/plugin-marketplace", label: "Plugins & Scripts" }] : []),
  ];

  const careerLinks = [
    { href: "/portfolio", label: "Portfolio Builder" },
    { href: "/skill-roadmap", label: "Skill Roadmap" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  const communityLinks = [
    { href: "/newsletter", label: "Newsletter" },
    { href: "/community", label: "Community Forum" },
    { href: "/challenge", label: "Challenges" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full max-w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden" style={{ overflow: 'visible' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex h-16 items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/c5358765-5f6a-4c01-bb00-5f17261ffd2d.png" 
                alt="Harita Hive Logo" 
                className="h-8 w-8"
                loading="eager"
                decoding="sync"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-primary hidden sm:inline-block">Harita Hive</span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on small screens */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-full" style={{ overflow: 'visible' }}>
            {/* Learning Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  Learning <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                {learningLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                {toolsLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Work Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  Work <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                {workLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  Create <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                {createLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Career Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  Career <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                {careerLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  Community <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                {communityLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/browse-courses">
              <Button variant="ghost" className="text-sm">Courses</Button>
            </Link>

            <Link to="/pricing">
              <Button variant="ghost" className="text-sm">Pricing</Button>
            </Link>
          </div>

          {/* Auth Buttons - Responsive */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {user.user_metadata?.full_name || user.email}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-w-[90vw] bg-background/95 backdrop-blur-sm border z-[9999] shadow-lg" sideOffset={8}>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isSuperAdmin() && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/instructor-dashboard" className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Streaming Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
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
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden border-t bg-background backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {/* Learning Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Learning</div>
                {learningLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
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
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Work Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Work</div>
                {workLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Create Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Create</div>
                {createLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Career Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Career</div>
                {careerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Community Section */}
              <div className="py-2">
                <div className="text-sm font-medium text-muted-foreground px-3 py-2">Community</div>
                {communityLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Link
                to="/browse-courses"
                className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Courses
              </Link>

              <Link
                to="/pricing"
                className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
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
                      <>
                        <Link
                          to="/admin"
                          className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setIsOpen(false)}
                        >
                          Admin Panel
                        </Link>
                        <Link
                          to="/instructor-dashboard"
                          className="block px-3 py-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setIsOpen(false)}
                        >
                          Streaming Dashboard
                        </Link>
                      </>
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
