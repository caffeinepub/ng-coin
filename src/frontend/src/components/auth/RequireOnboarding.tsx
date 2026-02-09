import { ReactNode } from 'react';
import { useAuthState } from '../../hooks/useAuthState';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function RequireOnboarding({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthState();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  // User needs onboarding if:
  // 1. They are authenticated
  // 2. Profile query has completed (isFetched)
  // 3. Either profile is null (not registered) OR onboarding is not complete
  const needsOnboarding = isAuthenticated && isFetched && (!userProfile || !userProfile.onboardingComplete);

  useEffect(() => {
    if (needsOnboarding) {
      navigate({ to: '/onboarding' });
    }
  }, [needsOnboarding, navigate]);

  // Show loading state while actor is initializing or profile is loading
  if (isLoading || !isFetched) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (needsOnboarding) {
    return null;
  }

  return <>{children}</>;
}
