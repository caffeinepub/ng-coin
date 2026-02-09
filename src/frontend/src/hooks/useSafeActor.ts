import { useQuery } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { createActorWithConfig } from '../config';
import type { backendInterface } from '../backend';

/**
 * Safe actor hook that creates the backend actor without blocking on
 * long-running initialization (e.g., admin access-control setup).
 * Returns actor as soon as it's created, allowing UI to render.
 */
export function useSafeActor() {
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<backendInterface | null>({
    queryKey: ['safeActor', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!identity) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }
      
      try {
        const actorOptions = {
          agentOptions: {
            identity
          }
        };
        
        // Create actor immediately without waiting for initialization
        const actor = await createActorWithConfig(actorOptions);
        
        // Fire-and-forget: attempt admin initialization in background
        // with timeout to prevent hanging
        const initPromise = Promise.race([
          actor.isCallerAdmin().catch(() => false),
          new Promise((resolve) => setTimeout(() => resolve(false), 5000))
        ]);
        
        // Don't await - let it run in background
        initPromise.catch((error) => {
          console.warn('Admin initialization failed (non-fatal):', error);
        });
        
        return actor;
      } catch (error) {
        console.error('Failed to create actor:', error);
        throw error;
      }
    },
    enabled: !isInitializing,
    retry: 1,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    actor: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
