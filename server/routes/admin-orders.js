// server/routes/admin-orders.js
import express from 'express';
import db from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { sendEmail } from '../utils/mailer.js';
import { getOrderStatusTemplate } from '../utils/emailTemplates.js';

const router = express.Router();

// Get all orders (admin only)
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.id, o.user_id, o.order_date, o.status, o.phone, o.address, o.customer_name,
             u.name, u.email,
             COUNT(oi.id) as item_count,
             SUM(p.price * oi.quantity) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, o.user_id, o.order_date, o.status, o.phone, o.address, o.customer_name, u.name, u.email
      ORDER BY o.order_date DESC
    `);
    
    // Format the results
    const orders = result.rows.map(order => ({
      ...order,
      total: parseFloat(order.total)
    }));
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a specific order with items (admin only)
router.get('/orders/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // First get the order
    const orderResult = await db.query(`
      SELECT o.id, o.user_id, o.order_date, o.status, o.phone, o.address, o.customer_name, u.name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [req.params.id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsResult = await db.query(`
      SELECT oi.id, oi.product_id, oi.quantity, p.title, p.price, p.image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [req.params.id]);
    
    // Calculate order total
    const items = itemsResult.rows.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      ...order,
      items,
      total
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
router.put('/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'user_cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Email user about status change (processing/cancelled)
    try {
      const orderWithUser = await db.query(
        `SELECT o.id, u.name, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1`,
        [req.params.id]
      );
      const itemsResult = await db.query(
        `SELECT p.title, p.price, p.image, oi.quantity FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
        [req.params.id]
      );
      const items = itemsResult.rows.map(r => ({ title: r.title, price: Number(r.price), quantity: r.quantity, image: r.image }));
      const subtotal = items.reduce((s,i)=> s + (i.price * i.quantity), 0);
      // For email consistency, compute same shipping/tax as order creation
      const shipping = subtotal > 100 ? 0 : 10;
      const tax = subtotal * 0.07;
      const total = subtotal + shipping + tax;
      const row = orderWithUser.rows[0];
      if (row?.email) {
        const html = await getOrderStatusTemplate({ userName: row.name, orderId: row.id, status, items, total });
        await sendEmail({
          to: row.email,
          subject: `Order #${row.id} ${status === 'processing' ? 'Approved' : status === 'cancelled' ? 'Admin Cancelled' : status === 'user_cancelled' ? 'Cancelled' : 'Updated'}`,
          html
        });
      }
    } catch (emailErr) {
      console.error('Failed to send order status email:', emailErr.message);
    }

    res.json({ 
      success: true, 
      message: 'Order status updated', 
      order: result.rows[0] 
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;