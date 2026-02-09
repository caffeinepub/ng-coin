import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { PublicProfile } from '../backend';

export function useListPublicProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicProfile[]>({
    queryKey: ['publicProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublicProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPublicProfile(principalString: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicProfile>({
    queryKey: ['publicProfile', principalString],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalString);
      return actor.getPublicProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principalString,
  });
}

export function useCreateOrUpdatePublicProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PublicProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrUpdatePublicProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    },
  });
}

export function useSetProfileValidation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, validated }: { principal: Principal; validated: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setProfileValidation(principal, validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
