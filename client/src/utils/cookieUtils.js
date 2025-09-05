// Cookie utility functions for managing user preferences

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Dark mode specific functions
export const getDarkModePreference = () => {
  const stored = getCookie('darkMode');
  if (stored !== null) {
    return stored === 'true';
  }
  // Fallback to system preference if no cookie is set
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const setDarkModePreference = (isDark) => {
  setCookie('darkMode', isDark.toString());
};

// Check if user has explicitly set a preference
export const hasDarkModePreference = () => {
  return getCookie('darkMode') !== null;
};

// Listen for system preference changes
export const listenForSystemPreferenceChange = (callback) => {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only call callback if user hasn't set a preference
      if (!hasDarkModePreference()) {
        callback(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
  return () => {}; // No-op if matchMedia not supported
};

// Debug function to test cookie functionality
export const debugDarkModeCookies = () => {
  console.log('=== Dark Mode Cookie Debug ===');
  console.log('Cookie value:', getCookie('darkMode'));
  console.log('Has preference:', hasDarkModePreference());
  console.log('Current preference:', getDarkModePreference());
  console.log('System preference:', window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  console.log('All cookies:', document.cookie);
  console.log('=============================');
};
