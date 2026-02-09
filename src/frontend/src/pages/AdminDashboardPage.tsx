import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import RequireAuth from '../components/auth/RequireAuth';
import RequireAdmin from '../components/auth/RequireAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatisticsPanel from '../components/admin/StatisticsPanel';
import ProfileValidationControls from '../components/admin/ProfileValidationControls';
import PublicProfileEditor from '../components/admin/PublicProfileEditor';
import EventsManager from '../components/admin/EventsManager';
import ChatModerationPanel from '../components/admin/ChatModerationPanel';
import { Shield } from 'lucide-react';

type TabValue = 'stats' | 'profiles' | 'public' | 'events' | 'chat';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  
  // Determine initial tab from URL or default to 'stats'
  const initialTab = (search.tab && ['stats', 'profiles', 'public', 'events', 'chat'].includes(search.tab) 
    ? search.tab 
    : 'stats') as TabValue;
  
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Update tab when URL changes
  useEffect(() => {
    if (search.tab && ['stats', 'profiles', 'public', 'events', 'chat'].includes(search.tab)) {
      setActiveTab(search.tab as TabValue);
    }
  }, [search.tab]);

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    setActiveTab(newTab);
    navigate({ to: '/admin', search: { tab: newTab } });
  };

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

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
