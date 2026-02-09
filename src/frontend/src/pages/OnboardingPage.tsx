import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthState } from '../hooks/useAuthState';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useRegisterUser, useCompleteOnboarding } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Globe, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';
import RequireAuth from '../components/auth/RequireAuth';

export default function OnboardingPage() {
  const { isAuthenticated } = useAuthState();
  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const registerMutation = useRegisterUser();
  const completeMutation = useCompleteOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);

  const needsRegistration = isAuthenticated && isFetched && !userProfile;
  const needsOnboarding = isAuthenticated && isFetched && userProfile && !userProfile.onboardingComplete;

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      if (needsRegistration) {
        await registerMutation.mutateAsync();
        toast.success('Welcome! Registration complete.');
      }
      
      await completeMutation.mutateAsync();
      toast.success('Onboarding complete! Welcome to NG COIN.');
      navigate({ to: '/profile' });
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return <RequireAuth><div /></RequireAuth>;
  }

  if (!needsRegistration && !needsOnboarding) {
    navigate({ to: '/community' });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <div className="mb-8 text-center">
          <img 
            src="/assets/generated/ng-coin-logo.dim_512x512.png" 
            alt="NG COIN" 
            className="mx-auto mb-6 h-24 w-24 rounded-xl shadow-lg"
          />
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            Welcome to NG COIN
          </h1>
          <p className="text-lg text-muted-foreground">
            Join our community-driven platform for global impact
          </p>
        </div>

        {/* Project Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              The NG COIN Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              NG COIN is a community-driven ICP application created to showcase and support 
              global impact projects. We are open to everyone and aim to grow through sponsors 
              and public or private grants.
            </p>
            <p>
              Our platform connects passionate individuals, organizations, and partners who 
              share a commitment to transparency, engagement, and meaningful change.
            </p>
          </CardContent>
        </Card>

        {/* Global Vision */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Global Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We envision a world where technology empowers communities to create lasting 
              positive impact. Through blockchain transparency and collaborative action, 
              we're building bridges between local initiatives and global support.
            </p>
            <p>
              Every member contributes to this vision—whether through participation, 
              sharing knowledge, or supporting projects that matter.
            </p>
          </CardContent>
        </Card>

        {/* Community Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Community Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Transparency: All actions and contributions are visible and verifiable',
                'Inclusion: Everyone is welcome to participate and contribute',
                'Engagement: Active participation strengthens our community',
                'Trust: Built on secure Internet Computer technology',
                'Impact: Every action contributes to real-world change',
              ].map((value, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleComplete}
            disabled={isProcessing}
            className="px-8"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              'Join the Community'
            )}
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            By joining, you agree to participate respectfully and contribute positively
          </p>
        </div>
      </div>
    </div>
  );
}
