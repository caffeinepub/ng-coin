import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeActor } from './useSafeActor';
import type { ChatMessage } from '../backend';

export function useGetVisibleMessages() {
  const { actor, isFetching: actorFetching } = useSafeActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['visibleMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVisibleMessages();
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
    onSuccess: async () => {
      // Immediately refetch to show the new message
      await queryClient.refetchQueries({ queryKey: ['visibleMessages'] });
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
      queryClient.invalidateQueries({ queryKey: ['visibleMessages'] });
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
      queryClient.invalidateQueries({ queryKey: ['visibleMessages'] });
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
    onMutate: async (messageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['visibleMessages'] });
      await queryClient.cancelQueries({ queryKey: ['allMessages'] });

      // Snapshot the previous values
      const previousVisibleMessages = queryClient.getQueryData<ChatMessage[]>(['visibleMessages']);
      const previousAllMessages = queryClient.getQueryData<ChatMessage[]>(['allMessages']);

      // Optimistically update to remove the message
      if (previousVisibleMessages) {
        queryClient.setQueryData<ChatMessage[]>(
          ['visibleMessages'],
          previousVisibleMessages.filter((msg) => msg.id !== messageId)
        );
      }

      if (previousAllMessages) {
        queryClient.setQueryData<ChatMessage[]>(
          ['allMessages'],
          previousAllMessages.filter((msg) => msg.id !== messageId)
        );
      }

      // Return a context object with the snapshotted values
      return { previousVisibleMessages, previousAllMessages };
    },
    onError: (err, messageId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousVisibleMessages) {
        queryClient.setQueryData(['visibleMessages'], context.previousVisibleMessages);
      }
      if (context?.previousAllMessages) {
        queryClient.setQueryData(['allMessages'], context.previousAllMessages);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['visibleMessages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
    },
  });
}
