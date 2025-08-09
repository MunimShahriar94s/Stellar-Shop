// Profile picture utility functions

/**
 * Validates and processes a profile picture URL
 * @param {string} pictureUrl - The profile picture URL
 * @returns {string|null} - The processed URL or null if invalid
 */
export const processProfilePictureUrl = (pictureUrl) => {
  if (!pictureUrl) return null;

  try {
    if (typeof pictureUrl === 'string') {
      const trimmed = pictureUrl.trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

      const backendOrigin = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_ORIGIN)
        || (typeof window !== 'undefined' && window.__BACKEND_ORIGIN)
        || null;

      // Allow data/blob URLs as-is
      if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
      }

      // Protocol-relative URL (e.g., //example.com/img.png)
      if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
      }

      const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);

      // Absolute path on server (e.g., /uploads/..., /images/...)
      if (!hasProtocol && trimmed.startsWith('/')) {
        // In dev, serve from backend origin if provided
        if (backendOrigin) {
          return `${backendOrigin}${trimmed}`;
        }
        if (typeof window !== 'undefined' && window.location?.origin) {
          return `${window.location.origin}${trimmed}`;
        }
        return trimmed;
      }

      // Relative path like uploads/avatar.png or images/x.png
      if (!hasProtocol) {
        if (backendOrigin) {
          return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`;
        }
        if (typeof window !== 'undefined' && window.location?.origin) {
          return `${window.location.origin}/${trimmed.replace(/^\/+/, '')}`;
        }
        return trimmed;
      }
    }

    const url = new URL(pictureUrl);

    // Prefer HTTPS for security, but keep localhost/http unchanged
    if (url.protocol === 'http:' && !/^(localhost|127\.0\.0\.1)(:|$)/.test(url.hostname)) {
      url.protocol = 'https:';
    }

    // For Google profile pictures, ensure a good size
    if (url.hostname.includes('googleusercontent.com')) {
      url.searchParams.set('sz', '192');
    }

    return url.toString();
  } catch (error) {
    // Fallback: prefix origin for root-relative paths
    try {
      if (typeof pictureUrl === 'string') {
        const trimmed = pictureUrl.trim();
        if (trimmed.startsWith('/') && typeof window !== 'undefined' && window.location?.origin) {
          return `${window.location.origin}${trimmed}`;
        }
      }
    } catch (_) {}
    console.error('Invalid profile picture URL:', pictureUrl, error);
    return null;
  }
};

/**
 * Creates initials from a name
 * @param {string} name - The user's name
 * @returns {string} - The initials (first letter of each word, up to 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generates a fallback avatar with initials
 * @param {string} name - The user's name
 * @param {string} color - The background color (optional)
 * @returns {string} - Data URL for the avatar
 */
export const generateAvatarWithInitials = (name, color = '#ff6b6b') => {
  const initials = getInitials(name);
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  
  const ctx = canvas.getContext('2d');
  
  // Draw background circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(50, 50, 50, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw initials
  ctx.fillStyle = 'white';
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 50, 50);
  
  return canvas.toDataURL();
};


