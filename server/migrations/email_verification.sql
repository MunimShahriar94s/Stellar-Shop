-- Migration to add email verification fields to users table
-- Run this if you have an existing database

-- Add email verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP;

-- Update existing users to have verified email (for existing users)
-- Comment this out if you want to require verification for existing users
-- UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL; 