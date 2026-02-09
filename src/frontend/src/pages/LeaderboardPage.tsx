import { useGetLeaderboard } from '../hooks/useLeaderboard';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-foreground">Community Leaderboard</h1>
              <p className="text-muted-foreground">
                Top contributors ranked by points earned
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top Contributors
                </CardTitle>
                <CardDescription>
                  Earn points by completing your profile, posting messages, voting, and getting validated
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : !leaderboard || leaderboard.length === 0 ? (
                  <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                    <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">No rankings yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to earn points!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map(([principal, points], index) => (
                      <div
                        key={principal.toString()}
                        className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center">
                            {getRankIcon(index) || (
                              <span className="text-lg font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-sm text-foreground">
                              {principal.toString().slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-base font-bold">
                          {points.toString()} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
