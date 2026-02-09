import { useState, useEffect } from 'react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import type { UserProfile } from '../backend';

function MyProfilePageContent() {
  const { data: userProfile, isLoading, isError, refetch } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
        dateOfBirth: userProfile.dateOfBirth,
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
      } as UserProfile);
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

  if (isError || !userProfile) {
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

  const isProfileComplete = userProfile.profileComplete;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
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

        {/* Profile Completion Status */}
        {!isProfileComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete all fields below to earn 500 bonus points!
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
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
