import { useGetAllMessages, useApproveMessage, useRemoveMessage } from '../../hooks/useChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatModerationPanel() {
  const { data: messages, isLoading } = useGetAllMessages();
  const approveMutation = useApproveMessage();
  const removeMutation = useRemoveMessage();

  const handleApprove = async (messageId: bigint) => {
    try {
      await approveMutation.mutateAsync(messageId);
      toast.success('Message approved');
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve message. Please try again.');
    }
  };

  const handleRemove = async (messageId: bigint) => {
    if (!confirm('Are you sure you want to remove this message?')) return;
    
    try {
      await removeMutation.mutateAsync(messageId);
      toast.success('Message removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove message. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat Moderation</CardTitle>
        <CardDescription>
          Approve or remove community messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!messages || messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages to moderate</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id.toString()}
                className="rounded-lg border border-border p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <p className="flex-1 text-foreground">{message.content}</p>
                  {message.approved ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {message.author.toString().slice(0, 12)}... • {message.votes.toString()} votes
                  </span>
                  <div className="flex gap-2">
                    {!message.approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(message.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(message.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
