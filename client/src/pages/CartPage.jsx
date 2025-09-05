import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CartContainer = styled.div`
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
  }
  // Center content when empty
  &.empty {
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }
`;

const CartContent = styled.div`
  flex: 1;
`;

const CartSidebar = styled.div`
  width: 300px;
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px var(--shadow-color);
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CartTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-color);
`;

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 100px;
  height: 100px;
  background-color: var(--input-bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: var(--primary-color);
`;

const ItemQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: var(--input-bg);
    color: var(--text-color);
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--danger-color);
  padding: 0;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--danger-color);
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-color);
  
  &.total {
    font-weight: 600;
    font-size: 1.1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
`;

const CheckoutButton = styled.button`
  display: block;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  padding: 0.8rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  text-decoration: none;
  font-weight: 500;
  border: none;
  width: 100%;
  cursor: pointer;
  &:hover {
    background-color: var(--primary-hover);
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const EmptyCartMessage = styled.p`
  font-size: 1.1rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 1.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &:after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #d9534f;
  padding: 1rem;
  background-color: #f8d7da;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ContinueShoppingButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

const EmptyCartIcon = styled.div`
  font-size: 3rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  min-width: 220px;
  background: ${({ type }) => type === 'success' ? '#4BB543' : '#d9534f'};
  color: white;
  padding: 1rem 2rem;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  font-size: 1rem;
  z-index: 9999;
  opacity: 0.97;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 0.97; transform: translateX(-50%) translateY(0); }
  }
`;

const CartPage = () => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { cartItems, updateQuantity, removeFromCart, cartTotal, loading, error, mergeCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const mergeCalled = useRef(false);
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Merge guest cart with user cart when user logs in (only once)
  useEffect(() => {
    if (isAuthenticated && !mergeCalled.current) {
      mergeCart();
      mergeCalled.current = true;
    }
    if (!isAuthenticated) {
      mergeCalled.current = false; // Reset if user logs out
    }
  }, [isAuthenticated, mergeCart]);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;
  
  // REMOVE Toast and useEffect for toast here, as it is now handled globally
  
  // Remove old handleCheckout and use navigation
  
  if (loading) {
    return (
      <CartContainer className="empty">
        <CartTitle>Your Cart</CartTitle>
        <LoadingSpinner />
      </CartContainer>
    );
  }
  
  if (error) {
    return (
      <CartContainer>
        <CartTitle>Your Cart</CartTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <ContinueShoppingButton to="/products">Continue Shopping</ContinueShoppingButton>
      </CartContainer>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <CartContainer className="empty">
        <EmptyCart>
          <CartTitle>Your Cart</CartTitle>
          <EmptyCartIcon>
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.68 17h7.72a2 2 0 0 0 1.98-1.61L23 6H6"/></svg>
          </EmptyCartIcon>
          <EmptyCartMessage>Your cart is empty.<br/>Add some products to see them here!</EmptyCartMessage>
          <ContinueShoppingButton to="/products">Shop Products</ContinueShoppingButton>
        </EmptyCart>
      </CartContainer>
    );
  }
  
  // Only render cart content after loading is false
  return (
    <CartContainer>
      {/* Toast popup */}
      {/* REMOVE Toast and useEffect for toast here, as it is now handled globally */}
      <CartContent>
        <CartTitle>Your Cart</CartTitle>
        {cartItems.map(item => (
          <CartItem key={item.id}>
            <ItemImage>
              <img src={item.image} alt={item.name} />
            </ItemImage>
            <ItemDetails>
              <ItemTitle>{item.name}</ItemTitle>
              <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
              <ItemQuantity>
                <QuantityButton 
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </QuantityButton>
                <span>{item.quantity}</span>
                <QuantityButton 
                  onClick={() => updateQuantity(item.id, 1)}
                  disabled={item.quantity >= 10}
                >
                  +
                </QuantityButton>
              </ItemQuantity>
              <RemoveButton onClick={() => removeFromCart(item.id)}>Remove</RemoveButton>
            </ItemDetails>
          </CartItem>
        ))}
      </CartContent>
      
      <CartSidebar>
        <SummaryTitle>Order Summary</SummaryTitle>
        <SummaryRow>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </SummaryRow>
        <SummaryRow>
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </SummaryRow>
        <SummaryRow>
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </SummaryRow>
        <SummaryRow className="total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </SummaryRow>
        <CheckoutButton onClick={() => navigate('/checkout')} disabled={checkoutLoading}>
          Checkout
        </CheckoutButton>
      </CartSidebar>
    </CartContainer>
  );
};

export default CartPage;