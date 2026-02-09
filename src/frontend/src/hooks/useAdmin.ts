import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStatistics() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<{
    totalUsers: bigint;
    totalMessages: bigint;
    totalEvents: bigint;
    totalPoints: bigint;
  }>({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStatistics();
    },
    enabled: !!actor && !actorFetching,
  });
}
