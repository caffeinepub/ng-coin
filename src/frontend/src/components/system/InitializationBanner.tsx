import { AlertCircle, Loader2, RefreshCw, RotateCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeActor } from '../../hooks/useSafeActor';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';

interface InitializationBannerProps {
  isSlow: boolean;
  hasError: boolean;
  authError?: boolean;
  actorError?: boolean;
  profileError?: boolean;
  authSlow?: boolean;
  actorSlow?: boolean;
  profileSlow?: boolean;
  isAuthenticated?: boolean;
}

export function InitializationBanner({
  isSlow,
  hasError,
  authError,
  actorError,
  profileError,
  authSlow,
  actorSlow,
  profileSlow,
  isAuthenticated,
}: InitializationBannerProps) {
  const queryClient = useQueryClient();
  const { refetch: refetchActor } = useSafeActor();
  const { refetch: refetchProfile } = useGetCallerUserProfile();

  if (!isSlow && !hasError) {
    return null;
  }

  const handleRetry = async () => {
    // Targeted retry: refetch the specific failing queries
    if (actorError) {
      await refetchActor();
    }
    if (profileError && isAuthenticated) {
      await refetchProfile();
    }
    // Also invalidate to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['safeActor'] });
    if (isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Error state - show error message with retry/reload actions
  if (hasError) {
    let errorMessage = 'An error occurred during initialization.';
    
    if (authError) {
      errorMessage = 'Failed to initialize authentication. Please try signing in again.';
    } else if (actorError) {
      errorMessage = 'Failed to connect to the backend service. Please check your connection and try again.';
    } else if (profileError) {
      errorMessage = 'Failed to load your profile. You can still browse public pages.';
    }

    return (
      <Alert variant="destructive" className="mx-4 my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Initialization Error</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3">
          <p>{errorMessage}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="bg-background"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReload}
              className="bg-background"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Slow state - show "taking longer than expected" message
  if (isSlow) {
    let slowMessage = 'Initialization is taking longer than expected...';
    
    if (authSlow) {
      slowMessage = 'Authentication is taking longer than expected. Please wait or reload the page.';
    } else if (actorSlow) {
      slowMessage = 'Connecting to the backend is taking longer than expected. Please wait or reload the page.';
    } else if (profileSlow) {
      slowMessage = 'Loading your profile is taking longer than expected. You can still browse public pages.';
    }

    return (
      <Alert className="mx-4 my-4 border-yellow-500/50 bg-yellow-500/10">
        <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          Please Wait
        </AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3 text-yellow-800 dark:text-yellow-200">
          <p>{slowMessage}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReload}
              className="border-yellow-600/30 bg-background hover:bg-yellow-500/20"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
