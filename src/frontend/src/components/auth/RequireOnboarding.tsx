import { ReactNode } from 'react';
import { useAuthState } from '../../hooks/useAuthState';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function RequireOnboarding({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthState();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const needsOnboarding = isAuthenticated && isFetched && userProfile && !userProfile.onboardingComplete;

  useEffect(() => {
    if (needsOnboarding) {
      navigate({ to: '/onboarding' });
    }
  }, [needsOnboarding, navigate]);

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
