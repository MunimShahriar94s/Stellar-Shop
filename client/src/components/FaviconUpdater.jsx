import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const FaviconUpdater = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const updateFavicon = () => {
      const faviconUrl = settings.appearance?.favicon;
      
      if (faviconUrl && faviconUrl !== '/favicon.ico') {
        // Remove existing favicon links
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(link => link.remove());
        
        // Add new favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
      } else {
        // Use default favicon
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(link => link.remove());
        
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = '/favicon.ico';
        document.head.appendChild(link);
      }
    };

    updateFavicon();
  }, [settings.appearance?.favicon]);

  return null; // This component doesn't render anything
};

export default FaviconUpdater;
