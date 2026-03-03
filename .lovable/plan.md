

## Add Apple Sign-In to Auth Page

### Approach
Follow the exact same pattern as the existing Google Sign-In implementation, adding an Apple button next to Google on both Sign In and Sign Up tabs.

### Changes

**`src/pages/Auth.tsx`**
- Add `appleLoading` state
- Add `handleAppleSignIn` function calling `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin })`
- Add Apple sign-in button after the Google button on both tabs, using the Apple logo SVG icon
- Style consistently with the existing Google button (outline variant, full width)

The "Or continue with" divider already exists. The two social buttons will be stacked vertically (Google then Apple).

