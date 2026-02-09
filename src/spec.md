# Specification

## Summary
**Goal:** Add a dedicated Sponsors section on the public Landing page with external links to the four provided sponsor websites.

**Planned changes:**
- Add a clearly labeled "Sponsors" section to `frontend/src/pages/LandingPage.tsx`.
- Display four sponsor entries (NG Environnement, DMC Technologies, Iorga, Metadev) with URLs exactly matching the user-provided links.
- Add a consistent external-link action labeled "Learn more" for each sponsor, opening in a new tab with `rel="noopener noreferrer"`, styled consistently with the existing external link button pattern (e.g., as used on the Partners page).

**User-visible outcome:** Visitors to the Landing page can see a "Sponsors" section and click "Learn more" to open each sponsor’s website in a new browser tab.
