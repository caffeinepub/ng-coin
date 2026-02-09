import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useGetOwnPublicProfile } from '../hooks/usePublicProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, CheckCircle2, AlertCircle, Trophy, UserPlus, Lock, Globe, ExternalLink } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { extractUrls } from '../utils/linkParsing';
import { getProfileDisplayName } from '../utils/profileDisplay';
import type { PrivateUserProfile } from '../backend';

function MyProfilePageContent() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading, isError, isFetched, refetch } = useGetCallerUserProfile();
  const { data: publicProfile, isLoading: publicLoading } = useGetOwnPublicProfile();
  const saveMutation = useSaveCallerUserProfile();
  const [formData, setFormData] = useState<Partial<PrivateUserProfile>>({
    fullName: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    website: '',
    socialLinks: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName,
        displayName: userProfile.displayName,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
        dateOfBirth: userProfile.dateOfBirth,
        website: userProfile.website,
        socialLinks: userProfile.socialLinks,
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      await saveMutation.mutateAsync({
        ...userProfile,
        ...formData,
      } as PrivateUserProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show onboarding CTA if profile is null (not registered yet)
  if (isFetched && userProfile === null && !isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Welcome to NG COIN!</CardTitle>
                <CardDescription>Complete your registration to get started</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You need to complete the onboarding process to access your profile and community features.
            </p>
            <Button onClick={() => navigate({ to: '/onboarding' })} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state only for genuine query failures
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mx-auto max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <p>Failed to load your profile. Please try again.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="w-fit">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Should not happen, but handle gracefully
  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const isProfileComplete = userProfile.profileComplete;
  const socialUrls = extractUrls(formData.socialLinks || '');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Points Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Points</CardTitle>
                <CardDescription>Earn points by completing your profile and participating</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                <Trophy className="h-8 w-8" />
                {Number(userProfile.points)}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Private Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Private Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This information is private and only visible to you and administrators.
          </p>

          {/* Profile Completion Status */}
          {!isProfileComplete && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete all required fields (*) to earn 500 bonus points!
              </AlertDescription>
            </Alert>
          )}

          {isProfileComplete && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                Your profile is complete! You've earned all available profile bonuses.
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your private profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="How you want to be known"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your personal or business website
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialLinks">Social Links</Label>
                  <Textarea
                    id="socialLinks"
                    value={formData.socialLinks}
                    onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                    placeholder="https://twitter.com/yourhandle&#10;https://linkedin.com/in/yourprofile"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add your social media profiles (one URL per line)
                  </p>
                  {socialUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {socialUrls.map((url, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {new URL(url).hostname.replace('www.', '')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {saveMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to save profile. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                {saveMutation.isSuccess && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900 dark:text-green-100">
                      Profile saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Public Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Public Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Your public profile is managed by administrators and visible to the community once validated.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Public Profile Status</CardTitle>
              <CardDescription>
                Administrators create and validate public profiles for community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publicLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : publicProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {getProfileDisplayName(publicProfile, '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{getProfileDisplayName(publicProfile)}</p>
                        {publicProfile.companyName && publicProfile.displayName && (
                          <p className="text-sm text-muted-foreground">{publicProfile.companyName}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={publicProfile.validated ? 'default' : 'secondary'} className="gap-1">
                      {publicProfile.validated ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Validated
                        </>
                      ) : (
                        'Pending Validation'
                      )}
                    </Badge>
                  </div>

                  {publicProfile.biography && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Biography</p>
                      <p className="text-sm text-muted-foreground">{publicProfile.biography}</p>
                    </div>
                  )}

                  {publicProfile.website && publicProfile.website.trim() !== '' && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Website</p>
                      <a
                        href={publicProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {publicProfile.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {publicProfile.socialLinks && publicProfile.socialLinks.trim() !== '' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Social Links</p>
                      <div className="flex flex-wrap gap-2">
                        {extractUrls(publicProfile.socialLinks).map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {new URL(url).hostname.replace('www.', '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {publicProfile.servicesOffered && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Services Offered</p>
                      <p className="text-sm text-muted-foreground">{publicProfile.servicesOffered}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Community Activity</p>
                    <p className="text-sm text-muted-foreground">
                      {Number(publicProfile.eventsAttended)} events attended
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Globe className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium text-muted-foreground">
                    Your public profile has not been created yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Administrators will create and publish your public profile once you're an active community member.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <RequireAuth>
      <RequireOnboarding>
        <MyProfilePageContent />
      </RequireOnboarding>
    </RequireAuth>
  );
}
