import type { PublicProfile } from '../backend';

/**
 * Get the best display name for a public profile
 * Priority: displayName > companyName > fallback
 */
export function getProfileDisplayName(profile: PublicProfile, fallback = 'Community Member'): string {
  if (profile.displayName && profile.displayName.trim() !== '') {
    return profile.displayName;
  }
  if (profile.companyName && profile.companyName.trim() !== '') {
    return profile.companyName;
  }
  return fallback;
}

/**
 * Get the initial letter for avatar display
 */
export function getProfileInitial(profile: PublicProfile): string {
  const displayName = getProfileDisplayName(profile, '?');
  return displayName.charAt(0).toUpperCase();
}

/**
 * Get secondary text (company name when display name is primary)
 */
export function getProfileSecondaryText(profile: PublicProfile): string | null {
  if (profile.displayName && profile.displayName.trim() !== '' && 
      profile.companyName && profile.companyName.trim() !== '') {
    return profile.companyName;
  }
  return null;
}
