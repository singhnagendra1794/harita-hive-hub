import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import SearchTrigger from './search/SearchTrigger';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-gray-800">HaritaHive</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/learn" className="text-gray-600 hover:text-green-600 transition-colors">
                  Learn
                </Link>
                <Link to="/projects" className="text-gray-600 hover:text-green-600 transition-colors">
                  Projects
                </Link>
                <Link to="/live-classes" className="text-gray-600 hover:text-green-600 transition-colors">
                  Live Classes
                </Link>
                <Link to="/code-snippets" className="text-gray-600 hover:text-green-600 transition-colors">
                  Code
                </Link>
                <Link to="/notes" className="text-gray-600 hover:text-green-600 transition-colors">
                  Notes
                </Link>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchTrigger />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.email || ""} />
                      <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pricing">Pricing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {/* Mobile Search */}
            <div className="px-2 mb-4">
              <SearchTrigger />
            </div>
            
            {user ? (
              <>
                <Link to="/dashboard" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Dashboard
                </Link>
                <Link to="/learn" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Learn
                </Link>
                <Link to="/projects" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Projects
                </Link>
                <Link to="/live-classes" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Live Classes
                </Link>
                <Link to="/code-snippets" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Code
                </Link>
                <Link to="/notes" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Notes
                </Link>
                <hr className="my-2" />
                <button
                  onClick={logout}
                  className="block w-full text-left px-2 py-2 text-gray-600 hover:text-green-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Sign in
                </Link>
                <Link to="/signup" className="block px-2 py-2 text-gray-600 hover:text-green-600">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
