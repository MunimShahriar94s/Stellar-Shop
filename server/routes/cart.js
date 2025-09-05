// server/routes/cart.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper function to verify JWT and set req.user
const verifyJWTAndSetUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || authHeader === 'Bearer null') {
      console.log('[CART][BACKEND] No valid Authorization header, proceeding as guest');
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('[CART][BACKEND] No token found in Authorization header, proceeding as guest');
      return next();
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('[CART][BACKEND] JWT verified successfully, user:', req.user.id);
      next();
    } catch (jwtError) {
      console.error('[CART][BACKEND] JWT verification failed:', jwtError.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('[CART][BACKEND] Error in JWT verification:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Reusable cart merge function for server-side operations
export const mergeGuestCart = async (req, res) => {
  try {
    console.log('[CART][BACKEND] Starting server-side cart merge...');
    const guestCartId = req.cookies.guestCartId;
    
    if (!guestCartId) {
      console.log('[CART][BACKEND] No guest cart ID found, nothing to merge');
      return;
    }
    
    console.log('[CART][BACKEND] Guest cart ID:', guestCartId);
    console.log('[CART][BACKEND] User ID:', req.user.id);
    
    // Get user cart ID
    const userCartResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [req.user.id]
    );
    
    let userCartId;
    if (userCartResult.rows.length === 0) {
      // Create new user cart
      console.log('[CART][BACKEND] Creating new user cart for user:', req.user.id);
      const newCartResult = await db.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [req.user.id]
      );
      userCartId = newCartResult.rows[0].id;
      console.log('[CART][BACKEND] New user cart created with ID:', userCartId);
    } else {
      userCartId = userCartResult.rows[0].id;
      console.log('[CART][BACKEND] Using existing user cart ID:', userCartId);
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
      console.log('[CART][BACKEND] Guest cart table does not exist:', tempTableName);
      return;
    }
    
    console.log('[CART][BACKEND] Guest cart table exists:', tempTableName);
    
    // Get guest cart items
    const guestItemsResult = await db.query(
      `SELECT product_id, quantity FROM ${tempTableName}`
    );
    
    if (guestItemsResult.rows.length === 0) {
      console.log('[CART][BACKEND] No items in guest cart to merge');
      return;
    }
    
    console.log('[CART][BACKEND] Found', guestItemsResult.rows.length, 'items in guest cart');
    
    // Merge items into user cart
    for (const item of guestItemsResult.rows) {
      console.log('[CART][BACKEND] Processing item:', item);
      
      // Check if item already exists in user cart
      const existingItem = await db.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [userCartId, item.product_id]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + item.quantity;
        console.log('[CART][BACKEND] Updating existing item quantity from', existingItem.rows[0].quantity, 'to', newQuantity);
        
        // Validate quantity limit - maximum 10 items per product
        if (newQuantity > 10) {
          // Cap the quantity at 10
          await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2',
            [10, existingItem.rows[0].id]
          );
          console.log('[CART][BACKEND] Capped quantity at 10 for product:', item.product_id);
        } else {
          await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2',
            [newQuantity, existingItem.rows[0].id]
          );
          console.log('[CART][BACKEND] Updated quantity for product:', item.product_id);
        }
      } else {
        // Add new item
        // Validate quantity limit - maximum 10 items per product
        const quantityToAdd = Math.min(item.quantity, 10);
        await db.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
          [userCartId, item.product_id, quantityToAdd]
        );
        console.log('[CART][BACKEND] Added new item for product:', item.product_id, 'quantity:', quantityToAdd);
      }
    }
    
    // Delete guest cart table
    await db.query(`DROP TABLE IF EXISTS ${tempTableName}`);
    console.log('[CART][BACKEND] Deleted guest cart table:', tempTableName);
    
    // Clear guest cart cookie
    res.clearCookie('guestCartId', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });
    console.log('[CART][BACKEND] Cleared guest cart cookie');
    
    console.log('[CART][BACKEND] Server-side cart merge completed successfully');
    
  } catch (error) {
    console.error('[CART][BACKEND] Server-side cart merge error:', error);
    throw error;
  }
};

const ensureCart = async (req, res, next) => {
  try {
    console.log('[CART][BACKEND] ensureCart middleware - req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] ensureCart middleware - req.cookies.guestCartId:', req.cookies.guestCartId);
    
    if (req.user) {
      // For authenticated users, ensure they have a cart
      let cartId = req.cartId;
      if (!cartId) {
        // Check if user already has a cart
        const result = await db.query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
        if (result.rows.length > 0) {
          cartId = result.rows[0].id;
          req.cartId = cartId;
          console.log('[CART][BACKEND] Found existing cart for user:', req.user.id, 'cart ID:', cartId);
        } else {
          // Create new cart for user
          const newCartResult = await db.query(
            'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
            [req.user.id]
          );
          cartId = newCartResult.rows[0].id;
          req.cartId = cartId;
          console.log('[CART][BACKEND] Created new cart for user:', req.user.id, 'cart ID:', cartId);
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
        console.log('[CART][BACKEND] Created new guest cart ID:', guestCartId);
      }
      // Store the guest cart ID in the request
      req.guestCartId = guestCartId;
      console.log('[CART][BACKEND] Using guest cart ID:', guestCartId);
    }
    
    next();
  } catch (err) {
    console.error('[CART][BACKEND] Error in ensureCart middleware:', err);
    next(err);
  }
};

// Get cart contents
router.get('/', verifyJWTAndSetUser, ensureCart, async (req, res) => {
  try {
    console.log('[CART][BACKEND] GET /cart - Starting cart fetch');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] req.cartId:', req.cartId);
    console.log('[CART][BACKEND] req.guestCartId:', req.guestCartId);

    let cartItems = [];
    
    if (req.cartId) {
      // For authenticated users
      console.log('[CART][BACKEND] Fetching cart for authenticated user, cart ID:', req.cartId);
      
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
      
      console.log('[CART][BACKEND] Found', cartItems.length, 'items for authenticated user');

    } else if (req.guestCartId) {
      // For guest users, we'll use a temporary table to store cart items
      console.log('[CART][BACKEND] Fetching cart for guest user, guest cart ID:', req.guestCartId);
      
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
        console.log('[CART][BACKEND] Found', cartItems.length, 'items for guest user');
      } else {
        console.log('[CART][BACKEND] Guest cart table does not exist yet');
      }
    }
    
    console.log('[CART][BACKEND] Returning cart with', cartItems.length, 'items');
    res.json({ items: cartItems });
    
  } catch (err) {
    console.error('[CART][BACKEND] Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/items', verifyJWTAndSetUser, ensureCart, async (req, res) => {
  try {
    console.log('[CART][BACKEND] POST /cart/items - Adding item to cart');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] req.cartId:', req.cartId);
    console.log('[CART][BACKEND] req.guestCartId:', req.guestCartId);
    console.log('[CART][BACKEND] Request body:', req.body);
    
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
      console.log('[CART][BACKEND] Adding item to authenticated user cart, cart ID:', req.cartId);
      
      // Check if item already exists in cart
      const existingItem = await db.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [req.cartId, productId]
      );
      
      if (existingItem.rows.length > 0) {
        // Update quantity if item exists
        const newQuantity = existingItem.rows[0].quantity + quantity;
        console.log('[CART][BACKEND] Updating existing item quantity from', existingItem.rows[0].quantity, 'to', newQuantity);
        
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
        console.log('[CART][BACKEND] Updated item quantity successfully');
      } else {
        // Add new item if it doesn't exist
        console.log('[CART][BACKEND] Adding new item to cart');
        
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
        console.log('[CART][BACKEND] Added new item successfully');
      }
    } else if (req.guestCartId) {
      // For guest users
      console.log('[CART][BACKEND] Adding item to guest cart, guest cart ID:', req.guestCartId);
      
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
        console.log('[CART][BACKEND] Creating guest cart table:', tempTableName);
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
        console.log('[CART][BACKEND] Updating existing guest item quantity from', existingItem.rows[0].quantity, 'to', newQuantity);
        
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
        console.log('[CART][BACKEND] Updated guest item quantity successfully');
      } else {
        // Add new item if it doesn't exist
        console.log('[CART][BACKEND] Adding new item to guest cart');
        
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
        console.log('[CART][BACKEND] Added new guest item successfully');
      }
    }
    
    console.log('[CART][BACKEND] Item added to cart successfully');
    res.status(201).json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    console.error('[CART][BACKEND] Error adding item to cart:', err);
    if (req.user) {
      console.error('[CART][BACKEND] req.user:', req.user);
    }
    if (req.cartId) {
      console.error('[CART][BACKEND] req.cartId:', req.cartId);
    }
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:itemId', verifyJWTAndSetUser, ensureCart, async (req, res) => {
  try {
    console.log('[CART][BACKEND] PUT /cart/items/:itemId - Updating cart item');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] req.cartId:', req.cartId);
    console.log('[CART][BACKEND] req.guestCartId:', req.guestCartId);
    console.log('[CART][BACKEND] Item ID:', req.params.itemId);
    console.log('[CART][BACKEND] Request body:', req.body);
    
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
      console.log('[CART][BACKEND] Updating item in authenticated user cart');
      const result = await db.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3 RETURNING id',
        [quantity, itemId, req.cartId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      console.log('[CART][BACKEND] Item updated successfully');
    } else if (req.guestCartId) {
      // For guest users
      console.log('[CART][BACKEND] Updating item in guest cart');
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
      console.log('[CART][BACKEND] Guest item updated successfully');
    }
    
    console.log('[CART][BACKEND] Cart item updated successfully');
    res.json({ success: true, message: 'Cart item updated' });
  } catch (err) {
    console.error('[CART][BACKEND] Error updating cart item:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/items/:itemId', verifyJWTAndSetUser, ensureCart, async (req, res) => {
  try {
    console.log('[CART][BACKEND] DELETE /cart/items/:itemId - Removing cart item');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] req.cartId:', req.cartId);
    console.log('[CART][BACKEND] req.guestCartId:', req.guestCartId);
    console.log('[CART][BACKEND] Item ID:', req.params.itemId);
    
    const { itemId } = req.params;
    
    if (req.cartId) {
      // For authenticated users
      console.log('[CART][BACKEND] Removing item from authenticated user cart');
      const result = await db.query(
        'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
        [itemId, req.cartId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      console.log('[CART][BACKEND] Item removed successfully');
    } else if (req.guestCartId) {
      // For guest users
      console.log('[CART][BACKEND] Removing item from guest cart');
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
      console.log('[CART][BACKEND] Guest item removed successfully');
    }
    
    console.log('[CART][BACKEND] Cart item removed successfully');
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('[CART][BACKEND] Error removing item from cart:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/', verifyJWTAndSetUser, ensureCart, async (req, res) => {
  try {
    console.log('[CART][BACKEND] DELETE /cart - Clearing cart');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] req.cartId:', req.cartId);
    console.log('[CART][BACKEND] req.guestCartId:', req.guestCartId);
    
    if (req.cartId) {
      // For authenticated users
      console.log('[CART][BACKEND] Clearing authenticated user cart');
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [req.cartId]);
      console.log('[CART][BACKEND] Authenticated user cart cleared successfully');
    } else if (req.guestCartId) {
      // For guest users
      console.log('[CART][BACKEND] Clearing guest cart');
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
        console.log('[CART][BACKEND] Guest cart cleared successfully');
      }
    }
    
    console.log('[CART][BACKEND] Cart cleared successfully');
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('[CART][BACKEND] Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Merge guest cart with user cart
router.post('/merge', verifyJWTAndSetUser, ensureCart, async (req, res) => {
  try {
    console.log('[CART][BACKEND] POST /cart/merge - Starting cart merge');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    console.log('[CART][BACKEND] req.cartId:', req.cartId);
    console.log('[CART][BACKEND] req.guestCartId:', req.guestCartId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Ensure cart exists
    ensureCart(req, res, async () => {
      try {
        const guestCartId = req.cookies.guestCartId;
        
        if (guestCartId) {
          console.log('[CART][BACKEND] Guest cart ID found:', guestCartId);
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
              console.log('[CART][BACKEND] Found', guestItemsResult.rows.length, 'items to merge');
              
              // Merge items into user cart
              for (const item of guestItemsResult.rows) {
                console.log('[CART][BACKEND] Processing merge item:', item);
                
                const existingItem = await db.query(
                  'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
                  [req.cartId, item.product_id]
                );
                
                if (existingItem.rows.length > 0) {
                  const newQuantity = existingItem.rows[0].quantity + item.quantity;
                  console.log('[CART][BACKEND] Updating existing item quantity from', existingItem.rows[0].quantity, 'to', newQuantity);
                  
                  // Cap at 10 if exceeds limit
                  const finalQuantity = Math.min(newQuantity, 10);
                  await db.query(
                    'UPDATE cart_items SET quantity = $1 WHERE id = $2',
                    [finalQuantity, existingItem.rows[0].id]
                  );
                } else {
                  console.log('[CART][BACKEND] Adding new item to user cart');
                  const quantityToAdd = Math.min(item.quantity, 10);
                  await db.query(
                    'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
                    [req.cartId, item.product_id, quantityToAdd]
                  );
                }
              }
              
              // Delete guest cart table
              await db.query(`DROP TABLE IF EXISTS ${tempTableName}`);
              console.log('[CART][BACKEND] Deleted guest cart table:', tempTableName);
              
              // Clear guest cart cookie
              res.clearCookie('guestCartId', {
                httpOnly: true,
                sameSite: 'lax',
                path: '/'
              });
              console.log('[CART][BACKEND] Cleared guest cart cookie');
              
              res.json({ 
                success: true, 
                message: 'Cart merged successfully',
                mergedItems: guestItemsResult.rows.length
              });
            } else {
              console.log('[CART][BACKEND] No items to merge');
              res.json({ 
                success: true, 
                message: 'No items to merge',
                mergedItems: 0
              });
            }
          } else {
            console.log('[CART][BACKEND] No guest cart table found');
            res.json({ 
              success: true, 
              message: 'No guest cart found',
              mergedItems: 0
            });
          }
        } else {
          console.log('[CART][BACKEND] No guest cart ID found');
          res.json({ 
            success: true, 
            message: 'No guest cart ID found',
            mergedItems: 0
          });
        }
      } catch (err) {
        console.error('[CART][BACKEND] Cart merge error:', err);
        res.status(500).json({ error: 'Failed to merge cart' });
      }
    });
  } catch (err) {
    console.error('[CART][BACKEND] Cart merge authentication error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Ensure user cart is properly loaded when switching between providers
router.post('/ensure-user-cart', verifyJWTAndSetUser, async (req, res) => {
  try {
    console.log('[CART][BACKEND] POST /cart/ensure-user-cart - Ensuring user cart');
    console.log('[CART][BACKEND] req.user:', req.user ? req.user.id : 'null');
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // First, check for duplicate carts and merge them if needed
    const duplicateCartsResult = await db.query(
      'SELECT id FROM carts WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    
    if (duplicateCartsResult.rows.length > 1) {
      console.log('[CART][BACKEND] Found', duplicateCartsResult.rows.length, 'duplicate carts for user:', req.user.id);
      
      // Use the first cart as the primary cart
      const primaryCartId = duplicateCartsResult.rows[0].id;
      const duplicateCartIds = duplicateCartsResult.rows.slice(1).map(row => row.id);
      
      console.log('[CART][BACKEND] Primary cart ID:', primaryCartId);
      console.log('[CART][BACKEND] Duplicate cart IDs:', duplicateCartIds);
      
      // Merge items from duplicate carts into the primary cart
      for (const duplicateCartId of duplicateCartIds) {
        console.log('[CART][BACKEND] Processing duplicate cart:', duplicateCartId);
        
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
            const finalQuantity = Math.min(newQuantity, 10); // Cap at 10
            await db.query(
              'UPDATE cart_items SET quantity = $1 WHERE id = $2',
              [finalQuantity, existingItem.rows[0].id]
            );
            console.log('[CART][BACKEND] Updated quantity for product:', item.product_id, 'to', finalQuantity);
          } else {
            // Insert new item
            const quantityToAdd = Math.min(item.quantity, 10);
            await db.query(
              'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
              [primaryCartId, item.product_id, quantityToAdd]
            );
            console.log('[CART][BACKEND] Added item for product:', item.product_id, 'quantity:', quantityToAdd);
          }
        }
        
        // Delete the duplicate cart and its items
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [duplicateCartId]);
        await db.query('DELETE FROM carts WHERE id = $1', [duplicateCartId]);
        console.log('[CART][BACKEND] Deleted duplicate cart:', duplicateCartId);
      }
      
      console.log('[CART][BACKEND] Duplicate carts merged successfully');
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
      console.log('[CART][BACKEND] Found', existingCartResult.rows.length, 'existing cart items for user:', req.user.id);
      return res.json({ 
        success: true, 
        message: 'User cart loaded successfully',
        hasItems: true,
        itemCount: existingCartResult.rows.length
      });
    } else {
      console.log('[CART][BACKEND] No existing cart items for user:', req.user.id);
      return res.json({ 
        success: true, 
        message: 'No existing cart items',
        hasItems: false,
        itemCount: 0
      });
    }
  } catch (err) {
    console.error('[CART][BACKEND] Error ensuring user cart:', err);
    res.status(500).json({ error: 'Failed to ensure user cart' });
  }
});

export default router;