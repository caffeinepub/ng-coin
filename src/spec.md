# Specification

## Summary
**Goal:** Prevent the app from getting stuck on the full-screen “Loading...” state so users can quickly see the main UI and access login/onboarding, even when auth/actor/profile initialization is slow or failing.

**Planned changes:**
- Ensure initial app shell (header + Sign In/Sign Out controls) renders without waiting on authentication, actor creation, or profile/admin initialization.
- Make actor creation and admin access-control initialization non-blocking and fault-tolerant (timeouts/catches) so React Query cannot hang indefinitely.
- Add user-visible English fallback/error states for long/failed initialization (e.g., “taking longer than expected”) with clear recovery actions (Retry and/or Reload).
- Keep public routes (e.g., Home, Partners) reachable regardless of authenticated-only initialization status.

**User-visible outcome:** Visiting the site shows the header and public pages promptly; if login/actor/profile setup is slow or fails, users see an English message with Retry/Reload instead of an infinite loading spinner and can still navigate to login/onboarding.
