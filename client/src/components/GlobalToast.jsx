import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  min-width: 280px;
  max-width: 400px;
  background: ${({ type }) => {
    switch (type) {
      case 'success': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'info': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      default: return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  font-size: 0.95rem;
  font-weight: 500;
  z-index: 9999;
  opacity: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(255, 255, 255, 0.15);
  }
  
  @keyframes slideInUp {
    from { 
      opacity: 0; 
      transform: translateX(-50%) translateY(30px) scale(0.9);
    }
    to { 
      opacity: 1; 
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }
  
  &.exiting {
    animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  @keyframes slideOutDown {
    from { 
      opacity: 1; 
      transform: translateX(-50%) translateY(0) scale(1);
    }
    to { 
      opacity: 0; 
      transform: translateX(-50%) translateY(30px) scale(0.9);
    }
  }
  
  .toast-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.75rem;
    font-size: 1.1rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
  }
  
  .toast-message {
    display: flex;
    align-items: center;
    line-height: 1.4;
    font-weight: 500;
  }
`;

const GlobalToast = () => {
  const { toast, clearToast } = useCart();
  const [exiting, setExiting] = useState(false);
  const [externalToast, setExternalToast] = useState(null);
  
  useEffect(() => {
    const handler = (e) => {
      setExternalToast({ ...e.detail, open: true });
      setExiting(false);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setExternalToast(null);
        }, 300);
      }, 3000);
    };
    window.addEventListener('cart-toast', handler);
    return () => window.removeEventListener('cart-toast', handler);
  }, []);
  
  useEffect(() => {
    if (toast && toast.open) {
      setExiting(false);
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          clearToast();
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);
  
  const showToast = externalToast && externalToast.open ? externalToast : toast && toast.open ? toast : null;
  if (!showToast) return null;
  
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };
  
  return (
    <Toast type={showToast.type} className={exiting ? 'exiting' : ''}>
      <div className="toast-message">
        <span className="toast-icon">{getIcon(showToast.type)}</span>
        {showToast.message}
      </div>
    </Toast>
  );
};

export default GlobalToast; 