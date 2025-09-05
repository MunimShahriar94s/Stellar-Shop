import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// Check if user is admin
router.get('/check-admin', verifyToken, async (req, res) => {
  try {

    const result = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isAdmin = result.rows[0].role === 'admin';
    
    res.json({
      isAdmin,
      role: result.rows[0].role,
      userId: req.user.id
    });
  } catch (err) {
    console.error('Error checking admin status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;