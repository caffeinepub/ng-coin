import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuthState } from '../../hooks/useAuthState';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useIsCallerAdmin } from '../../hooks/useAdmin';
import { useInitializationWatchdog } from '../../hooks/useInitializationWatchdog';
import { InitializationBanner } from '../system/InitializationBanner';
import LoginButton from '../auth/LoginButton';
import { Home, Users, MessageSquare, Calendar, Award, Handshake, Shield, ClipboardCheck, User, Menu, X, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface MenuItem {
  to: string;
  search?: Record<string, string>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  showWhen: 'public' | 'onboarding' | 'onboarded' | 'admin';
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthState();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const watchdog = useInitializationWatchdog();

  const isOnboarded = userProfile?.onboardingComplete;
  const canAccessCommunity = isAuthenticated && isOnboarded;
  const needsOnboarding = isAuthenticated && !profileLoading && isFetched && (userProfile === null || !isOnboarded);

  // Define all menu items with their visibility rules
  const allMenuItems: MenuItem[] = [
    // Public items (always visible)
    { to: '/', label: 'Home', icon: Home, showWhen: 'public' },
    { to: '/partners', label: 'Partners', icon: Handshake, showWhen: 'public' },
    
    // Onboarding item (visible when authenticated but not onboarded)
    { to: '/onboarding', label: 'Complete Onboarding', icon: ClipboardCheck, showWhen: 'onboarding' },
    
    // Onboarded user items (visible when authenticated and onboarded)
    { to: '/community', label: 'Community', icon: Users, showWhen: 'onboarded' },
    { to: '/chat', label: 'Live Guestbook', icon: MessageSquare, showWhen: 'onboarded' },
    { to: '/events', label: 'Events', icon: Calendar, showWhen: 'onboarded' },
    { to: '/leaderboard', label: 'Points', icon: Award, showWhen: 'onboarded' },
    { to: '/profile', label: 'My Profile', icon: User, showWhen: 'onboarded' },
    
    // Admin items (visible when user is admin)
    { to: '/admin', label: 'Admin Dashboard', icon: Shield, showWhen: 'admin' },
    { to: '/admin', search: { tab: 'profiles' }, label: 'Profile Management', icon: UserCog, showWhen: 'admin' },
    { to: '/admin', search: { tab: 'events' }, label: 'Create Event', icon: Calendar, showWhen: 'admin' },
  ];

  // Filter menu items based on current user state
  const getVisibleMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    // Always show public items
    items.push(...allMenuItems.filter(item => item.showWhen === 'public'));

    if (isAuthenticated) {
      if (needsOnboarding) {
        // Show onboarding items
        items.push(...allMenuItems.filter(item => item.showWhen === 'onboarding'));
      } else if (canAccessCommunity) {
        // Show onboarded items
        items.push(...allMenuItems.filter(item => item.showWhen === 'onboarded'));
        
        // Add admin items if user is admin
        if (isAdmin) {
          items.push(...allMenuItems.filter(item => item.showWhen === 'admin'));
        }
      }
    }

    return items;
  };

  const visibleMenuItems = getVisibleMenuItems();

  const isActiveRoute = (item: MenuItem) => {
    const itemPath = item.to;
    const currentPath = location.pathname;
    
    // Special handling for admin with tab parameter
    if (itemPath === '/admin' && item.search?.tab) {
      const searchParams = new URLSearchParams(location.search);
      return currentPath === '/admin' && searchParams.get('tab') === item.search.tab;
    }
    
    // Exact match for home
    if (itemPath === '/') {
      return currentPath === '/';
    }
    
    // Path prefix match for other routes
    return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.search) {
      navigate({ to: item.to, search: item.search });
    } else {
      navigate({ to: item.to });
    }
    setMobileMenuOpen(false);
  };

  // Safe hostname access for footer attribution
  const getAppIdentifier = () => {
    try {
      if (typeof window !== 'undefined' && window.location?.hostname) {
        return encodeURIComponent(window.location.hostname);
      }
    } catch (e) {
      // Fallback if window access fails
    }
    return 'ng-coin-app';
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
          <nav className="hidden flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1">
              {visibleMenuItems.map((item, index) => {
                const isActive = isActiveRoute(item);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={`${item.to}-${item.search?.tab || ''}-${index}`}
                    to={item.to}
                    search={item.search}
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

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {visibleMenuItems.map((item, index) => {
                    const isActive = isActiveRoute(item);
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={`mobile-${item.to}-${item.search?.tab || ''}-${index}`}
                        onClick={() => handleMenuItemClick(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Initialization Banner - Non-blocking status display */}
      <InitializationBanner
        isSlow={watchdog.isSlow}
        hasError={watchdog.hasError}
        authError={watchdog.authError}
        actorError={watchdog.actorError}
        profileError={watchdog.profileError}
        authSlow={watchdog.authSlow}
        actorSlow={watchdog.actorSlow}
        profileSlow={watchdog.profileSlow}
        isAuthenticated={watchdog.isAuthenticated}
      />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with <span className="text-primary">♥</span> using{' '}
          <a 
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${getAppIdentifier()}`}
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
