import { useListPublicProfiles, useSetProfileValidation } from '../../hooks/usePublicProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileValidationControls() {
  const { data: profiles, isLoading } = useListPublicProfiles();
  const validationMutation = useSetProfileValidation();

  const handleValidation = async (principal: string, validated: boolean) => {
    try {
      const principalObj = { __principal__: principal } as any;
      await validationMutation.mutateAsync({ principal: principalObj, validated });
      toast.success(validated ? 'Profile validated' : 'Validation removed');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to update validation status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Validation</CardTitle>
        <CardDescription>
          Validate or unvalidate user profiles. Validated profiles earn 1000 bonus points.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!profiles || profiles.length === 0 ? (
          <p className="text-center text-muted-foreground">No profiles to manage</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {profile.companyName || 'Community Member'}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {profile.principal.toString().slice(0, 20)}...
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {profile.validated ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Validated
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Validated</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={profile.validated ? 'outline' : 'default'}
                    onClick={() => handleValidation(profile.principal.toString(), !profile.validated)}
                    disabled={validationMutation.isPending}
                  >
                    {profile.validated ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Unvalidate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Validate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
