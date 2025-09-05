import express from 'express';
import db from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    
    // Price is already in dollars in the database
    const products = result.rows.map(product => {
      const numStock = parseInt(product.stock) || 0;
      
      return {
        ...product,
        price: parseFloat(product.price), // Ensure price is a number
        stock: numStock
      };
    });
    
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product
router.get('/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Price is already in dollars in the database
    const product = result.rows[0];
    const numStock = parseInt(product.stock) || 0;
    
    const normalizedProduct = {
      ...product,
      price: parseFloat(product.price), // Ensure price is a number
      stock: numStock
    };
    
    res.json(normalizedProduct);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product (protected)
router.post('/products', verifyToken, isAdmin, async (req, res) => {
  const { title, price, category, description, stock, image } = req.body;
  
  // Ensure price is a number
  const priceAsNumber = parseFloat(price);
  
  console.log('Creating product with data:', { title, price, priceAsNumber, category, description, stock, image });
  
  try {
    const result = await db.query(
      'INSERT INTO products (title, price, category, description, stock, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, priceAsNumber, category, description, stock, image]
    );
    
    // Ensure price is a number in the response
    const savedProduct = {
      ...result.rows[0],
      price: parseFloat(result.rows[0].price)
    };
    
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// Update a product (protected)
router.put('/products/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, price, category, description, stock, image } = req.body;
  
  // Ensure price is a number
  const priceAsNumber = parseFloat(price);
  
  try {
    const result = await db.query(
      'UPDATE products SET title = $1, price = $2, category = $3, description = $4, stock = $5, image = $6 WHERE id = $7 RETURNING *',
      [title, priceAsNumber, category, description, stock, image, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Ensure price is a number in the response
    const updatedProduct = {
      ...result.rows[0],
      price: parseFloat(result.rows[0].price)
    };
    
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// Delete a product (protected)
router.delete('/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Make a user an admin (super admin only)
router.post('/make-admin', verifyToken, isAdmin, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
      ['admin', email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: `User ${result.rows[0].email} has been made an admin`,
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error making user admin:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get all users with their order statistics
router.get('/customers', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        u.email_verified,
        u.picture,
        u.provider,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_price), 0) as total_spent,
        MAX(o.order_date) as last_order_date
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at, u.email_verified, u.picture, u.provider
      ORDER BY u.created_at DESC
    `);
    
    const users = result.rows.map(user => ({
      ...user,
      total_spent: parseFloat(user.total_spent),
      total_orders: parseInt(user.total_orders)
    }));
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details with order history
router.get('/customers/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get user basic info
    const userResult = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        u.email_verified,
        u.picture,
        u.provider
      FROM users u
      WHERE u.id = $1
    `, [req.params.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get user's order history
    const ordersResult = await db.query(`
      SELECT 
        o.id,
        o.order_date,
        o.status,
        o.total_price,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.order_date, o.status, o.total_price
      ORDER BY o.order_date DESC
    `, [req.params.id]);
    
    const orders = ordersResult.rows.map(order => ({
      ...order,
      total_price: parseFloat(order.total_price),
      item_count: parseInt(order.item_count)
    }));
    
    // Calculate total statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    res.json({
      customer: user,
      orders,
      statistics: {
        totalOrders,
        totalSpent,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
      }
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

export default router;