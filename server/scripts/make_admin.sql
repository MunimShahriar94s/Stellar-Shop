-- This script updates a user's role to 'admin' in the database
-- Replace 'user@example.com' with the actual email of the user you want to make an admin

UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com' 
RETURNING id, name, email, role;

-- To run this script in PostgreSQL:
-- psql -U postgres -d online_store -f make_admin.sql