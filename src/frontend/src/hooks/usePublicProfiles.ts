import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';
import { Principal } from '@dfinity/principal';
import type { PublicProfile } from '../backend';

export function useListPublicProfiles() {
  const { actor, isFetching: actorFetching } = useSafeActor();

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
  const { actor, isFetching: actorFetching } = useSafeActor();

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

export function useGetOwnPublicProfile() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<PublicProfile | null>({
    queryKey: ['ownPublicProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOwnPublicProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdatePublicProfile() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PublicProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrUpdatePublicProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
      queryClient.invalidateQueries({ queryKey: ['ownPublicProfile'] });
    },
  });
}

export function useSetProfileValidation() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, validated }: { principal: Principal; validated: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setProfileValidation(principal, validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
      queryClient.invalidateQueries({ queryKey: ['ownPublicProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
