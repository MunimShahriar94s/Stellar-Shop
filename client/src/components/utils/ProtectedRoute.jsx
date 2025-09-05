import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, isAdmin, loading, checkAdminStatus } = useAuth();
  const [adminChecked, setAdminChecked] = useState(false);
  
  // Check admin status when component mounts if admin access is required
  useEffect(() => {
    if (requireAdmin && user && !adminChecked) {
      const verifyAdmin = async () => {
        await checkAdminStatus();
        setAdminChecked(true);
      };
      verifyAdmin();
    } else if (!requireAdmin) {
      setAdminChecked(true);
    }
  }, [requireAdmin, user, adminChecked, checkAdminStatus]);
  
  // Show loading state while checking authentication or admin status
  if (loading || (requireAdmin && !adminChecked)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin access is required but user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and has required permissions, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;