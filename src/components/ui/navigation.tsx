import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Menu, X, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationSystem from '@/components/NotificationSystem';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigationItems = [
  { label: 'Home', path: '/', tooltip: 'Start here — outcome-driven AI solutions for SMBs.' },
  { label: 'Audit', path: '/audit', tooltip: 'Quick diagnostic to find fastest uplift' },
  { label: 'Outcomes', path: '/business-outcomes', tooltip: 'Packaged solutions delivering measurable results' },
  { label: 'Impact', path: '/business-impact', tooltip: 'Scoped app builds that move your numbers' },
  { label: 'About', path: '/about', tooltip: 'Learn about Teamsmiths and our mission to democratise world-class consulting.' },
  { label: 'Blog', path: '/blog', tooltip: 'Insights and updates from the Teamsmiths team.' },
  { label: 'Contact', path: '/contact', tooltip: 'Get in touch with our team.' },
];

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin, user_type')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(data?.is_admin || false);
        setUserType(data?.user_type || null);
      }
    };

    checkUserProfile();
  }, [user]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/5ab267bc-fb45-4d08-8cf8-3812cb6a83b8.png" 
                alt="Team Smiths AI Logo" 
                className="w-auto" 
                style={{ height: '48.6px' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={item.tooltip}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:block">
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationSystem />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.user_metadata?.full_name?.[0] || user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem asChild>
                      <Link to={userType === 'freelancer' ? '/freelancer-dashboard' : '/dashboard'} className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/reports" className="w-full">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Reports
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Call</a>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              {/* Primary CTAs for mobile visibility */}
              <div className="grid grid-cols-2 gap-1 mb-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="justify-start h-10"
                >
                  <Link to="/business-outcomes">Business Outcomes</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"  
                  size="sm"
                  className="justify-start h-10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Book a Call
                  </a>
                </Button>
              </div>

              {/* Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    {isAdmin && (
                      <>
                        <Button asChild variant="ghost" className="w-full justify-start">
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                          <Link to="/admin/reports" onClick={() => setIsMenuOpen(false)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Reports
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start">
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>
                        Book a Call
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};