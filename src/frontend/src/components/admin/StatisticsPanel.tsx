import { useGetStatistics } from '../../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, Award } from 'lucide-react';

export default function StatisticsPanel() {
  const { data: stats, isLoading } = useGetStatistics();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages.toString(),
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents.toString(),
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      title: 'Total Points',
      value: stats.totalPoints.toString(),
      icon: Award,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
