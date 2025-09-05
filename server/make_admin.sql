-- Run this SQL directly in your database to make your user an admin
-- Replace 'your_email@example.com' with your actual email

UPDATE users 
SET role = 'admin' 
WHERE email = 'your_email@example.com';

-- Verify the change
SELECT id, name, email, role FROM users WHERE email = 'your_email@example.com';