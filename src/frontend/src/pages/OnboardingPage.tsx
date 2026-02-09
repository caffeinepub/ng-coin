import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthState } from '../hooks/useAuthState';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useRegisterUser, useCompleteOnboarding } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Globe, Users, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const { data: userProfile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const registerMutation = useRegisterUser();
  const completeMutation = useCompleteOnboarding();
  const [step, setStep] = useState<'welcome' | 'register' | 'complete'>('welcome');

  const isRegistered = userProfile?.registrationComplete;
  const isOnboarded = userProfile?.onboardingComplete;

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync();
      setStep('complete');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync();
      navigate({ to: '/community' });
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the onboarding process.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mx-auto max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <p>Failed to load your profile. Please try again.</p>
            <Button size="sm" variant="outline" onClick={() => refetchProfile()} className="w-fit">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isOnboarded) {
    navigate({ to: '/community' });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Welcome to NG COIN</h1>
          <p className="text-lg text-muted-foreground">
            Join our global community building a better future together
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Globe className="mb-2 h-8 w-8 text-primary" />
              <CardTitle className="text-lg">Global Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with innovators worldwide working towards sustainable development and positive change.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle className="text-lg">Community First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Collaborate, share knowledge, and grow together in a supportive environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="mb-2 h-8 w-8 text-primary" />
              <CardTitle className="text-lg">Impact Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every action counts. Earn points and recognition for your contributions to the community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Steps */}
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Complete these steps to join the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Registration */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {isRegistered ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                    1
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Register Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  Create your profile and earn 100 points to get started
                </p>
                {!isRegistered && step === 'welcome' && (
                  <Button
                    onClick={handleRegister}
                    disabled={registerMutation.isPending}
                    className="mt-3"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </Button>
                )}
                {registerMutation.isError && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Registration failed. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Step 2: Complete Onboarding */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {isOnboarded ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground text-sm font-bold text-muted-foreground">
                    2
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Complete Onboarding</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm your commitment to our community values
                </p>
                {isRegistered && !isOnboarded && (
                  <Button
                    onClick={handleComplete}
                    disabled={completeMutation.isPending}
                    className="mt-3"
                  >
                    {completeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      'Complete Onboarding'
                    )}
                  </Button>
                )}
                {completeMutation.isError && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to complete onboarding. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
