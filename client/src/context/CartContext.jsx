import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', type: '' });
  const [merging, setMerging] = useState(false);
  const [cartOpened, setCartOpened] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const cartLoadedRef = useRef(false);
  
  // Check if cart was already loaded in this session
  useEffect(() => {
    const wasLoaded = localStorage.getItem('cartLoaded');
    if (wasLoaded === 'true') {
      cartLoadedRef.current = true;
      console.log('[CART][FRONTEND] Cart was previously loaded, skipping...');
    }
  }, []);
  
  // Reset cart loaded flag when user changes (login/logout)
  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out, reset cart loaded flag
      localStorage.removeItem('cartLoaded');
      cartLoadedRef.current = false;
      console.log('[CART][FRONTEND] User logged out, reset cart loaded flag');
    }
  }, [isAuthenticated]);
  
  // Fetch cart items from the server
  const fetchCart = async () => {
    try {
      console.log('[CART][FRONTEND] Fetching cart...');
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      console.log('[CART][FRONTEND] Token exists:', !!token);
      console.log('[CART][FRONTEND] Headers:', headers);
      
      const response = await fetch('/api/cart', { 
        credentials: 'include',
        headers,
        cache: 'no-store'
      });
      
      console.log('[CART][FRONTEND] Response status:', response.status);
      
      const data = await response.json();
      console.log('[CART][FRONTEND] Cart data received:', data);
      
      setCartItems(data.items || []);
      setError(null);
    } catch (err) {
      console.error('[CART][FRONTEND] Error fetching cart:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };
  
  // Only one useEffect for cart loading to prevent race conditions
  useEffect(() => {
    console.log('[CART][FRONTEND] CartContext mounted, isAuthenticated:', isAuthenticated);
    console.log('[CART][FRONTEND] cartLoadedRef.current:', cartLoadedRef.current);
  }, []);

  useEffect(() => {
    // Only load cart once when component mounts
    if (cartLoadedRef.current) {
      console.log('[CART][FRONTEND] Cart already loaded, skipping...');
      return;
    }
    
    // Check if user changed (different token)
    const currentToken = localStorage.getItem('token');
    const lastToken = localStorage.getItem('lastCartToken');
    if (lastToken && lastToken !== currentToken) {
      // User changed, reset cart loaded flag
      localStorage.removeItem('cartLoaded');
      cartLoadedRef.current = false;
      console.log('[CART][FRONTEND] User changed, reset cart loaded flag');
    }

    const doFetch = async () => {
      console.log('[CART][FRONTEND] Starting initial cart load...');
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const guestCartCookie = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
      const guestCartId = guestCartCookie ? guestCartCookie.split('=')[1] : null;
      
      console.log('[CART][FRONTEND] Token exists:', !!token);
      console.log('[CART][FRONTEND] Guest cart cookie exists:', !!guestCartCookie);
      console.log('[CART][FRONTEND] Guest cart ID value:', guestCartId);
      
      // Only merge if user just logged in AND there's actually a guest cart ID to merge
      if (token && guestCartId && isAuthenticated) {
        console.log('[CART][FRONTEND] Merging guest cart on app load with ID:', guestCartId);
        setMerging(true);
        try {
          await mergeCart(true); // Skip fetch since we'll call it after
        } catch (err) {
          console.error('[CART][FRONTEND] Error merging guest cart on app load:', err);
        }
        setMerging(false);
      } else {
        console.log('[CART][FRONTEND] No guest cart to merge or user not authenticated. Token:', !!token, 'GuestCartId:', guestCartId, 'IsAuth:', isAuthenticated);
      }
      
      // Always fetch cart after any merge operations
      await fetchCart();
      setLoading(false);
      cartLoadedRef.current = true;
      localStorage.setItem('cartLoaded', 'true'); // Persist across route changes
      localStorage.setItem('lastCartToken', token || 'guest'); // Store token for user change detection
      console.log('[CART][FRONTEND] Initial cart load complete');
    };
    
    doFetch();
  }, []); // Empty dependency array - only run once
  
  // Add item to cart
  const addToCart = async (product) => {
    try {
      console.log('[CART][FRONTEND] Adding to cart:', product);
      const quantity = product.quantity || 1;
      
      // Check if product is already in cart
      const existingItem = cartItems.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantity + quantity;
      
      console.log('[CART][FRONTEND] Current quantity:', currentQuantity, 'New total:', newTotalQuantity);
      
      // Validate quantity limits - hard limit of 10 items per product
      const maxQuantity = 10;
      
      if (newTotalQuantity > maxQuantity) {
        setToast({ 
          open: true, 
          message: 'Maximum 10 items per product allowed', 
          type: 'warning' 
        });
        return;
      }
      
      if (quantity > product.stock) {
        setToast({ 
          open: true, 
          message: 'Maximum 10 items per product allowed', 
          type: 'warning' 
        });
        return;
      }
      
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setToast({ 
            open: true, 
            message: data.error, 
            type: 'warning' 
          });
        } else {
          setToast({ 
            open: true, 
            message: 'Failed to add to cart', 
            type: 'error' 
          });
        }
        return;
      }
      
      // Immediately fetch cart to update the bubble
      await fetchCart();
      setToast({ open: true, message: 'Successfully added to cart!', type: 'success' });
    } catch (err) {
      console.error('[CART][FRONTEND] Error adding item to cart:', err);
      setError('Failed to add item to cart');
      setToast({ open: true, message: 'Failed to add to cart', type: 'error' });
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (id) => {
    try {
      console.log('[CART][FRONTEND] Removing item from cart:', id);
      await fetch(`/api/cart/items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh cart after removing item
      await fetchCart();
    } catch (err) {
      console.error('[CART][FRONTEND] Error removing item from cart:', err);
      setError('Failed to remove item from cart');
    }
  };
  
  // Update item quantity
  const updateQuantity = async (id, change) => {
    try {
      console.log('[CART][FRONTEND] Updating quantity for item:', id, 'change:', change);
      // Find the current item to get its quantity
      const item = cartItems.find(item => item.id === id);
      if (!item) return;
      
      const newQuantity = Math.max(1, item.quantity + change);
      
      console.log('[CART][FRONTEND] Current quantity:', item.quantity, 'New quantity:', newQuantity);
      
      // Validate quantity limits - hard limit of 10 items per product
      const maxQuantity = 10;
      
      if (newQuantity > maxQuantity) {
        setToast({ 
          open: true, 
          message: 'Maximum 10 items per product allowed', 
          type: 'warning' 
        });
        return;
      }
      
      const response = await fetch(`/api/cart/items/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quantity: newQuantity
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setToast({ 
            open: true, 
            message: data.error, 
            type: 'warning' 
          });
        } else {
          setToast({ 
            open: true, 
            message: 'Failed to update quantity', 
            type: 'error' 
          });
        }
        return;
      }
      
      // Refresh cart after updating quantity
      await fetchCart();
    } catch (err) {
      console.error('[CART][FRONTEND] Error updating cart item:', err);
      setError('Failed to update cart item');
      setToast({ open: true, message: 'Failed to update quantity', type: 'error' });
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      console.log('[CART][FRONTEND] Clearing cart...');
      await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh cart after clearing
      await fetchCart();
      
      // Reset cart loaded flag since cart is now empty
      localStorage.removeItem('cartLoaded');
      cartLoadedRef.current = false;
    } catch (err) {
      console.error('[CART][FRONTEND] Error clearing cart:', err);
      setError('Failed to clear cart');
    }
  };
  
  // Merge guest cart with user cart after login
  const mergeCart = async (skipFetch = false) => {
    try {
      // Check if there's actually a guest cart to merge
      const guestCartCookie = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
      const guestCartId = guestCartCookie ? guestCartCookie.split('=')[1] : null;
      
      if (!guestCartId) {
        console.log('[CART][FRONTEND] No guest cart to merge, skipping merge operation');
        return;
      }
      
      console.log('[CART][FRONTEND] Starting cart merge with guest cart ID:', guestCartId);
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        console.log('[CART][FRONTEND] Cart merge successful');
        // Only refresh cart if not called from initial load
        if (!skipFetch) {
          fetchCart();
        }
      } else {
        console.error('[CART][FRONTEND] Cart merge failed:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('[CART][FRONTEND] Error merging carts:', err);
      // Don't set error for this operation as it's not critical
    }
  };

  // Ensure user cart is properly loaded when switching between providers
  const ensureUserCart = async () => {
    try {
      console.log('[CART][FRONTEND] Ensuring user cart...');
      const response = await fetch('/api/cart/ensure-user-cart', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[CART][FRONTEND] Ensure user cart response:', data);
        if (data.hasItems) {
          console.log(`[CART][FRONTEND] Found ${data.itemCount} existing cart items, refreshing cart`);
          fetchCart(); // Refresh cart to show existing items
        }
      }
    } catch (err) {
      console.error('[CART][FRONTEND] Error ensuring user cart:', err);
      // Don't set error for this operation as it's not critical
    }
  };
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const clearToast = () => setToast({ open: false, message: '', type: '' });
  
  // Debug: log cartItems whenever they change
  useEffect(() => {
    console.log('[CART][FRONTEND] Cart items updated:', cartItems.length, 'items');
  }, [cartItems]);
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      mergeCart,
      ensureUserCart,
      fetchCart,
      cartCount,
      cartTotal,
      loading,
      merging,
      cartOpened,
      setCartOpened,
      error,
      toast,
      clearToast
    }}>
      {children}
    </CartContext.Provider>
  );
};
  
export const useCart = () => useContext(CartContext);
  
export default CartContext;