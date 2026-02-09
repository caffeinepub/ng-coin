import RequireAuth from '../components/auth/RequireAuth';
import RequireAdmin from '../components/auth/RequireAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatisticsPanel from '../components/admin/StatisticsPanel';
import ProfileValidationControls from '../components/admin/ProfileValidationControls';
import PublicProfileEditor from '../components/admin/PublicProfileEditor';
import EventsManager from '../components/admin/EventsManager';
import ChatModerationPanel from '../components/admin/ChatModerationPanel';
import { Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <RequireAdmin>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-foreground">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage community profiles, events, and content
            </p>
          </div>

          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="public">Public Profiles</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <StatisticsPanel />
            </TabsContent>

            <TabsContent value="profiles">
              <ProfileValidationControls />
            </TabsContent>

            <TabsContent value="public">
              <PublicProfileEditor />
            </TabsContent>

            <TabsContent value="events">
              <EventsManager />
            </TabsContent>

            <TabsContent value="chat">
              <ChatModerationPanel />
            </TabsContent>
          </Tabs>
        </div>
      </RequireAdmin>
    </RequireAuth>
  );
}
