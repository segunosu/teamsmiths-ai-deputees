import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
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
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Plans', path: '/plans' },
    { label: 'AI Navigator', path: '/ai-navigator', tooltip: 'Your on-demand AI team — AI Deputee™ agents + Teamsmiths advisors, from £195/mo.' },
  ];

  // Add contact link to Calendly
  const contactLink = 'https://calendly.com/osu/brief-chat';

  if (user) {
    const dashboardPath = userType === 'freelancer' ? '/freelancer-dashboard' : '/dashboard';
    navItems.push({ label: 'Dashboard', path: dashboardPath });
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
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
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={item.tooltip}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Contact Link */}
              <a
                href={contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
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
                  <Link to="/plans">Join AI Navigator</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              {/* Ensure Plans and AI Navigator are first for mobile visibility */}
              <Link
                to="/plans"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                  isActive('/plans')
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Plans
              </Link>
              <Link
                to="/ai-navigator"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                  isActive('/ai-navigator')
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                AI Navigator
              </Link>
              {navItems.filter(item => item.path === '/').map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
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
                          <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start">
                          <Link to="/admin/reports" onClick={() => setMobileMenuOpen(false)}>
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
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start">
                      <Link to="/plans" onClick={() => setMobileMenuOpen(false)}>
                        Join AI Navigator
                      </Link>
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