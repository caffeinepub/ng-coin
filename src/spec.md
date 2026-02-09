# Specification

## Summary
**Goal:** Add an admin-only navigation entry for direct access to the Admin Dashboard’s profile management tab.

**Planned changes:**
- Update `frontend/src/components/layout/AppShell.tsx` to include a new admin-only menu item labeled “Profile Management” that routes to `/admin?tab=profiles`.
- Ensure the “Profile Management” entry appears in both the desktop navigation and the mobile sheet menu, following existing admin visibility/onboarding gating rules.
- Update active-route highlighting logic so the “Profile Management” entry is shown as active when the current URL is `/admin?tab=profiles`.

**User-visible outcome:** Admin users see a “Profile Management” option in the main navigation (desktop and mobile) that opens the Admin Dashboard with the Profiles tab selected; non-admin users do not see this option.
