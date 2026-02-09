import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';
import type { ChatMessage } from '../backend';

export function useGetApprovedMessages() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['approvedMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedMessages();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetAllMessages() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['allMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function usePostMessage() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.postMessage(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useVoteMessage() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.voteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useApproveMessage() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
    },
  });
}

export function useRemoveMessage() {
  const { actor } = useSafeActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
    },
  });
}
