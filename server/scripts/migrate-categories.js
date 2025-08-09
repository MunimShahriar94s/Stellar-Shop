import db from '../db.js';

async function migrateCategories() {
  try {
    console.log('Starting category migration...');
    
    // First, let's see what categories exist in the products table
    const existingCategories = await db.query(`
      SELECT DISTINCT category 
      FROM products 
      WHERE category IS NOT NULL AND category != ''
    `);
    
    console.log('Existing categories in products:', existingCategories.rows.map(row => row.category));
    
    // Create categories for each unique category name
    for (const row of existingCategories.rows) {
      const categoryName = row.category;
      
      // Check if category already exists
      const existingCategory = await db.query('SELECT id FROM categories WHERE name = $1', [categoryName]);
      
      if (existingCategory.rows.length === 0) {
        // Create new category
        const result = await db.query(`
          INSERT INTO categories (name, description, sort_order)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [categoryName, `${categoryName} products`, 0]);
        
        console.log(`Created category: ${categoryName} with ID: ${result.rows[0].id}`);
      } else {
        console.log(`Category already exists: ${categoryName}`);
      }
    }
    
    // Now update products to use category_id instead of category text
    const categories = await db.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categories.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Update products
    for (const row of existingCategories.rows) {
      const categoryName = row.category;
      const categoryId = categoryMap[categoryName];
      
      if (categoryId) {
        await db.query(`
          UPDATE products 
          SET category_id = $1 
          WHERE category = $2
        `, [categoryId, categoryName]);
        
        console.log(`Updated products in category "${categoryName}" to use category_id: ${categoryId}`);
      }
    }
    
    console.log('Category migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

migrateCategories();
