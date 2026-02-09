import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import RequireAuth from '../components/auth/RequireAuth';
import RequireOnboarding from '../components/auth/RequireOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';

export default function MyProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      fullName: formData.fullName ?? userProfile.fullName,
      email: formData.email ?? userProfile.email,
      phone: formData.phone ?? userProfile.phone,
      address: formData.address ?? userProfile.address,
      dateOfBirth: formData.dateOfBirth ?? userProfile.dateOfBirth,
    };

    try {
      await saveMutation.mutateAsync(updatedProfile);
      toast.success('Profile updated successfully!');
      setFormData({});
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const currentFullName = formData.fullName ?? userProfile.fullName;
  const currentEmail = formData.email ?? userProfile.email;
  const currentPhone = formData.phone ?? userProfile.phone;
  const currentAddress = formData.address ?? userProfile.address;
  const currentDateOfBirth = formData.dateOfBirth ?? userProfile.dateOfBirth;

  return (
    <RequireAuth>
      <RequireOnboarding>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Points Summary */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Your Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-foreground">
                      {userProfile.points.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Points Earned</p>
                  </div>
                  {userProfile.profileComplete && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Profile Complete
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Private Profile
                </CardTitle>
                <CardDescription>
                  This information is visible only to you and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={currentFullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={currentDateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={currentEmail}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={currentPhone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={currentAddress}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, City, Country"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({})}
                      disabled={saveMutation.isPending}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {!userProfile.profileComplete && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    💡 Complete all required fields to earn <strong>500 bonus points</strong> and unlock your profile completion badge!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </RequireOnboarding>
    </RequireAuth>
  );
}
