import { useState } from 'react';
import { useListPublicProfiles, useCreateOrUpdatePublicProfile } from '../../hooks/usePublicProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { PublicProfile } from '../../backend';

export default function PublicProfileEditor() {
  const { data: profiles } = useListPublicProfiles();
  const updateMutation = useCreateOrUpdatePublicProfile();
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('');
  const [formData, setFormData] = useState<Partial<PublicProfile>>({});

  const selectedProfile = profiles?.find(p => p.principal.toString() === selectedPrincipal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    const updatedProfile: PublicProfile = {
      principal: selectedProfile.principal,
      biography: formData.biography ?? selectedProfile.biography,
      companyName: formData.companyName ?? selectedProfile.companyName,
      website: formData.website ?? selectedProfile.website,
      socialLinks: formData.socialLinks ?? selectedProfile.socialLinks,
      servicesOffered: formData.servicesOffered ?? selectedProfile.servicesOffered,
      validated: selectedProfile.validated,
      eventsAttended: selectedProfile.eventsAttended,
    };

    try {
      await updateMutation.mutateAsync(updatedProfile);
      toast.success('Public profile updated successfully');
      setFormData({});
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update public profile');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Profile Editor</CardTitle>
        <CardDescription>
          Create or update public profile content for community members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select User</Label>
            <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to edit" />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile) => (
                  <SelectItem key={profile.principal.toString()} value={profile.principal.toString()}>
                    {profile.companyName || profile.principal.toString().slice(0, 20)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProfile && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName ?? selectedProfile.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Company or organization name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="biography">Biography</Label>
                <Textarea
                  id="biography"
                  value={formData.biography ?? selectedProfile.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Public biography"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website ?? selectedProfile.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks">Social Links</Label>
                <Input
                  id="socialLinks"
                  value={formData.socialLinks ?? selectedProfile.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                  placeholder="Twitter, LinkedIn, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicesOffered">Services Offered</Label>
                <Textarea
                  id="servicesOffered"
                  value={formData.servicesOffered ?? selectedProfile.servicesOffered}
                  onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
                  placeholder="Services or expertise offered"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({})}
                  disabled={updateMutation.isPending}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
