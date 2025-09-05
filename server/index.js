// server/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import db from './db.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import adminRoutes from './routes/admin.js';
import adminCheckRoutes from './routes/admin-check.js';
import adminOrdersRoutes from './routes/admin-orders.js';
import adminDashboardRoutes from './routes/admin-dashboard.js';
import emailVerificationRoutes from './routes/email-verification.js';
import settingsRoutes from './routes/settings.js';
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';

import upload from './middleware/upload.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { verifyToken, isAdmin } from './middleware/auth.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import { checkAndFixSequences, checkDatabaseState, resetDatabaseState } from './utils/dbUtils.js';
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}))

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Upload image
app.post('/admin/upload', verifyToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const uploadDir = path.join(__dirname, 'uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname);
    const filename = `product-${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.copyFileSync(req.file.path, filePath);
    fs.unlinkSync(req.file.path);

    const imageUrl = `/uploads/products/${filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image', details: err.message });
  }
});

// Debug route to check database sequences
app.get('/debug/sequences', async (req, res) => {
  try {
    await checkAndFixSequences();
    res.json({ message: 'Sequences checked and fixed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug route to check database state
app.get('/debug/db-state', async (req, res) => {
  try {
    await checkDatabaseState();
    res.json({ message: 'Database state checked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug route to check specific user
app.get('/debug/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const seqResult = await db.query("SELECT last_value, is_called FROM users_id_seq");
    
    res.json({
      user: userResult.rows[0] || null,
      sequence: seqResult.rows[0],
      requestedId: userId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug route to reset database state
app.get('/debug/reset-db', async (req, res) => {
  try {
    await resetDatabaseState();
    res.json({ message: 'Database state reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug route to check temporary guest cart tables
app.get('/debug/guest-carts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'guest_cart_%'
    `);
    
    const guestCarts = [];
    for (const row of result.rows) {
      const tableName = row.table_name;
      const itemCount = await db.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      guestCarts.push({
        tableName,
        itemCount: itemCount.rows[0].count
      });
    }
    
    res.json({
      guestCarts,
      total: guestCarts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to verify cart merge API is accessible
app.get('/debug/test-cart-merge', async (req, res) => {
  res.json({ 
    message: 'Cart merge API is accessible',
    timestamp: new Date().toISOString()
  });
});

// Email verification page - must be before static file middleware
app.get('/verify-email.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify-email.html'));
});

// Test endpoint to verify email verification page is accessible
app.get('/debug/test-verify-page', (req, res) => {
  res.json({ 
    message: 'Email verification page route is accessible',
    timestamp: new Date().toISOString(),
    testUrl: '/verify-email.html?token=test-token'
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('public/images'));
app.use('/uploads', express.static('uploads'));

// React admin pages (must come before API routes)
app.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
app.get('/admin/products', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
app.get('/admin/orders', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
app.get('/admin/settings', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
app.get('/admin/customers', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
app.get('/admin/customers/:id', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});
app.get('/admin/order/:id', verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});



// Other routes
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/email-verification', emailVerificationRoutes);

app.use('/api/admin', adminOrdersRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', adminCheckRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Frontend routes
['/products', '/product/:id', '/contact', '/cart', '/orders', '/order/:id', '/login', '/signup'].forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Check and fix database sequences on startup
  try {
    await resetDatabaseState(); // This includes checking and fixing sequences
  } catch (err) {
    console.error('Error during database startup checks:', err);
  }
});
