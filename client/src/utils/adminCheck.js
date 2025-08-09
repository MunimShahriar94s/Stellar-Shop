// Utility to check if the current user is an admin

export const checkAdminStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAdmin: false, error: 'No token found' };
    }
    
    const response = await fetch('/api/check-admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check admin status');
    }
    
    const data = await response.json();
    return { isAdmin: data.isAdmin, role: data.role };
  } catch (error) {
    console.error('Admin check error:', error);
    return { isAdmin: false, error: error.message };
  }
};