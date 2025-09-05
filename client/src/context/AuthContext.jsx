import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export { AuthContext };
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch('/auth/check', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setUser(data.user);
          setIsAdmin(data.isAdmin);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear token on error
        localStorage.removeItem('token');
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Listen for auth state changes from email verification
    const handleAuthStateChange = (event) => {
      const { token, user } = event.detail;
      console.log('Auth state change event received:', { token: token.substring(0, 20) + '...', user });
      setUser(user);
      setIsAdmin(user.role === 'admin');
    };
    
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);
  
  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {

        setIsAdmin(false);
        return false;
      }
      
      
        const response = await fetch('/api/check-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      
              if (response.ok) {
          const data = await response.json();
        setIsAdmin(data.isAdmin);
        return data.isAdmin;
              } else {
          setIsAdmin(false);
          return false;
        }
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/auth/logout', { 
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
  
      } else {
        console.error('Logout failed:', await response.text());
      }
      
      // Clear local storage and state regardless of server response
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
      
      // Clear any guest cart cookies to prevent cart persistence after logout
      document.cookie = 'guestCartId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear cart loaded flag to allow fresh cart load on next login
      localStorage.removeItem('cartLoaded');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and state on error
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
      
      // Clear any guest cart cookies to prevent cart persistence after logout
      document.cookie = 'guestCartId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear cart loaded flag to allow fresh cart load on next login
      localStorage.removeItem('cartLoaded');
    }
  };
  
  // Merge guest cart with user cart after login
  const mergeCart = async () => {
    try {
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
  
      }
    } catch (err) {
      console.error('Error merging carts:', err);
    }
  };
  
  // Utility to check for guest cart and merge after login
  const mergeGuestCartIfExists = async () => {
    const guestCartId = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
    if (guestCartId) {
      try {
        await mergeCart();
      } catch (err) {
        console.error('Error merging guest cart after login:', err);
      }
    }
  };
  
  const value = {
    user,
    isAdmin,
    loading,
    logout,
    setUser,
    setIsAdmin,
    isAuthenticated: !!user,
    mergeCart,
    checkAdminStatus
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};