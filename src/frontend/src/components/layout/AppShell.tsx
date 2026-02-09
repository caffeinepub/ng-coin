import { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuthState } from '../../hooks/useAuthState';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useIsCallerAdmin } from '../../hooks/useAdmin';
import LoginButton from '../auth/LoginButton';
import { Home, Users, MessageSquare, Calendar, Award, Handshake, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthState();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const location = useLocation();

  const isOnboarded = userProfile?.onboardingComplete;
  const canAccessCommunity = isAuthenticated && isOnboarded;

  const navItems = [
    { to: '/', label: 'Home', icon: Home, public: true },
    { to: '/community', label: 'Community', icon: Users, public: false },
    { to: '/chat', label: 'Chat', icon: MessageSquare, public: false },
    { to: '/events', label: 'Events', icon: Calendar, public: false },
    { to: '/leaderboard', label: 'Points', icon: Award, public: false },
    { to: '/partners', label: 'Partners', icon: Handshake, public: true },
  ];

  // Check if current path matches or is a child of the nav item path
  const isActiveRoute = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/generated/ng-coin-logo.dim_512x512.png" 
              alt="NG COIN" 
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">NG COIN</span>
          </Link>
          
          {/* Desktop Navigation - Center */}
          {canAccessCommunity && (
            <nav className="hidden flex-1 justify-center sm:flex">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  if (!item.public && !canAccessCommunity) return null;
                  const isActive = isActiveRoute(item.to);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {canAccessCommunity && (
              <Link 
                to="/profile" 
                className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
              >
                My Profile
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="hidden items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:flex"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      {canAccessCommunity && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background sm:hidden">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              if (!item.public && !canAccessCommunity) return null;
              const isActive = isActiveRoute(item.to);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 pb-20 sm:pb-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with <span className="text-primary">♥</span> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
