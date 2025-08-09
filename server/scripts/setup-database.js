import db from '../db.js';

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        image TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Categories table created');
    
    // Add category_id column to products table if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE products 
        ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
      `);
      console.log('✅ Added category_id column to products table');
    } catch (err) {
      if (err.code === '42701') { // Column already exists
        console.log('ℹ️  category_id column already exists in products table');
      } else {
        throw err;
      }
    }
    
    // Insert default categories
    const defaultCategories = [
      { name: 'Furniture', description: 'High-quality furniture for your home', sort_order: 1 },
      { name: 'Lighting', description: 'Beautiful lighting solutions', sort_order: 2 },
      { name: 'Home Decor', description: 'Decorative items to enhance your space', sort_order: 3 },
      { name: 'Kitchen', description: 'Kitchen essentials and accessories', sort_order: 4 },
      { name: 'Bedroom', description: 'Bedroom furniture and accessories', sort_order: 5 }
    ];
    
    for (const category of defaultCategories) {
      try {
        await db.query(`
          INSERT INTO categories (name, description, sort_order)
          VALUES ($1, $2, $3)
          ON CONFLICT (name) DO NOTHING;
        `, [category.name, category.description, category.sort_order]);
        console.log(`✅ Added category: ${category.name}`);
      } catch (err) {
        console.log(`ℹ️  Category ${category.name} already exists`);
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
