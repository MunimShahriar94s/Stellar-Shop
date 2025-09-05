// server/routes/orders.js
import express from 'express';
import db from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { stripe } from '../index.js';
import { sendEmail } from '../utils/mailer.js';
import { getOrderPlacedTemplate } from '../utils/emailTemplates.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Get all orders (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.id, o.user_id, o.order_date, o.status, o.total_price as total, o.phone, o.address, o.customer_name, u.name, u.email, u.picture
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id ASC
    `);
    // Convert total to number
    const orders = result.rows.map(order => ({
      ...order,
      total: order.total !== null && order.total !== undefined ? Number(order.total) : 0,
      date: order.order_date // Add this line for frontend compatibility
    }));
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a specific order with items (admin or order owner)
router.get('/:id', verifyToken, async (req, res) => {
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
    
    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && req.user.id !== order.user_id) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    
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

// Create a new order from cart (authenticated users only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { customerName, phone, address } = req.body || {};
    if (!customerName || String(customerName).trim().length < 2 || !phone || String(phone).trim().length < 7 || !address || String(address).trim().length < 5) {
      return res.status(400).json({ error: 'Name, phone and address are required' });
    }
    // Start a transaction
    await db.query('BEGIN');
    
    // Get user's cart
    const cartResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.id]
    );
    
    if (cartResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'No cart found' });
    }
    
    const cartId = cartResult.rows[0].id;
    
    // Get cart items
    const cartItemsResult = await db.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    
    if (cartItemsResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Check stock availability
    for (const item of cartItemsResult.rows) {
      if (item.stock < item.quantity) {
        await db.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Not enough stock', 
          productId: item.product_id 
        });
      }
    }
    
    // Calculate subtotal, shipping, tax, and total
    const subtotal = cartItemsResult.rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.07;
    const totalPrice = subtotal + shipping + tax;
    // Create order with all amounts and contact/shipping info
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, status, subtotal, shipping, tax, total_price, phone, address, customer_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [req.user.id, 'pending', subtotal, shipping, tax, totalPrice, phone, address, customerName]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Add order items and update stock
    for (const item of cartItemsResult.rows) {
      // Add to order_items
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [orderId, item.product_id, item.quantity]
      );
      
      // Update product stock
      await db.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    // Clear cart
    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Send order placed email (non-blocking)
    try {
      // Get user email/name
      const userRes = await db.query('SELECT name, email FROM users WHERE id = $1', [req.user.id]);
      const userRow = userRes.rows[0] || {};
      // Fetch items with titles/prices
      const itemsResult = await db.query(
        `SELECT p.title, p.price, p.image, oi.quantity
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [orderId]
      );
      const items = itemsResult.rows.map(r => ({ title: r.title, price: Number(r.price), quantity: r.quantity, image: r.image }));
      const html = await getOrderPlacedTemplate({
        userName: userRow.name,
        orderId,
        total: totalPrice,
        address,
        phone,
        items
      });
      await sendEmail({ to: userRow.email, subject: `Order Confirmed #${orderId}`, html });
    } catch (emailErr) {
      console.error('Failed to send order placed email:', emailErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully', 
      orderId 
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Create Stripe PaymentIntent for checkout
router.post('/create-payment-intent', verifyToken, async (req, res) => {
  try {
    // Get user's cart
    const cartResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.id]
    );
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'No cart found' });
    }
    const cartId = cartResult.rows[0].id;
    const cartItemsResult = await db.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    if (cartItemsResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    // Calculate subtotal
    const subtotal = cartItemsResult.rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    // Calculate shipping and tax (same as frontend logic)
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.07;
    const totalPrice = subtotal + shipping + tax;
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // in cents
      currency: 'usd',
      metadata: { userId: req.user.id }
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Stripe webhook endpoint
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // TODO: Update order status in DB to 'paid' using paymentIntent.metadata.userId
    // You may want to match paymentIntent.id to an order/payment record
    console.log('PaymentIntent was successful:', paymentIntent.id);
  }
  res.json({ received: true });
});

// Update order status (admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
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

// Get user's orders (for customer account page)
router.get('/user/history', verifyToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.id, o.order_date, o.status, o.subtotal, o.shipping, o.tax, o.total_price as total,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id, o.order_date, o.status, o.subtotal, o.shipping, o.tax, o.total_price
      ORDER BY o.order_date DESC
    `, [req.user.id]);
    
    // Format the results
    const orders = result.rows.map(order => ({
      ...order,
      subtotal: order.subtotal !== null ? Number(order.subtotal) : 0,
      shipping: order.shipping !== null ? Number(order.shipping) : 0,
      tax: order.tax !== null ? Number(order.tax) : 0,
      total: order.total !== null ? Number(order.total) : 0,
    }));
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// Cancel user's order if pending or processing
router.put('/user/:id/cancel', verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    // Ensure order belongs to user and is cancelable
    const check = await db.query('SELECT id, status FROM orders WHERE id = $1 AND user_id = $2', [orderId, req.user.id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const status = check.rows[0].status;
    if (!['pending', 'processing'].includes(status)) return res.status(400).json({ error: 'Order cannot be cancelled' });
    // Update status
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['user_cancelled', orderId]);
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;