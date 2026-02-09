import { useParams } from '@tanstack/react-router';
import { useGetPublicProfile } from '../hooks/usePublicProfiles';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Globe, Briefcase, ExternalLink, Calendar, Link as LinkIcon } from 'lucide-react';
import { extractUrls, getUrlLabel } from '../utils/linkParsing';
import { getProfileDisplayName, getProfileSecondaryText, getProfileInitial } from '../utils/profileDisplay';

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
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center py-12 text-center">
            <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Profile not found</p>
            <p className="text-sm text-muted-foreground">
              This profile may not exist or is not yet validated
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = getProfileDisplayName(profile);
  const secondaryText = getProfileSecondaryText(profile);
  const initial = getProfileInitial(profile);
  const socialUrls = extractUrls(profile.socialLinks);

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {initial}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{displayName}</CardTitle>
                        {profile.validated && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Validated
                          </Badge>
                        )}
                      </div>
                      {secondaryText && (
                        <p className="text-muted-foreground">{secondaryText}</p>
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
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{profile.biography}</p>
                </CardContent>
              </Card>
            )}

            {/* Services Offered */}
            {profile.servicesOffered && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Services Offered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{profile.servicesOffered}</p>
                </CardContent>
              </Card>
            )}

            {/* Links Section */}
            {(profile.website || socialUrls.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.website && profile.website.trim() !== '' && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {profile.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {socialUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {getUrlLabel(url)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Community Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-base">
                    {Number(profile.eventsAttended)}
                  </Badge>
                  <span className="text-muted-foreground">events attended</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
