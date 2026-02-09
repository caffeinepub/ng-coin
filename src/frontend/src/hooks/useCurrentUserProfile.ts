import { useQuery } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';
import { useAuthState } from './useAuthState';
import type { PrivateUserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useSafeActor();
  const { isAuthenticated } = useAuthState();

  const query = useQuery<PrivateUserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        // Handle known authorization-style errors gracefully
        const errorMessage = error?.message || String(error);
        
        // These are expected states, not errors - return null
        if (
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('Anonymous users') ||
          errorMessage.includes('must be registered') ||
          errorMessage.includes('not found')
        ) {
          return null;
        }
        
        // For other errors (network, canister issues), throw to trigger retry
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: (failureCount, error: any) => {
      // Don't retry authorization errors
      const errorMessage = error?.message || String(error);
      if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Anonymous users') ||
        errorMessage.includes('must be registered')
      ) {
        return false;
      }
      // Retry network/canister errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
