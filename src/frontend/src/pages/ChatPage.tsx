import { useState } from 'react';
import { useGetApprovedMessages, usePostMessage } from '../hooks/useChat';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import VoteButton from '../components/chat/VoteButton';

export default function ChatPage() {
  const { data: messages, isLoading } = useGetApprovedMessages();
  const postMutation = usePostMessage();
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await postMutation.mutateAsync(newMessage.trim());
      setNewMessage('');
      toast.success('Message posted! +50 points');
    } catch (error) {
      console.error('Post error:', error);
      toast.error('Failed to post message. Please try again.');
    }
  };

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-foreground">Community Guestbook</h1>
              <p className="text-muted-foreground">
                Share your thoughts and connect with the community
              </p>
            </div>

            {/* Post Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Post a Message
                </CardTitle>
                <CardDescription>
                  Earn 50 points for each message you share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts with the community..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {newMessage.length}/500 characters
                    </span>
                    <Button type="submit" disabled={postMutation.isPending || !newMessage.trim()}>
                      {postMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Post Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Messages Feed */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <Card>
                  <CardContent className="flex min-h-[40vh] flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to share a message!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card key={message.id.toString()}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <p className="flex-1 text-foreground">{message.content}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs text-muted-foreground">
                          {message.author.toString().slice(0, 8)}...
                        </span>
                        <VoteButton messageId={message.id} votes={message.votes} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
