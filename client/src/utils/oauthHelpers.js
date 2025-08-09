// OAuth helper functions

export const googleLogin = () => {
  console.log('Google login helper called');
  try {
    window.open('http://localhost:3000/auth/google', '_blank');
  } catch (err) {
    console.error('Error opening Google OAuth:', err);
    window.location.href = 'http://localhost:3000/auth/google';
  }
};


// Add global access
if (typeof window !== 'undefined') {
  window.oauthHelpers = { googleLogin };
}