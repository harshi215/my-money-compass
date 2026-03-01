export function getAuthErrorMessage(error: { message: string } | string): { title: string; description: string } {
  const message = typeof error === 'string' ? error : error.message;
  const lower = message.toLowerCase();

  // Network errors
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('err_network') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return {
      title: 'Connection problem',
      description: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  // Invalid credentials
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return {
      title: 'Invalid credentials',
      description: 'The email or password you entered is incorrect. Please try again.',
    };
  }

  // Email not confirmed
  if (lower.includes('email not confirmed')) {
    return {
      title: 'Email not verified',
      description: 'Please verify your email address before signing in. Check your inbox for a confirmation link.',
    };
  }

  // User already registered
  if (lower.includes('user already registered')) {
    return {
      title: 'Account exists',
      description: 'An account with this email already exists. Try signing in instead.',
    };
  }

  // Rate limiting
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return {
      title: 'Too many attempts',
      description: "You've made too many requests. Please wait a moment and try again.",
    };
  }

  // Fallback
  return {
    title: 'Something went wrong',
    description: message || 'An unexpected error occurred. Please try again.',
  };
}
