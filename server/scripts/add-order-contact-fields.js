import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running add_order_contact_fields migration...');

    const migrationPath = path.join(__dirname, '../migrations/add_order_contact_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await db.query(migrationSQL);

    console.log('✅ Migration completed: phone and address added to orders table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();


