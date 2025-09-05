import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';
import db from '../db.js';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  // Get token from header, cookie, or query string
  const token = 
    req.headers.authorization?.split(' ')[1] || 
    req.cookies.token || 
    req.query.token;
  

  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been invalidated, please login again' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const result = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  } catch (err) {
    console.error('Error checking admin status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};