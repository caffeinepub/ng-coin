import { useParams } from '@tanstack/react-router';
import { useGetEvent, useRsvpToEvent } from '../hooks/useEvents';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const { eventId } = useParams({ from: '/events/$eventId' });
  const { data: event, isLoading } = useGetEvent(eventId);
  const rsvpMutation = useRsvpToEvent();

  const handleRsvp = async (attending: boolean) => {
    try {
      await rsvpMutation.mutateAsync({ eventId: BigInt(eventId), attending });
      toast.success(attending ? 'RSVP confirmed!' : 'Response recorded');
    } catch (error: unknown) {
      console.error('RSVP error:', error);
      if (error instanceof Error && error.message.includes('already responded')) {
        toast.error('You have already responded to this event');
      } else {
        toast.error('Failed to RSVP. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex min-h-[40vh] items-center justify-center py-12">
            <p className="text-muted-foreground">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </div>
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                <CardDescription className="text-base">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Participation Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Attending</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {event.rsvpCount.toString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <X className="h-5 w-5" />
                      <span className="text-sm font-medium">Not Attending</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {event.notAttendingCount.toString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Will you participate?</CardTitle>
                <CardDescription>
                  Let us know if you plan to attend this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleRsvp(true)}
                    disabled={rsvpMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    <Check className="h-4 w-4" />
                    I will participate
                  </Button>
                  <Button
                    onClick={() => handleRsvp(false)}
                    disabled={rsvpMutation.isPending}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <X className="h-4 w-4" />
                    I will not participate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
