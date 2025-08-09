import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.title, p.description, p.price, p.image, p.stock,
             c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.is_active = true OR c.is_active IS NULL
      ORDER BY p.id DESC
    `);
    
    const products = result.rows.map(product => ({
      ...product,
      price: parseFloat(product.price),
      category: product.category_name || 'Uncategorized'
    }));
    
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all products (admin)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.title, p.description, p.price, p.image, p.stock,
             c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    
    const products = result.rows.map(product => ({
      ...product,
      price: parseFloat(product.price),
      category: product.category_name || 'Uncategorized'
    }));
    
    res.json(products);
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT p.id, p.title, p.description, p.price, p.image, p.stock,
             c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = {
      ...result.rows[0],
      price: parseFloat(result.rows[0].price),
      category: result.rows[0].category_name || 'Uncategorized'
    };
    
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, price, category_id, stock, image } = req.body;
    
    const result = await db.query(`
      INSERT INTO products (title, description, price, category_id, image, stock)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, price, category_id || null, image || null, stock || 0]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category_id, stock, image } = req.body;
    
    // Check if product exists
    const existingProduct = await db.query('SELECT id, image FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const result = await db.query(`
      UPDATE products 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category_id = COALESCE($4, category_id),
          image = COALESCE($5, image),
          stock = COALESCE($6, stock)
      WHERE id = $7
      RETURNING *
    `, [title, description, price, category_id || null, image, stock, id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await db.query('SELECT id, image FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete image file if it exists
    if (existingProduct.rows[0].image) {
      try {
        // Remove the leading slash and construct the full path
        const imagePath = path.join(__dirname, '..', existingProduct.rows[0].image.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
        // Continue with product deletion even if image deletion fails
      }
    }
    
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
