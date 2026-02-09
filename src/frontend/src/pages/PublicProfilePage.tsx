import { useParams } from '@tanstack/react-router';
import { useGetPublicProfile } from '../hooks/usePublicProfiles';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Globe, Briefcase, ExternalLink, Calendar, Link as LinkIcon } from 'lucide-react';
import { extractUrls, getUrlLabel } from '../utils/linkParsing';

export default function PublicProfilePage() {
  const { principal } = useParams({ from: '/community/$principal' });
  const { data: profile, isLoading } = useGetPublicProfile(principal);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex min-h-[40vh] items-center justify-center py-12">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract valid URLs from social links
  const socialUrls = profile.socialLinks ? extractUrls(profile.socialLinks) : [];

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {profile.companyName ? profile.companyName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {profile.companyName || 'Community Member'}
                      </CardTitle>
                      {profile.validated && (
                        <Badge variant="default" className="mt-2 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Validated Profile
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Biography */}
            {profile.biography && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.biography}</p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {profile.servicesOffered && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5" />
                    Services Offered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.servicesOffered}</p>
                </CardContent>
              </Card>
            )}

            {/* Links */}
            {(profile.website || profile.socialLinks) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                        <ExternalLink className="ml-auto h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {profile.socialLinks && (
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-2 text-sm font-medium text-foreground">Social Media</p>
                      {socialUrls.length > 0 ? (
                        <div className="space-y-2">
                          {socialUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              {getUrlLabel(url)}
                              <ExternalLink className="ml-auto h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{profile.socialLinks}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {profile.eventsAttended.toString()}
                  </span>
                  <span className="text-sm text-muted-foreground">Events Attended</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
