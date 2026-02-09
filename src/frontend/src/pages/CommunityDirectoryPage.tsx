import { useListPublicProfiles } from '../hooks/usePublicProfiles';
import { Link } from '@tanstack/react-router';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';

export default function CommunityDirectoryPage() {
  const { data: profiles, isLoading } = useListPublicProfiles();

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Community Directory</h1>
            <p className="text-muted-foreground">
              Connect with verified members of the NG COIN community
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !profiles || profiles.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[40vh] flex-col items-center justify-center py-12 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">No profiles yet</p>
                <p className="text-sm text-muted-foreground">
                  Check back soon as members join the community
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <Card key={profile.principal.toString()} className="flex h-full flex-col transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {profile.companyName ? profile.companyName.charAt(0).toUpperCase() : '?'}
                      </div>
                      {profile.validated && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Validated
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-1">
                      {profile.companyName || 'Community Member'}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {profile.biography || 'No biography available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-2">
                    <Link
                      to="/community/$principal"
                      params={{ principal: profile.principal.toString() }}
                    >
                      <Button variant="outline" className="w-full gap-2">
                        Learn more
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    {profile.website && profile.website.trim() !== '' && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
