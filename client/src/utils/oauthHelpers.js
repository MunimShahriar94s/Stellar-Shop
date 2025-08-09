// OAuth helper functions

export const googleLogin = () => {
  console.log('Google login helper called');
  try {
    const backendOrigin = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_ORIGIN) || '';
    const url = `${backendOrigin}/auth/google`;
    window.open(url, '_blank');
  } catch (err) {
    console.error('Error opening Google OAuth:', err);
    const backendOrigin = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_ORIGIN) || '';
    window.location.href = `${backendOrigin}/auth/google`;
  }
};


// Add global access
if (typeof window !== 'undefined') {
  window.oauthHelpers = { googleLogin };
}