
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, BookOpen, MapPin, Code, Users, Briefcase, GraduationCap, Search, Crown, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    { name: "Home", href: "/home", icon: null },
    { name: "Learn", href: "/learn", icon: BookOpen, protected: true },
    { name: "Map Playground", href: "/map-playground", icon: MapPin, protected: true },
    { name: "GeoAI Lab", href: "/geoai-lab", icon: Brain, protected: true },
    { name: "Code Snippets", href: "/code-snippets", icon: Code, protected: true },
    { name: "Community", href: "/community", icon: Users, protected: true },
    { name: "Job Board", href: "/job-posting", icon: Briefcase, protected: true },
    { name: "Live Classes", href: "/live-classes", icon: GraduationCap, protected: true },
  ];

  const NavItems = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      {navigationItems.map((item) => {
        if (item.protected && !user) return null;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`${
              mobile
                ? "flex items-center space-x-2 px-4 py-2 text-lg hover:bg-accent rounded-md"
                : "text-sm font-medium hover:text-primary transition-colors"
            }`}
            onClick={onItemClick}
          >
            {item.icon && mobile && <item.icon className="h-5 w-5" />}
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/home" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HH</span>
            </div>
            <span className="font-bold text-xl">HaritaHive</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavItems />
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/premium-upgrade" className="flex items-center">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <div className="flex flex-col space-y-6 mt-6">
                {user && (
                  <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.user_metadata?.full_name || "User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <nav className="flex flex-col space-y-2">
                  <NavItems mobile onItemClick={() => setIsOpen(false)} />
                </nav>

                {user ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-lg hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/search"
                      className="flex items-center space-x-2 px-4 py-2 text-lg hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <Search className="h-5 w-5" />
                      <span>Search</span>
                    </Link>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      variant="ghost"
                      className="flex items-center space-x-2 px-4 py-2 text-lg hover:bg-accent rounded-md text-red-600 justify-start"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-2 text-lg hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center px-4 py-2 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
