import { useEffect, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useSafeActor } from './useSafeActor';
import { useGetCallerUserProfile } from './useCurrentUserProfile';
import { useAuthState } from './useAuthState';

/**
 * Watchdog hook that detects when initialization is taking longer than expected.
 * Returns status flags for different initialization phases.
 */
export function useInitializationWatchdog() {
  const { isInitializing: authInitializing, loginStatus } = useInternetIdentity();
  const { isAuthenticated } = useAuthState();
  const { isLoading: actorLoading, isError: actorError } = useSafeActor();
  const { 
    isLoading: profileLoading, 
    isError: profileQueryError,
    data: profileData,
    isFetched: profileFetched
  } = useGetCallerUserProfile();
  
  const [authSlow, setAuthSlow] = useState(false);
  const [actorSlow, setActorSlow] = useState(false);
  const [profileSlow, setProfileSlow] = useState(false);

  // Only treat as profile error if query failed AND it's not just "no profile yet"
  // If profileData is null but no error, that's a valid state (unregistered user)
  const profileError = profileQueryError && !(profileFetched && profileData === null);

  // Auth initialization watchdog (3 seconds)
  useEffect(() => {
    if (!authInitializing) {
      setAuthSlow(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (authInitializing) {
        setAuthSlow(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [authInitializing]);

  // Actor creation watchdog (4 seconds)
  useEffect(() => {
    if (!actorLoading) {
      setActorSlow(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (actorLoading) {
        setActorSlow(true);
      }
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [actorLoading]);

  // Profile loading watchdog (5 seconds) - only for authenticated users
  useEffect(() => {
    if (!profileLoading || !isAuthenticated) {
      setProfileSlow(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (profileLoading && isAuthenticated) {
        setProfileSlow(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [profileLoading, isAuthenticated]);

  const isAuthError = loginStatus === 'loginError';
  const isSlow = authSlow || actorSlow || profileSlow;
  const hasError = isAuthError || actorError || profileError;

  return {
    isSlow,
    hasError,
    authSlow,
    actorSlow,
    profileSlow,
    authError: isAuthError,
    actorError,
    profileError,
    isAuthenticated,
  };
}
