// server/routes/cart.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Reusable cart merge function for server-side operations
export const mergeGuestCart = async (req, res) => {
  try {
    const guestCartId = req.cookies.guestCartId;
    
    if (!guestCartId) {
      return;
    }
    
    // Get user cart ID
    const userCartResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.id]
    );
    
    let userCartId;
    if (userCartResult.rows.length === 0) {
      // Create new user cart
      const newCartResult = await db.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [req.user.id]
      );
      userCartId = newCartResult.rows[0].id;
    } else {
      userCartId = userCartResult.rows[0].id;
    }
    
    // Check if guest cart table exists
    const tempTableName = `guest_cart_${guestCartId.replace(/-/g, '_')}`;
    const tableExists = await db.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = $1
       )`,
      [tempTableName]
    );
    
    if (!tableExists.rows[0].exists) {
      return;
    }
    
    // Get guest cart items
    const guestItemsResult = await db.query(
      `SELECT product_id, quantity FROM ${tempTableName}`
    );
    
    if (guestItemsResult.rows.length === 0) {
      return;
    }
    
    // Merge items into user cart
    for (const item of guestItemsResult.rows) {
      // Check if item already exists in user cart
      const existingItem = await db.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [userCartId, item.product_id]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + item.quantity;
        
        // Validate quantity limit - maximum 10 items per product
        if (newQuantity > 10) {
          // Cap the quantity at 10
          await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2',
            [10, existingItem.rows[0].id]
          );
        } else {
          await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2',
            [newQuantity, existingItem.rows[0].id]
          );
        }
      } else {
        // Add new item
        // Validate quantity limit - maximum 10 items per product
        const quantityToAdd = Math.min(item.quantity, 10);
        await db.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [userCartId, item.product_id, quantityToAdd]
        );
      }
    }
    
    // Delete guest cart table
    await db.query(`DROP TABLE IF EXISTS ${tempTableName}`);
    
    // Clear guest cart cookie
    res.clearCookie('guestCartId', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });
    
  } catch (error) {
    console.error('Server-side cart merge error:', error);
    throw error;
  }
};

const ensureCart = async (req, res, next) => {
  try {
    if (req.user) {
      // For authenticated users, ensure they have a cart
      let cartId = req.cartId;
      if (!cartId) {
        // Check if user already has a cart
        const result = await db.query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
        if (result.rows.length > 0) {
          cartId = result.rows[0].id;
          req.cartId = cartId;
        } else {
          // Create new cart for user
          const newCartResult = await db.query(
            'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
            [req.user.id]
          );
          cartId = newCartResult.rows[0].id;
          req.cartId = cartId;
        }
      }
    } else {
      // For guest users, ensure they have a guest cart ID
      let guestCartId = req.cookies.guestCartId;
      if (!guestCartId) {
        // Create a new UUID for guest cart
        guestCartId = uuidv4();
        // Set cookie to expire in 7 days
        res.cookie('guestCartId', guestCartId, {
          httpOnly: true, // keep secure - cart merging will be handled server-side
          sameSite: 'lax',
          path: '/',       // ensure it's sent on all routes
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }
      // Store the guest cart ID in the request
      req.guestCartId = guestCartId;
    }
    
    next();
  } catch (err) {
    console.error('Error in ensureCart middleware:', err);
    next(err);
  }
};

// Get cart contents
router.get('/', async (req, res, next) => {

  try {
    if (req.headers.authorization && req.headers.authorization !== 'Bearer null') {
      try {
        const { verifyToken } = await import('../middleware/auth.js');
        await new Promise((resolve, reject) => {
          verifyToken(req, res, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      } catch (err) {
        // Only return 401 if token is present and invalid
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    // Always proceed to ensureCart for both guests and users
    ensureCart(req, res, async () => {
      try {

        let cartItems = [];
        if (req.cartId) {
        // For authenticated users
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');

        const result = await db.query(
          `SELECT ci.id, ci.product_id, ci.quantity, p.title as name, p.price, p.image 
           FROM cart_items ci
           JOIN products p ON ci.product_id = p.id
           WHERE ci.cart_id = $1`,
          [req.cartId]
        );
        cartItems = result.rows.map(item => ({
          ...item,
          price: parseFloat(item.price)
        }));

      } else if (req.guestCartId) {
        // For guest users, we'll use a temporary table to store cart items
        // This query checks if the temporary table exists for this guest
        const tempTableName = `guest_cart_${req.guestCartId.replace(/-/g, '_')}`;
        const tableExists = await db.query(
          `SELECT EXISTS (
             SELECT FROM information_schema.tables 
             WHERE table_name = $1
           )`,
          [tempTableName]
        );
        
        if (tableExists.rows[0].exists) {
          const result = await db.query(
            `SELECT gc.id, gc.product_id, gc.quantity, p.title as name, p.price, p.image 
             FROM ${tempTableName} gc
             JOIN products p ON gc.product_id = p.id`
          );
          cartItems = result.rows.map(item => ({
            ...item,
            price: parseFloat(item.price)
          }));
        }
      }
      
      res.json({ items: cartItems });
      } catch (err) {
        console.error('[CART][BACKEND][FETCH][INNER]', err);
        res.status(500).json({ error: 'Failed to fetch cart (inner)' });
      }
    });
  } catch (err) {
    console.error('[CART][BACKEND][FETCH][OUTER]', err);
    res.status(500).json({ error: 'Failed to fetch cart (outer)' });
  }
});

// Add item to cart
router.post('/items', async (req, res, next) => {
  // Check for authentication first
  if (req.headers.authorization && req.headers.authorization !== 'Bearer null') {
    try {
      const { verifyToken } = await import('../middleware/auth.js');
      await new Promise((resolve, reject) => {
        verifyToken(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  // Then ensure cart
  ensureCart(req, res, next);
}, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Check if product exists
    const productResult = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (req.cartId) {
      // For authenticated users
      
      // Check if item already exists in cart
      const existingItem = await db.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [req.cartId, productId]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity if item exists
        const newQuantity = existingItem.rows[0].quantity + quantity;
        
        // Validate quantity limit - maximum 10 items per product
        if (newQuantity > 10) {
          return res.status(400).json({ 
            error: 'Maximum 10 items per product allowed',
            currentQuantity: existingItem.rows[0].quantity,
            requestedQuantity: quantity,
            maxAllowed: 10
          });
        }
        
        await db.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2',
          [newQuantity, existingItem.rows[0].id]
        );
      } else {
        // Add new item if it doesn't exist
        // Validate quantity limit - maximum 10 items per product
        if (quantity > 10) {
          return res.status(400).json({ 
            error: 'Maximum 10 items per product allowed',
            requestedQuantity: quantity,
            maxAllowed: 10
          });
        }
        
        await db.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [req.cartId, productId, quantity]
        );
      }
    } else if (req.guestCartId) {
      // For guest users
      const tempTableName = `guest_cart_${req.guestCartId.replace(/-/g, '_')}`;
      
      // Check if temporary table exists, create if not
      const tableExists = await db.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_name = $1
         )`,
        [tempTableName]
      );
      
      if (!tableExists.rows[0].exists) {
        await db.query(
          `CREATE TABLE ${tempTableName} (
             id SERIAL PRIMARY KEY,
             product_id INTEGER NOT NULL,
             quantity INTEGER NOT NULL DEFAULT 1,
             added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )`
        );
      }
      
      // Check if item already exists in guest cart
      const existingItem = await db.query(
        `SELECT id, quantity FROM ${tempTableName} WHERE product_id = $1`,
        [productId]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity if item exists
        const newQuantity = existingItem.rows[0].quantity + quantity;
        
        // Validate quantity limit - maximum 10 items per product
        if (newQuantity > 10) {
          return res.status(400).json({ 
            error: 'Maximum 10 items per product allowed',
            currentQuantity: existingItem.rows[0].quantity,
            requestedQuantity: quantity,
            maxAllowed: 10
          });
        }
        
        await db.query(
          `UPDATE ${tempTableName} SET quantity = $1 WHERE id = $2`,
          [newQuantity, existingItem.rows[0].id]
        );
      } else {
        // Add new item if it doesn't exist
        // Validate quantity limit - maximum 10 items per product
        if (quantity > 10) {
          return res.status(400).json({ 
            error: 'Maximum 10 items per product allowed',
            requestedQuantity: quantity,
            maxAllowed: 10
          });
        }
        
        await db.query(
          `INSERT INTO ${tempTableName} (product_id, quantity) VALUES ($1, $2)`,
          [productId, quantity]
        );
      }
    }
    
    res.status(201).json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    if (req.user) {
      console.error('[CART][ADD][ERROR] req.user:', req.user);
    }
    if (req.cartId) {
      console.error('[CART][ADD][ERROR] req.cartId:', req.cartId);
    }
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:itemId', async (req, res, next) => {
  // Check for authentication first
  if (req.headers.authorization && req.headers.authorization !== 'Bearer null') {
    try {
      const { verifyToken } = await import('../middleware/auth.js');
      await new Promise((resolve, reject) => {
        verifyToken(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  // Then ensure cart
  ensureCart(req, res, next);
}, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    // Validate quantity limit - maximum 10 items per product
    if (quantity > 10) {
      return res.status(400).json({ 
        error: 'Maximum 10 items per product allowed',
        requestedQuantity: quantity,
        maxAllowed: 10
      });
    }
    
    if (req.cartId) {
      // For authenticated users
      const result = await db.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING id',
        [quantity, itemId, req.cartId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
    } else if (req.guestCartId) {
      // For guest users
      const tempTableName = `guest_cart_${req.guestCartId.replace(/-/g, '_')}`;
      
      // Check if the temporary table exists first
      const tableExists = await db.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_name = $1
         )`,
        [tempTableName]
      );
      
      if (!tableExists.rows[0].exists) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      
      const result = await db.query(
        `UPDATE ${tempTableName} SET quantity = $1 WHERE id = $2 RETURNING id`,
        [quantity, itemId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
    }
    
    res.json({ success: true, message: 'Cart item updated' });
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/items/:itemId', async (req, res, next) => {
  // Check for authentication first
  if (req.headers.authorization && req.headers.authorization !== 'Bearer null') {
    try {
      const { verifyToken } = await import('../middleware/auth.js');
      await new Promise((resolve, reject) => {
        verifyToken(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  // Then ensure cart
  ensureCart(req, res, next);
}, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    if (req.cartId) {
      // For authenticated users
      const result = await db.query(
        'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
        [itemId, req.cartId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
    } else if (req.guestCartId) {
      // For guest users
      const tempTableName = `guest_cart_${req.guestCartId.replace(/-/g, '_')}`;
      
      // Check if the temporary table exists first
      const tableExists = await db.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_name = $1
         )`,
        [tempTableName]
      );
      
      if (!tableExists.rows[0].exists) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      
      const result = await db.query(
        `DELETE FROM ${tempTableName} WHERE id = $1 RETURNING id`,
        [itemId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
    }
    
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/', verifyToken, ensureCart, async (req, res) => {
  try {
    if (req.cartId) {
      // For authenticated users
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [req.cartId]);
    } else if (req.guestCartId) {
      // For guest users
      const tempTableName = `guest_cart_${req.guestCartId.replace(/-/g, '_')}`;
      
      const tableExists = await db.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_name = $1
         )`,
        [tempTableName]
      );
      
      if (tableExists.rows[0].exists) {
        await db.query(`TRUNCATE TABLE ${tempTableName}`);
      }
    }
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Merge guest cart with user cart
router.post('/merge', async (req, res) => {
  try {
    // Verify user is authenticated
    const { verifyToken } = await import('../middleware/auth.js');
    await new Promise((resolve, reject) => {
      verifyToken(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Ensure cart exists
    ensureCart(req, res, async () => {
      try {
        const guestCartId = req.cookies.guestCartId;
        
        if (guestCartId) {
          const tempTableName = `guest_cart_${guestCartId.replace(/-/g, '_')}`;
          const tableExists = await db.query(
            `SELECT EXISTS (
               SELECT FROM information_schema.tables 
               WHERE table_name = $1
             )`,
            [tempTableName]
          );
          
          if (tableExists.rows[0].exists) {
            const guestItemsResult = await db.query(
              `SELECT product_id, quantity FROM ${tempTableName}`
            );
            
            if (guestItemsResult.rows.length > 0) {
              // Merge items into user cart
              for (const item of guestItemsResult.rows) {
                const existingItem = await db.query(
                  'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
                  [req.cartId, item.product_id]
                );
                
                if (existingItem.rows.length > 0) {
                  const newQuantity = existingItem.rows[0].quantity + item.quantity;
                  await db.query(
                    'UPDATE cart_items SET quantity = $1 WHERE id = $2',
                    [newQuantity, existingItem.rows[0].id]
                  );
                } else {
                  await db.query(
                    'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
                    [req.cartId, item.product_id, item.quantity]
                  );
                }
              }
              
              // Delete guest cart table
              await db.query(`DROP TABLE IF EXISTS ${tempTableName}`);
              
              // Clear guest cart cookie
              res.clearCookie('guestCartId', {
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
              });
              
              res.json({ 
                success: true, 
                message: 'Cart merged successfully',
                mergedItems: guestItemsResult.rows.length
              });
            } else {
              res.json({ 
                success: true, 
                message: 'No items to merge',
                mergedItems: 0
              });
            }
          } else {
            res.json({ 
              success: true, 
              message: 'No guest cart found',
              mergedItems: 0
            });
          }
        } else {
          res.json({ 
            success: true, 
            message: 'No guest cart ID found',
            mergedItems: 0
          });
        }
      } catch (err) {
        console.error('Cart merge error:', err);
        res.status(500).json({ error: 'Failed to merge cart' });
      }
    });
  } catch (err) {
    console.error('Cart merge authentication error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Ensure user cart is properly loaded when switching between providers
router.post('/ensure-user-cart', verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // First, check for duplicate carts and merge them if needed
    const duplicateCartsResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    
    if (duplicateCartsResult.rows.length > 1) {

      
      // Use the first cart as the primary cart
      const primaryCartId = duplicateCartsResult.rows[0].id;
      const duplicateCartIds = duplicateCartsResult.rows.slice(1).map(row => row.id);
      
      // Merge items from duplicate carts into the primary cart
      for (const duplicateCartId of duplicateCartIds) {
        const duplicateItems = await db.query(
          'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1',
          [duplicateCartId]
        );
        
        for (const item of duplicateItems.rows) {
          // Check if item already exists in primary cart
          const existingItem = await db.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [primaryCartId, item.product_id]
          );
          
          if (existingItem.rows.length > 0) {
            // Update quantity
            const newQuantity = existingItem.rows[0].quantity + item.quantity;
            await db.query(
              'UPDATE cart_items SET quantity = $1 WHERE id = $2',
              [newQuantity, existingItem.rows[0].id]
            );
          } else {
            // Insert new item
            await db.query(
              'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
              [primaryCartId, item.product_id, item.quantity]
            );
          }
        }
        
        // Delete the duplicate cart and its items
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [duplicateCartId]);
        await db.query('DELETE FROM carts WHERE id = $1', [duplicateCartId]);
      }
      

    }
    
    // Check if user has existing cart items
    const existingCartResult = await db.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.title as name, p.price, p.image 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );
    
    if (existingCartResult.rows.length > 0) {

      return res.json({ 
        success: true, 
        message: 'User cart loaded successfully',
        hasItems: true,
        itemCount: existingCartResult.rows.length
      });
    } else {

      return res.json({ 
        success: true, 
        message: 'No existing cart items',
        hasItems: false,
        itemCount: 0
      });
    }
  } catch (err) {
    console.error('Error ensuring user cart:', err);
    res.status(500).json({ error: 'Failed to ensure user cart' });
  }
});

export default router;