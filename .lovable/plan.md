

## Robust Network Error Handling for Authentication

### Problem
Currently, when network errors occur (like "Failed to fetch"), the raw error message is shown to users, which is confusing and unhelpful. The app also has no mechanism to clear stale sessions that cause endless refresh token retry loops.

### Solution

#### 1. Create a shared error helper utility
Create `src/lib/auth-errors.ts` with a function that detects network errors (e.g., "Failed to fetch", "NetworkError", "ERR_NETWORK") and returns user-friendly messages with actionable retry hints instead of raw technical errors.

For network errors, the message will say something like: "Unable to connect to the server. Please check your internet connection and try again."

For other common auth errors (invalid credentials, email not confirmed, etc.), it will map them to clearer descriptions.

#### 2. Add an inline error alert to Auth.tsx
Instead of only showing a toast (which disappears), display a persistent `Alert` component above the form when errors occur - especially for network errors. This alert will include:
- A clear description of the problem
- A hint to check internet connection or try again
- A "Try Again" suggestion

The toast will still fire for quick feedback, but the persistent alert ensures the user doesn't miss the message.

#### 3. Clear stale session on auth page load
Add logic in `Auth.tsx` to call `supabase.auth.signOut()` on mount. This stops the endless refresh token retry loop (visible in your logs - the same expired token `uuh3dyzjwtlr` retrying every few seconds). This is the root cause of most "Failed to fetch" errors you're seeing.

#### 4. Update ForgotPasswordDialog with the same error handling
Apply the same friendly error messages and inline feedback to the forgot password dialog.

#### 5. Update ResetPassword page
Apply consistent error handling to the reset password page as well.

---

### Technical Details

**New file:** `src/lib/auth-errors.ts`
- `getAuthErrorMessage(error)` function that pattern-matches on error message strings
- Returns `{ title, description }` with user-friendly text

**Modified files:**
- `src/pages/Auth.tsx` - Add error state, inline Alert, stale session cleanup on mount, use error helper
- `src/components/auth/ForgotPasswordDialog.tsx` - Use error helper for friendly messages
- `src/pages/ResetPassword.tsx` - Use error helper for friendly messages

**Key error mappings:**
- "Failed to fetch" / "NetworkError" -> "Connection problem. Check your internet and try again."
- "Invalid login credentials" -> "The email or password you entered is incorrect."
- "Email not confirmed" -> "Please verify your email address before signing in."
- "User already registered" -> "An account with this email already exists. Try signing in instead."
- "Password should be at least 6 characters" -> kept as-is (already clear)

