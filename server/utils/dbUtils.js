import db from '../db.js';

// Check and fix database sequences
export const checkAndFixSequences = async () => {
  try {
    console.log('Checking database sequences...');
    
    // Check users table sequence
    const usersResult = await db.query(
      "SELECT last_value, is_called FROM users_id_seq"
    );
    
    if (usersResult.rows.length > 0) {
      const { last_value, is_called } = usersResult.rows[0];
      console.log('Users sequence - last_value:', last_value, 'is_called:', is_called);
      
      // Get the highest user ID
      const maxIdResult = await db.query('SELECT MAX(id) as max_id FROM users');
      const maxId = maxIdResult.rows[0].max_id || 0;
      
      console.log('Highest user ID in database:', maxId);
      
      // If sequence is behind, update it
      if (last_value < maxId) {
        console.log('Fixing users sequence...');
        await db.query(`SELECT setval('users_id_seq', ${maxId})`);
        console.log('Users sequence fixed');
      }
      
      // If sequence is ahead but no users exist, reset it to 1 (minimum valid value)
      if (last_value > 0 && maxId === 0) {
        console.log('WARNING: Sequence ahead but no users exist. Resetting sequence to 1...');
        await db.query(`SELECT setval('users_id_seq', 1, false)`);
        console.log('Users sequence reset to 1');
      }
    }
    
    // Check other sequences - only for tables that exist
    const tables = ['products', 'carts', 'cart_items', 'orders'];
    
    for (const table of tables) {
      try {
        // First check if the table exists
        const tableExists = await db.query(
          `SELECT EXISTS (
             SELECT FROM information_schema.tables 
             WHERE table_name = $1
           )`,
          [table]
        );
        
        if (!tableExists.rows[0].exists) {
          console.log(`Table ${table} does not exist, skipping sequence check`);
          continue;
        }
        
        const seqResult = await db.query(
          `SELECT last_value, is_called FROM ${table}_id_seq`
        );
        
        if (seqResult.rows.length > 0) {
          const { last_value } = seqResult.rows[0];
          const maxIdResult = await db.query(`SELECT MAX(id) as max_id FROM ${table}`);
          const maxId = maxIdResult.rows[0].max_id || 0;
          
          console.log(`${table} sequence - last_value: ${last_value}, max_id: ${maxId}`);
          
          if (last_value < maxId) {
            await db.query(`SELECT setval('${table}_id_seq', ${maxId})`);
            console.log(`${table} sequence fixed`);
          }
          
          // Reset sequence if it's ahead but no records exist
          if (last_value > 0 && maxId === 0) {
            console.log(`WARNING: ${table} sequence ahead but no records exist. Resetting to 1...`);
            await db.query(`SELECT setval('${table}_id_seq', 1, false)`);
            console.log(`${table} sequence reset to 1`);
          }
        }
      } catch (err) {
        console.log(`No sequence found for ${table} table`);
      }
    }
    
    console.log('Database sequences check completed');
  } catch (err) {
    console.error('Error checking sequences:', err);
  }
};

// Get current user count and sequence info
export const getUserInfo = async () => {
  try {
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const maxId = await db.query('SELECT MAX(id) as max_id FROM users');
    const seqInfo = await db.query("SELECT last_value, is_called FROM users_id_seq");
    
    console.log('User count:', userCount.rows[0].count);
    console.log('Max user ID:', maxId.rows[0].max_id);
    console.log('Sequence info:', seqInfo.rows[0]);
    
    return {
      count: userCount.rows[0].count,
      maxId: maxId.rows[0].max_id,
      sequence: seqInfo.rows[0]
    };
  } catch (err) {
    console.error('Error getting user info:', err);
    return null;
  }
};

// Check database state and fix issues
export const checkDatabaseState = async () => {
  try {
    console.log('=== DATABASE STATE CHECK ===');
    
    // Check all tables that should exist
    const tables = ['users', 'products', 'carts', 'cart_items', 'orders'];
    
    for (const table of tables) {
      try {
        const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        const maxIdResult = await db.query(`SELECT MAX(id) as max_id FROM ${table}`);
        
        console.log(`${table}: ${countResult.rows[0].count} records, max ID: ${maxIdResult.rows[0].max_id || 0}`);
      } catch (err) {
        console.log(`${table}: table does not exist`);
      }
    }
    
    // Check sequences for existing tables
    for (const table of tables) {
      try {
        const seqResult = await db.query(`SELECT last_value, is_called FROM ${table}_id_seq`);
        if (seqResult.rows.length > 0) {
          console.log(`${table}_id_seq: last_value=${seqResult.rows[0].last_value}, is_called=${seqResult.rows[0].is_called}`);
        }
      } catch (err) {
        console.log(`No sequence for ${table}`);
      }
    }
    
    console.log('=== END DATABASE STATE CHECK ===');
  } catch (err) {
    console.error('Error checking database state:', err);
  }
};

// Reset database state and fix sequences
export const resetDatabaseState = async () => {
  try {
    console.log('=== RESETTING DATABASE STATE ===');
    
    // Check if users table is empty but sequence is ahead
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const seqResult = await db.query("SELECT last_value FROM users_id_seq");
    
    if (userCount.rows[0].count === 0 && seqResult.rows[0].last_value > 0) {
      console.log('Users table is empty but sequence is ahead. Resetting sequence to 1...');
      await db.query(`SELECT setval('users_id_seq', 1, false)`);
      console.log('Users sequence reset to 1');
    }
    
    // Check other tables and reset sequences if needed
    const tables = ['products', 'carts', 'cart_items', 'orders'];
    
    for (const table of tables) {
      try {
        // Check if table exists first
        const tableExists = await db.query(
          `SELECT EXISTS (
             SELECT FROM information_schema.tables 
             WHERE table_name = $1
           )`,
          [table]
        );
        
        if (!tableExists.rows[0].exists) {
          console.log(`Table ${table} does not exist, skipping`);
          continue;
        }
        
        const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.rows[0].count;
        
        if (count === 0) {
          try {
            const seqResult = await db.query(`SELECT last_value FROM ${table}_id_seq`);
            if (seqResult.rows[0].last_value > 0) {
              console.log(`${table} table is empty but sequence is ahead. Resetting to 1...`);
              await db.query(`SELECT setval('${table}_id_seq', 1, false)`);
              console.log(`${table} sequence reset to 1`);
            }
          } catch (err) {
            console.log(`No sequence for ${table}`);
          }
        }
      } catch (err) {
        console.log(`Error checking ${table}:`, err.message);
      }
    }
    
    console.log('=== DATABASE STATE RESET COMPLETED ===');
  } catch (err) {
    console.error('Error resetting database state:', err);
  }
}; 