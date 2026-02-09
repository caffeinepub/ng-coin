import { useInternetIdentity } from './useInternetIdentity';

export function useAuthState() {
  const { identity, loginStatus } = useInternetIdentity();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal().toString() || null;

  return {
    isAuthenticated,
    principal,
    identity,
    loginStatus,
  };
}
