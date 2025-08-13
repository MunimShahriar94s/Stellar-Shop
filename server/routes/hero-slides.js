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

// Helper function to convert relative image URLs to absolute URLs in production
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // In production, prepend the server URL
  if (process.env.NODE_ENV === 'production') {
    const baseUrl = process.env.SERVER_URL || 'https://stellar-shop-fniz.onrender.com';
    return `${baseUrl}${imagePath}`;
  }
  
  // In development, return relative path
  return imagePath;
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/hero';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

// Get all hero slides (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hs.id, hs.title, hs.description, hs.image, hs.sort_order, hs.is_active,
             p.id as product_id, p.title as product_title, p.description as product_description, p.price
      FROM hero_slides hs
      LEFT JOIN products p ON hs.product_id = p.id
      WHERE hs.is_active = true
      ORDER BY hs.sort_order ASC, hs.id ASC
    `);
    
    const slides = result.rows.map(slide => ({
      ...slide,
      image: getImageUrl(slide.image),
      price: slide.price ? parseFloat(slide.price) : null
    }));
    
    res.json(slides);
  } catch (err) {
    console.error('Error fetching hero slides:', err);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
});

// Get all hero slides (admin)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hs.id, hs.title, hs.description, hs.image, hs.sort_order, hs.is_active,
             p.id as product_id, p.title as product_title, p.description as product_description, p.price
      FROM hero_slides hs
      LEFT JOIN products p ON hs.product_id = p.id
      ORDER BY hs.sort_order ASC, hs.id ASC
    `);
    
    const slides = result.rows.map(slide => ({
      ...slide,
      image: getImageUrl(slide.image),
      price: slide.price ? parseFloat(slide.price) : null
    }));
    
    res.json(slides);
  } catch (err) {
    console.error('Error fetching admin hero slides:', err);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
});

// Create new hero slide
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, product_id, sort_order, is_active } = req.body;
    const image = req.file ? `/uploads/hero/${req.file.filename}` : null;
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    const result = await db.query(`
      INSERT INTO hero_slides (title, description, image, product_id, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, image, product_id || null, sort_order || 0, is_active !== 'false']);
    
    res.status(201).json({
      ...result.rows[0],
      image: getImageUrl(result.rows[0].image)
    });
  } catch (err) {
    console.error('Error creating hero slide:', err);
    res.status(500).json({ error: 'Failed to create hero slide' });
  }
});

// Update hero slide
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, product_id, sort_order, is_active } = req.body;
    
    // Check if slide exists
    const existingSlide = await db.query('SELECT id, image FROM hero_slides WHERE id = $1', [id]);
    if (existingSlide.rows.length === 0) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }
    
    let image = existingSlide.rows[0].image;
    if (req.file) {
      // Delete old image if it exists
      if (existingSlide.rows[0].image) {
        try {
          const oldImagePath = path.join(__dirname, '..', existingSlide.rows[0].image.replace(/^\//, ''));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (fileError) {
          console.error('Error deleting old image:', fileError);
        }
      }
      image = `/uploads/hero/${req.file.filename}`;
    }
    
    const result = await db.query(`
      UPDATE hero_slides 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          image = $3,
          product_id = COALESCE($4, product_id),
          sort_order = COALESCE($5, sort_order),
          is_active = COALESCE($6, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [title, description, image, product_id || null, sort_order, is_active !== 'false', id]);
    
    res.json({
      ...result.rows[0],
      image: getImageUrl(result.rows[0].image)
    });
  } catch (err) {
    console.error('Error updating hero slide:', err);
    res.status(500).json({ error: 'Failed to update hero slide' });
  }
});

// Delete hero slide
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if slide exists
    const existingSlide = await db.query('SELECT id, image FROM hero_slides WHERE id = $1', [id]);
    if (existingSlide.rows.length === 0) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }
    
    // Delete image file if it exists
    if (existingSlide.rows[0].image) {
      try {
        const imagePath = path.join(__dirname, '..', existingSlide.rows[0].image.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
      }
    }
    
    await db.query('DELETE FROM hero_slides WHERE id = $1', [id]);
    
    res.json({ message: 'Hero slide deleted successfully' });
  } catch (err) {
    console.error('Error deleting hero slide:', err);
    res.status(500).json({ error: 'Failed to delete hero slide' });
  }
});

export default router;
