import { useAuthState } from '../hooks/useAuthState';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, Award, Globe, Shield } from 'lucide-react';
import LoginButton from '../components/auth/LoginButton';
import SponsorsSection from '../components/landing/SponsorsSection';

export default function LandingPage() {
  const { isAuthenticated } = useAuthState();
  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isFetched && userProfile) {
      if (!userProfile.onboardingComplete) {
        navigate({ to: '/onboarding' });
      } else {
        navigate({ to: '/community' });
      }
    }
  }, [isAuthenticated, userProfile, isFetched, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Community Profiles',
      description: 'Connect with verified members and showcase your contributions',
    },
    {
      icon: MessageSquare,
      title: 'Live Guestbook',
      description: 'Share messages and engage with the community in real-time',
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Participate in community events and track your involvement',
    },
    {
      icon: Award,
      title: 'Points System',
      description: 'Earn recognition for your engagement and contributions',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Be part of a worldwide movement for positive change',
    },
    {
      icon: Shield,
      title: 'Transparent & Secure',
      description: 'Built on Internet Computer for trust and transparency',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <div className="mb-8 flex justify-center">
          <img 
            src="/assets/generated/ng-coin-logo.dim_512x512.png" 
            alt="NG COIN" 
            className="h-32 w-32 rounded-2xl shadow-lg"
          />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Welcome to NG COIN
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          A community-driven platform created to showcase and support global impact projects. 
          Join us in building a trusted, transparent, and inclusive community.
        </p>
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          Why Join NG COIN?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* Mission Statement */}
      <Card className="bg-primary/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            NG COIN aims to unite a trusted community, promote transparency, engagement, and inclusion, 
            and highlight partners, events, and contributors. We grow through sponsors and public or 
            private grants, working together to create meaningful global impact.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
