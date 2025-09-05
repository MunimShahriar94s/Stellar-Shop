import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const OAuthHandler = () => {
  const { mergeCart, ensureUserCart, fetchCart } = useCart();
  const { setUser, setIsAdmin } = useAuth();
  
  useEffect(() => {
    // Handle OAuth login success
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const token = urlParams.get('token');
    const mergeCartFlag = urlParams.get('mergeCart');
    
    if (loginSuccess === 'success' && token) {
      console.log('OAuth login success detected, token:', token.substring(0, 20) + '...');
      console.log('Merge cart flag:', mergeCartFlag);
      
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user data and update auth context
      fetch('/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          console.log('Auth check response:', data);
          if (data.isAuthenticated) {
            console.log('Setting user data:', data.user);
            console.log('User picture URL:', data.user.picture);
            setUser(data.user);
            setIsAdmin(data.isAdmin);
            
            // Handle cart merging after user is set
            const guestCartId = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
            if (mergeCartFlag === 'true' || guestCartId) {
              console.log('Merging cart after OAuth login');
              mergeCart();
            } else {
              console.log('Ensuring user cart is loaded');
              ensureUserCart();
            }
            
            // Always fetch cart to ensure it's up to date
            setTimeout(() => {
              fetchCart();
            }, 500);
          }
        })
        .catch(err => {
          console.error('Error fetching user data after OAuth:', err);
        });
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Empty dependency array - only run once on mount

  return null; // This component doesn't render anything
};

export default OAuthHandler; 