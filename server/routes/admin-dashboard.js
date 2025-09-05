// server/routes/admin-dashboard.js
import express from 'express';
import db from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get admin dashboard data
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get total number of products
    const productsResult = await db.query('SELECT COUNT(*) as total FROM products');
    const totalProducts = parseInt(productsResult.rows[0].total);
    
    // Get total number of orders
    const ordersResult = await db.query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].total);
    
    // Get total number of users
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);
    
    // Get recent orders
    const recentOrdersResult = await db.query(`
      SELECT o.id, o.order_date, o.status, u.name, u.email,
             SUM(p.price * oi.quantity) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, o.order_date, o.status, u.name, u.email
      ORDER BY o.order_date DESC
      LIMIT 5
    `);
    
    const recentOrders = recentOrdersResult.rows.map(order => ({
      ...order,
      total: parseFloat(order.total)
    }));
    
    // Get low stock products
    const lowStockResult = await db.query(`
      SELECT id, title, stock, price, category
      FROM products
      WHERE stock < 10
      ORDER BY stock ASC
      LIMIT 5
    `);
    
    const lowStockProducts = lowStockResult.rows.map(product => ({
      ...product,
      price: parseFloat(product.price)
    }));
    
    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers
      },
      recentOrders,
      lowStockProducts
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;