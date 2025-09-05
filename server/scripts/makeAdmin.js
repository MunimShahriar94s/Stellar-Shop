import db from '../db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to make a user an admin by email
async function makeAdmin(email) {
  try {
    // Update user role to admin
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
      ['admin', email]
    );
    
    if (result.rows.length === 0) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    console.log(`User ${result.rows[0].email} has been made an admin`);
    console.log('User details:', result.rows[0]);
  } catch (err) {
    console.error('Error making user admin:', err);
  } finally {
    // Close the database connection
    await db.end();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address');
  console.log('Usage: node makeAdmin.js user@example.com');
  process.exit(1);
}

// Execute the function
makeAdmin(email);