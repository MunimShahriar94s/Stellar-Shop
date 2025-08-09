-- Add guest_carts table to support guest shopping
ALTER TABLE carts DROP CONSTRAINT IF EXISTS fk_cart_user;
ALTER TABLE carts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE carts ADD COLUMN guest_id UUID UNIQUE;
ALTER TABLE carts ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_carts_guest_id ON carts(guest_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Add function to clean up old guest carts (can be scheduled to run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_guest_carts() RETURNS void AS $$
BEGIN
  DELETE FROM carts 
  WHERE user_id IS NULL 
    AND guest_id IS NOT NULL 
    AND updated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;