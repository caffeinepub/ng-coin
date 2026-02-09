import { useQuery } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';
import { Principal } from '@dfinity/principal';

export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<Array<[Principal, bigint]>>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !actorFetching,
  });
}
