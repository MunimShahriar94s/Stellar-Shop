import express from 'express';
import db from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, description, price, category, image, stock, badge FROM products');
    
    // Price is already in dollars in the database
    const products = result.rows.map(product => ({
      ...product,
      price: parseFloat(product.price) // Ensure price is a number
    }));
    
    console.log('✅ Products fetched successfully', products);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products from database' });
  }
});

export default router;
