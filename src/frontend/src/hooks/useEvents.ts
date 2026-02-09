import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Event } from '../backend';

export function useListEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEvents();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetEvent(eventId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEvent(BigInt(eventId));
    },
    enabled: !!actor && !actorFetching && !!eventId,
    refetchInterval: 5000, // Poll for live RSVP counts
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, date, location }: { title: string; description: string; date: string; location: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEvent(title, description, date, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, title, description, date, location }: { eventId: bigint; title: string; description: string; date: string; location: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateEvent(eventId, title, description, date, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useRsvpToEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, attending }: { eventId: bigint; attending: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rsvpToEvent(eventId, attending);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
