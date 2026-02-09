# Specification

## Summary
**Goal:** Add header navigation links for authenticated, onboarded users to quickly access the existing Events and Community Guestbook pages.

**Planned changes:**
- Update the top header (AppShell) to show primary navigation links labeled “Events” (/events) and “Chat” (/chat) when the user is authenticated and has completed onboarding.
- Ensure header links match existing navigation styling, including active vs inactive states.
- Preserve responsive behavior: keep existing bottom navigation on small screens, and show the added header links on larger screens without changing existing routes or access rules.

**User-visible outcome:** On desktop/tablet, onboarded signed-in users see “Events” and “Chat” links in the header that navigate to the existing pages; on mobile, navigation continues to work via the existing bottom navigation, and non-authenticated/non-onboarded users do not see these added header links.
