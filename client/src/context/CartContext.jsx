import { createContext, useState, useContext, useEffect } from 'react';
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
  
  // Fetch cart items from the server
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch('/api/cart', { 
        credentials: 'include',
        headers,
        cache: 'no-store'
      });
      const data = await response.json();
      setCartItems(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };
  
  // Only one useEffect for cart loading to prevent race conditions
  useEffect(() => {
    // Cart provider mounted
    console.log('CartContext mounted, isAuthenticated:', isAuthenticated);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const guestCartId = document.cookie.split('; ').find(row => row.startsWith('guestCartId='));
    const doFetch = async () => {
      setLoading(true);
      if (token && guestCartId) {
        setMerging(true);
        try {
          console.log('Merging guest cart on app load');
          await mergeCart();
        } catch (err) {
          console.error('Error merging guest cart on app load:', err);
        }
        setMerging(false);
      }
      await fetchCart();
      setLoading(false);
    };
    doFetch();
    // eslint-disable-next-line
  }, [isAuthenticated]);
  
  // Add item to cart
  const addToCart = async (product) => {
    try {
      const quantity = product.quantity || 1;
      
      // Check if product is already in cart
      const existingItem = cartItems.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantity + quantity;
      
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
      console.error('Error adding item to cart:', err);
      setError('Failed to add item to cart');
      setToast({ open: true, message: 'Failed to add to cart', type: 'error' });
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (id) => {
    try {
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
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from cart');
    }
  };
  
  // Update item quantity
  const updateQuantity = async (id, change) => {
    try {
      // Find the current item to get its quantity
      const item = cartItems.find(item => item.id === id);
      if (!item) return;
      
      const newQuantity = Math.max(1, item.quantity + change);
      
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
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item');
      setToast({ open: true, message: 'Failed to update quantity', type: 'error' });
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh cart after clearing
      await fetchCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    }
  };
  
  // Merge guest cart with user cart after login
  const mergeCart = async () => {
    try {
      console.log('Starting cart merge...');
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
        console.log('Cart merge successful');
        // Refresh cart after merging
        fetchCart();
      } else {
        console.error('Cart merge failed:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error merging carts:', err);
      // Don't set error for this operation as it's not critical
    }
  };

  // Ensure user cart is properly loaded when switching between providers
  const ensureUserCart = async () => {
    try {
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
        if (data.hasItems) {
          // console.log(`[CART] Found ${data.itemCount} existing cart items, refreshing cart`);
          fetchCart(); // Refresh cart to show existing items
        }
      }
    } catch (err) {
      console.error('Error ensuring user cart:', err);
      // Don't set error for this operation as it's not critical
    }
  };
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const clearToast = () => setToast({ open: false, message: '', type: '' });
  
  // Debug: log cartItems whenever they change
  useEffect(() => {
          // Cart items updated
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