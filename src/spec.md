# Specification

## Summary
**Goal:** Allow Live Guestbook messages to be deleted only by the original author or an admin, with clear English confirmations and error feedback.

**Planned changes:**
- Update backend `removeMessage(messageId)` authorization to allow deletion by the admin principal or the message’s original author; reject all other callers with a clear English unauthorized error.
- Update backend deletion behavior to reject (with a clear English error) when attempting to delete a non-existent message.
- Add a per-message delete control in `frontend/src/pages/ChatPage.tsx` for authenticated, onboarded users to delete their own messages, including an English confirmation prompt and immediate feed update after success.
- Ensure `frontend/src/components/admin/ChatModerationPanel.tsx` continues to support admins deleting any message, with the same English confirmation and success/error feedback and list refresh after deletion.

**User-visible outcome:** Users can delete their own guestbook messages from the live feed (with confirmation) and see them disappear immediately; admins can still delete any message via the moderation panel; unauthorized or invalid deletions show clear English errors.
