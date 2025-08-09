import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Link accounts with the same email
router.post('/link', verifyToken, async (req, res) => {
  try {
    const { provider, password } = req.body;
    const userId = req.user.id;
    
    // Get user info
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Check if account with same email and requested provider exists
    const existingAccount = await db.query(
      'SELECT * FROM users WHERE email = $1 AND provider = $2',
      [user.email, provider]
    );
    
    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ message: `Account already linked with ${provider}` });
    }
    
    // For linking to local account, password is required
    if (provider === 'local' && !password) {
      return res.status(400).json({ message: 'Password is required to link local account' });
    }
    
    // Create linked account
    let newAccount;
    
    if (provider === 'local') {
      // Hash password for local account
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      newAccount = await db.query(
        'INSERT INTO users (name, email, password, provider, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.name, user.email, hashedPassword, 'local', user.role]
      );
    } else {
      // For social accounts, use a placeholder password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`${provider}-oauth`, salt);
      
      newAccount = await db.query(
        'INSERT INTO users (name, email, password, provider, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.name, user.email, hashedPassword, provider, user.role]
      );
    }
    
    res.status(201).json({
      success: true,
      message: `Account successfully linked with ${provider}`,
      account: {
        id: newAccount.rows[0].id,
        email: newAccount.rows[0].email,
        provider: newAccount.rows[0].provider
      }
    });
  } catch (err) {
    console.error('Error linking accounts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all linked accounts for a user
router.get('/linked', verifyToken, async (req, res) => {
  try {
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Find all accounts with the same email
    const linkedAccounts = await db.query(
      'SELECT id, email, provider, created_at FROM users WHERE email = $1',
      [user.email]
    );
    
    res.json({
      success: true,
      accounts: linkedAccounts.rows
    });
  } catch (err) {
    console.error('Error getting linked accounts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;