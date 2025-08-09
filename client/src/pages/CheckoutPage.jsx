import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function OrderSuccess() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: 64, color: 'var(--success-color)', marginBottom: 16 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke="var(--success-color)" strokeWidth="2" fill="rgba(76, 175, 80, 0.1)"/><path d="M8 12l2 2l4-4" stroke="var(--success-color)" strokeWidth="2"/></svg>
      </div>
      <h2 style={{ color: 'var(--text-color)', marginBottom: 8 }}>Order Successful!</h2>
      <p style={{ color: 'var(--text-color)', opacity: 0.7, marginBottom: 24 }}>Thank you for your purchase. Your payment was processed successfully.</p>
      <Link to="/" style={{
        display: 'inline-block',
        padding: '0.75rem 2rem',
        background: 'var(--success-color)',
        color: '#fff',
        borderRadius: 6,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 18,
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
        transition: 'all 0.3s ease',
      }}>Return to Home</Link>
    </div>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
  const [cardErrors, setCardErrors] = useState({ number: false, expiry: false, cvc: false });
  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment'
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  const [shippingErrors, setShippingErrors] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Prefill name from authenticated user profile
    if (user?.name && !shippingInfo.name) {
      setShippingInfo(prev => ({ ...prev, name: user.name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const validateShipping = () => {
    const errs = { name: '', phone: '', address: '' };
    if (!shippingInfo.name || shippingInfo.name.trim().length < 2) {
      errs.name = 'Enter a valid name';
    }
    const cleanedPhone = shippingInfo.phone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length < 7) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!shippingInfo.address || shippingInfo.address.trim().length < 5) {
      errs.address = 'Enter a valid address';
    }
    setShippingErrors(errs);
    return !errs.phone && !errs.address;
  };

  const startPaymentStep = async (e) => {
    e.preventDefault();
    if (!validateShipping()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/create-payment-intent', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setClientSecret(data.clientSecret);
        setStep('payment');
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      setError('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const result = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
          },
        },
        { elements } // Pass elements instance for split fields
      );
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Call backend to create the order
        let orderCreated = false;
        try {
          const orderRes = await fetch('/api/orders', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              customerName: shippingInfo.name,
              phone: shippingInfo.phone,
              address: shippingInfo.address
            })
          });
          if (orderRes.ok) {
            orderCreated = true;
            clearCart(); // Only clear cart after order is created
          } else {
            const errData = await orderRes.json();
            console.error('Order creation failed:', errData);
          }
        } catch (orderErr) {
          console.error('Order creation failed:', orderErr);
        }
        setSuccess(true);
      }
    } catch (err) {
      setError(err?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (type) => (event) => {
    setCardComplete((prev) => ({ ...prev, [type]: event.complete }));
    
    // Check for specific validation errors
    if (type === 'expiry') {
      const expiryValue = event.value;
      if (expiryValue && expiryValue.length >= 5) { // MM/YY format
        const [month, year] = expiryValue.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        
        const isExpired = parseInt(year) < currentYear || 
                         (parseInt(year) === currentYear && parseInt(month) < currentMonth);
        
        setCardErrors(prev => ({ ...prev, expiry: isExpired }));
      } else {
        setCardErrors(prev => ({ ...prev, expiry: false }));
      }
    }
  };

  if (success) return <OrderSuccess />;
  if (error && step !== 'payment') return <div style={{ color: 'var(--danger-color)', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;

  if (step === 'shipping') {
    return (
      <form onSubmit={startPaymentStep} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-color)' }}>Name</label>
          <input
            type="text"
            value={shippingInfo.name}
            onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1.5px solid ${shippingErrors.name ? 'var(--danger-color)' : 'var(--input-border)'}`, background: 'var(--input-bg)', color: 'var(--text-color)' }}
          />
          {shippingErrors.name && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: 6 }}>{shippingErrors.name}</div>}
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-color)' }}>Phone Number</label>
          <input
            type="tel"
            value={shippingInfo.phone}
            onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="e.g. +1 555 123 4567"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1.5px solid ${shippingErrors.phone ? 'var(--danger-color)' : 'var(--input-border)'}`, background: 'var(--input-bg)', color: 'var(--text-color)' }}
          />
          {shippingErrors.phone && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: 6 }}>{shippingErrors.phone}</div>}
        </div>
        <div>
          <label style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-color)' }}>Address</label>
          <textarea
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Street, City, State, Postal Code, Country"
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1.5px solid ${shippingErrors.address ? 'var(--danger-color)' : 'var(--input-border)'}`, background: 'var(--input-bg)', color: 'var(--text-color)' }}
          />
          {shippingErrors.address && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: 6 }}>{shippingErrors.address}</div>}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '0.75rem 2rem',
            background: loading ? 'var(--border-color)' : 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 18,
            boxShadow: '0 2px 8px var(--shadow-color)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Preparing payment...' : 'Continue to Payment'}
        </button>
        {error && <div style={{ color: 'var(--danger-color)', marginTop: 10 }}>{error}</div>}
      </form>
    );
  }

  // Payment step
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        padding: '10px 12px',
        borderRadius: 6,
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        marginBottom: 8,
        color: 'var(--text-color)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Shipping To</div>
        <div style={{ opacity: 0.95, marginBottom: 4 }}>{shippingInfo.name}</div>
        <div style={{ opacity: 0.9 }}>{shippingInfo.address}</div>
        <div style={{ opacity: 0.8, marginTop: 4 }}>Phone: {shippingInfo.phone}</div>
      </div>

      <label style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-color)' }}>Card Number</label>
      <div style={{ border: '1.5px solid var(--input-border)', borderRadius: 6, padding: '10px 12px', background: 'var(--input-bg)', marginBottom: 8 }}>
        <CardNumberElement
          options={{
            style: {
              base: {
                fontSize: '18px',
                color: '#ffffff',
                letterSpacing: '1px',
                '::placeholder': { color: '#ffffff', opacity: 0.7 },
              },
              invalid: { color: 'var(--danger-color)' },
            },
          }}
          onChange={handleChange('number')}
        />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-color)' }}>Expiry</label>
          <div style={{ 
            border: cardErrors.expiry ? '1.5px solid var(--danger-color)' : '1.5px solid var(--input-border)', 
            borderRadius: 6, 
            padding: '10px 12px', 
            background: 'var(--input-bg)' 
          }}>
            <CardExpiryElement
              options={{
                style: {
                  base: {
                    fontSize: '18px',
                    color: cardErrors.expiry ? 'var(--danger-color)' : '#ffffff',
                    '::placeholder': { color: '#ffffff', opacity: 0.7 },
                  },
                  invalid: { color: 'var(--danger-color)' },
                },
              }}
              onChange={handleChange('expiry')}
            />
          </div>
          {cardErrors.expiry && (
            <div style={{ 
              color: 'var(--danger-color)', 
              fontSize: '0.8rem', 
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Card has expired
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-color)' }}>CVC</label>
          <div style={{ border: '1.5px solid var(--input-border)', borderRadius: 6, padding: '10px 12px', background: 'var(--input-bg)' }}>
            <CardCvcElement
              options={{
                style: {
                  base: {
                    fontSize: '18px',
                    color: '#ffffff',
                    '::placeholder': { color: '#ffffff', opacity: 0.7 },
                  },
                  invalid: { color: 'var(--danger-color)' },
                },
              }}
              onChange={handleChange('cvc')}
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || loading || !cardComplete.number || !cardComplete.expiry || !cardComplete.cvc || cardErrors.expiry}
        style={{
          marginTop: 24,
          padding: '0.75rem 2rem',
          background: (!stripe || loading || !cardComplete.number || !cardComplete.expiry || !cardComplete.cvc || cardErrors.expiry) ? 'var(--border-color)' : 'var(--success-color)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 18,
          boxShadow: '0 2px 8px var(--shadow-color)',
          cursor: (!stripe || loading || !cardComplete.number || !cardComplete.expiry || !cardComplete.cvc || cardErrors.expiry) ? 'not-allowed' : 'pointer',
          opacity: (!stripe || loading || !cardComplete.number || !cardComplete.expiry || !cardComplete.cvc || cardErrors.expiry) ? 0.8 : 1,
          transition: 'all 0.3s ease',
        }}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div style={{ color: 'var(--danger-color)', marginTop: 10 }}>{error}</div>}
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <div style={{ 
        maxWidth: 400, 
        margin: '2rem auto', 
        padding: 24, 
        background: 'var(--card-bg)', 
        borderRadius: 8, 
        boxShadow: '0 2px 8px var(--shadow-color)',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Checkout</h2>
        <CheckoutForm />
      </div>
    </Elements>
  );
}