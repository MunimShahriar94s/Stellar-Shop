import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/utils/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import OAuthTest from './pages/OAuthTest';
import CheckEmailPage from './pages/CheckEmailPage';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Customers from './pages/admin/Customers';
import CustomerDetail from './pages/admin/CustomerDetail';
import Settings from './pages/admin/Settings';
import OAuthHandler from './components/OAuthHandler';
import GlobalToast from './components/GlobalToast';
import FaviconUpdater from './components/FaviconUpdater';
import './App.css';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

// Debug function to view email verification logs
window.viewEmailVerificationLogs = function() {
  const logs = localStorage.getItem('emailVerificationLogs');
  if (logs) {
    console.log('=== EMAIL VERIFICATION LOGS ===');
    JSON.parse(logs).forEach(log => {
      console.log(`[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`);
    });
    console.log('=== END EMAIL VERIFICATION LOGS ===');
  } else {
    console.log('No email verification logs found');
  }
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SettingsProvider>
          <FaviconUpdater />
          <OAuthHandler />
          <GlobalToast />
          <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="verify-email" element={<EmailVerificationPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="oauth-test" element={<OAuthTest />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<ProtectedRoute requireAdmin={false} />}> 
                <Route index element={<OrdersPage />} />
              </Route>
              <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Page not found</div>} />
            </Route>
            
            {/* Check Email Page - No Layout */}
            <Route path="/check-email" element={<CheckEmailPage />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true} />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:customerId" element={<CustomerDetail />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        </SettingsProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;