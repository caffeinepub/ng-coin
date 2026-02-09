import { useVoteMessage } from '../../hooks/useChat';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

interface VoteButtonProps {
  messageId: bigint;
  votes: bigint;
}

export default function VoteButton({ messageId, votes }: VoteButtonProps) {
  const voteMutation = useVoteMessage();

  const handleVote = async () => {
    try {
      await voteMutation.mutateAsync(messageId);
      toast.success('Vote recorded! +50 points');
    } catch (error: unknown) {
      console.error('Vote error:', error);
      if (error instanceof Error && error.message.includes('already voted')) {
        toast.error('You have already voted on this message');
      } else {
        toast.error('Failed to vote. Please try again.');
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleVote}
      disabled={voteMutation.isPending}
      className="gap-2"
    >
      <ThumbsUp className="h-4 w-4" />
      {votes.toString()}
    </Button>
  );
}
