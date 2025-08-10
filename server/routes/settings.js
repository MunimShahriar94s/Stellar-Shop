import express from 'express';
import db from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

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

// Helper function to process settings and convert image URLs
const processSettings = (settings) => {
  const processed = {};
  
  for (const [category, categorySettings] of Object.entries(settings)) {
    processed[category] = {};
    
    for (const [key, value] of Object.entries(categorySettings)) {
      // Process image URLs for logo and favicon
      if ((key === 'logo' || key === 'favicon') && typeof value === 'string') {
        processed[category][key] = getImageUrl(value);
      } else {
        processed[category][key] = value;
      }
    }
  }
  
  return processed;
};

// Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT category, key_name, value FROM settings ORDER BY category, key_name');
    
    // Group settings by category
    const settings = {};
    result.rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      
      // Parse JSON values for arrays/objects
      let value = row.value;
      try {
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        } else if (!isNaN(value) && value !== '') {
          value = Number(value);
        } else if (value.startsWith('[') || value.startsWith('{')) {
          value = JSON.parse(value);
        }
      } catch (e) {
        // Keep as string if parsing fails
      }
      
      settings[row.category][row.key_name] = value;
    });
    
    // Process image URLs
    const processedSettings = processSettings(settings);
    
    res.json(processedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }
    
    // Prepare batch update
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [category, categorySettings] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(categorySettings)) {
        // Convert value to string for storage
        let stringValue;
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = value.toString();
        }
        
        updates.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
        values.push(category, key, stringValue);
        paramIndex += 3;
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No settings to update' });
    }
    
    // Use UPSERT to insert or update settings
    const query = `
      INSERT INTO settings (category, key_name, value) 
      VALUES ${updates.join(', ')}
      ON CONFLICT (category, key_name) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await db.query(query, values);
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get settings by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await db.query(
      'SELECT key_name, value FROM settings WHERE category = $1 ORDER BY key_name',
      [category]
    );
    
    const categorySettings = {};
    result.rows.forEach(row => {
      // Parse JSON values for arrays/objects
      let value = row.value;
      try {
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        } else if (!isNaN(value) && value !== '') {
          value = Number(value);
        } else if (value.startsWith('[') || value.startsWith('{')) {
          value = JSON.parse(value);
        }
      } catch (e) {
        // Keep as string if parsing fails
      }
      
      categorySettings[row.key_name] = value;
    });
    
    // Process image URLs for this category
    const processedSettings = {};
    for (const [key, value] of Object.entries(categorySettings)) {
      if ((key === 'logo' || key === 'favicon') && typeof value === 'string') {
        processedSettings[key] = getImageUrl(value);
      } else {
        processedSettings[key] = value;
      }
    }
    
    res.json(processedSettings);
  } catch (error) {
    console.error('Error fetching category settings:', error);
    res.status(500).json({ error: 'Failed to fetch category settings' });
  }
});

// Update settings by category
router.put('/:category', verifyToken, isAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const categorySettings = req.body;
    
    if (!categorySettings || typeof categorySettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }
    
    // Prepare batch update for this category
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(categorySettings)) {
      // Convert value to string for storage
      let stringValue;
      if (typeof value === 'boolean') {
        stringValue = value.toString();
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = value.toString();
      }
      
      updates.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
      values.push(category, key, stringValue);
      paramIndex += 3;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No settings to update' });
    }
    
    // Use UPSERT to insert or update settings
    const query = `
      INSERT INTO settings (category, key_name, value) 
      VALUES ${updates.join(', ')}
      ON CONFLICT (category, key_name) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await db.query(query, values);
    
    res.json({ message: 'Category settings updated successfully' });
  } catch (error) {
    console.error('Error updating category settings:', error);
    res.status(500).json({ error: 'Failed to update category settings' });
  }
});

export default router;
