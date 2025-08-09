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
    const uploadDir = 'uploads/categories';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, image, is_active, sort_order, 
             (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as product_count
      FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all categories (admin - includes inactive)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, image, is_active, sort_order, created_at, updated_at,
             (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as product_count
      FROM categories 
      ORDER BY sort_order ASC, name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, name, description, image, is_active, sort_order, created_at, updated_at,
             (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as product_count
      FROM categories 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, is_active, sort_order } = req.body;
    
    // Check if category name already exists
    const existingCategory = await db.query('SELECT id FROM categories WHERE name = $1', [name]);
    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    
    const image = req.file ? `/uploads/categories/${req.file.filename}` : null;
    
    const result = await db.query(`
      INSERT INTO categories (name, description, image, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, image, is_active === 'true', sort_order || 0]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, sort_order } = req.body;
    
    // Check if category exists
    const existingCategory = await db.query('SELECT id, image FROM categories WHERE id = $1', [id]);
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if new name conflicts with existing category (excluding current category)
    if (name) {
      const nameConflict = await db.query('SELECT id FROM categories WHERE name = $1 AND id != $2', [name, id]);
      if (nameConflict.rows.length > 0) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }
    
    let image = existingCategory.rows[0].image;
    
    // If new image uploaded, delete old image and use new one
    if (req.file) {
      // Delete old image if it exists
      if (existingCategory.rows[0].image) {
        const oldImagePath = path.join(__dirname, '..', existingCategory.rows[0].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = `/uploads/categories/${req.file.filename}`;
    }
    
    const result = await db.query(`
      UPDATE categories 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          image = COALESCE($3, image),
          is_active = COALESCE($4, is_active),
          sort_order = COALESCE($5, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, description, image, is_active === 'true', sort_order, id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await db.query('SELECT id, image FROM categories WHERE id = $1', [id]);
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category has products
    const productsCount = await db.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(productsCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has products. Please reassign or delete the products first.' 
      });
    }
    
    // Delete image file if it exists
    if (existingCategory.rows[0].image) {
      const imagePath = path.join(__dirname, '..', existingCategory.rows[0].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Toggle category active status
router.patch('/:id/toggle', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      UPDATE categories 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling category status:', err);
    res.status(500).json({ error: 'Failed to toggle category status' });
  }
});

export default router;
