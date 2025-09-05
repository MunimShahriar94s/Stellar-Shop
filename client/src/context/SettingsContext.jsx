import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import { getDarkModePreference, setDarkModePreference, listenForSystemPreferenceChange, debugDarkModeCookies } from '../utils/cookieUtils';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: {
      storeName: 'StellarShop',
      storeEmail: 'info@stellarshop.com',
      storePhone: '(212) 555-1234',
      storeAddress: '123 Shopping Street, Retail District, New York, NY 10001',
      currency: 'USD',
      language: 'en'
    },
    appearance: {
      primaryColor: '#ff6b6b',
      secondaryColor: '#e05050',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      logoGlowColor: '#ff6b6b',
      showFeaturedProducts: true,
      productsPerPage: 12,
      enableDarkMode: false
    },
    hero: {
      slides: [
        {
          id: 1,
          title: "Discover <span>Premium</span> Products for Your Lifestyle",
          description: "Explore our curated collection of high-quality products designed to enhance your everyday life. From cutting-edge electronics to stylish home decor, we have everything you need.",
          backgroundImage: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          buttonText: "Shop Now",
          buttonLink: "/products",
          secondaryButtonText: "Learn More",
          secondaryButtonLink: "/about",
          active: true
        },
        {
          id: 2,
          title: "Exclusive Deals & Limited Time Offers",
          description: "Don't miss out on our exclusive deals and limited-time offers. Save big on premium products while supplies last.",
          backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          buttonText: "View Deals",
          buttonLink: "/products",
          secondaryButtonText: "Sign Up",
          secondaryButtonLink: "/signup",
          active: true
        },
        {
          id: 3,
          title: "Free Shipping on Orders Over $100",
          description: "Enjoy free shipping on all orders over $100. Fast, reliable delivery to your doorstep with premium customer service.",
          backgroundImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          buttonText: "Start Shopping",
          buttonLink: "/products",
          secondaryButtonText: "Track Order",
          secondaryButtonLink: "/orders",
          active: true
        }
      ],
      autoPlay: true,
      autoPlaySpeed: 5000,
      showDots: true,
      showArrows: true
    },
    shipping: {
      freeShippingThreshold: 100,
      standardShippingRate: 10,
      expressShippingRate: 25,
      shippingCountries: ['US', 'CA', 'UK', 'AU'],
      taxRate: 7
    },
    payment: {
      acceptCreditCards: true,
      acceptPayPal: true,
      acceptApplePay: false,
      acceptGooglePay: false,
      stripePublicKey: 'pk_test_123456789',
      paypalClientId: 'client_id_123456789'
    },
    notifications: {
      orderConfirmation: true,
      orderShipped: true,
      orderDelivered: true,
      abandonedCart: true,
      emailNewsletter: true,
      emailFormat: 'html'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply appearance settings to CSS variables
  useEffect(() => {
    applyAppearanceSettings();
  }, [settings.appearance]);

  // Initialize dark mode preference from cookie on mount
  useEffect(() => {
    const userDarkMode = getDarkModePreference();
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        enableDarkMode: userDarkMode
      }
    }));
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const cleanup = listenForSystemPreferenceChange((isDark) => {
      setSettings(prev => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          enableDarkMode: isDark
        }
      }));
    });
    
    return cleanup;
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const fetchedSettings = await getSettings();
      
      // Override dark mode setting with user's cookie preference
      const userDarkMode = getDarkModePreference();
      fetchedSettings.appearance = {
        ...fetchedSettings.appearance,
        enableDarkMode: userDarkMode
      };
      
      setSettings(fetchedSettings);
      setError(null);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
      // Keep default settings if loading fails
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsData = async (newSettings) => {
    try {
      setLoading(true);
      
      // Don't save dark mode to database - it's stored in cookies
      const settingsToSave = {
        ...newSettings,
        appearance: {
          ...newSettings.appearance
        }
      };
      // Remove enableDarkMode from what gets saved to database
      delete settingsToSave.appearance.enableDarkMode;
      
      await updateSettings(settingsToSave);
      
      // Keep the dark mode setting in local state from cookies
      const userDarkMode = getDarkModePreference();
      setSettings({
        ...newSettings,
        appearance: {
          ...newSettings.appearance,
          enableDarkMode: userDarkMode
        }
      });
      
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateDarkModePreference = (isDark) => {
    setDarkModePreference(isDark);
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        enableDarkMode: isDark
      }
    }));
  };

  const applyAppearanceSettings = () => {
    const { primaryColor, secondaryColor, enableDarkMode } = settings.appearance;
    
    // Update CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-hover', secondaryColor);
    
    // Apply dark mode if enabled
    if (enableDarkMode) {
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--nav-bg', '#2d2d2d');
      root.style.setProperty('--card-bg', '#3a3a3a');
      root.style.setProperty('--border-color', '#4a4a4a');
      root.style.setProperty('--input-bg', '#2d2d2d');
      root.style.setProperty('--input-border', '#4a4a4a');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--success-color', '#4caf50');
      root.style.setProperty('--danger-color', '#f44336');
      root.style.setProperty('--warning-color', '#ff9800');
      document.body.classList.add('dark-mode');
    } else {
      root.style.setProperty('--text-color', '#242424');
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--nav-bg', '#ffffff');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border-color', '#e1e5e9');
      root.style.setProperty('--input-bg', '#fafbfc');
      root.style.setProperty('--input-border', '#e1e5e9');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--success-color', '#28a745');
      root.style.setProperty('--danger-color', '#dc3545');
      root.style.setProperty('--warning-color', '#ffc107');
      document.body.classList.remove('dark-mode');
    }
  };

  const value = {
    settings,
    loading,
    error,
    updateSettings: updateSettingsData,
    updateDarkModePreference,
    reloadSettings: loadSettings
  };

  // Add debug function to window for testing
  if (typeof window !== 'undefined') {
    window.debugDarkModeCookies = debugDarkModeCookies;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
