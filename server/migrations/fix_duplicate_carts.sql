-- Fix duplicate carts issue by adding unique constraint
-- First, merge any existing duplicate carts
DO $$
DECLARE
    user_record RECORD;
    cart_record RECORD;
    primary_cart_id INTEGER;
    duplicate_cart_ids INTEGER[];
BEGIN
    -- Find users with multiple carts
    FOR user_record IN 
        SELECT user_id, COUNT(*) as cart_count 
        FROM carts 
        WHERE user_id IS NOT NULL 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Found % carts for user %', user_record.cart_count, user_record.user_id;
        
        -- Get all carts for this user, ordered by ID (oldest first)
        SELECT ARRAY_AGG(id ORDER BY id) INTO duplicate_cart_ids
        FROM carts 
        WHERE user_id = user_record.user_id;
        
        -- Use the first cart as primary
        primary_cart_id := duplicate_cart_ids[1];
        
        -- Merge items from duplicate carts into primary cart
        FOR i IN 2..array_length(duplicate_cart_ids, 1) LOOP
            -- Move items from duplicate cart to primary cart
            UPDATE cart_items 
            SET cart_id = primary_cart_id 
            WHERE cart_id = duplicate_cart_ids[i];
            
            -- Delete the duplicate cart
            DELETE FROM carts WHERE id = duplicate_cart_ids[i];
        END LOOP;
        
        RAISE NOTICE 'Merged duplicate carts for user %, kept cart %', user_record.user_id, primary_cart_id;
    END LOOP;
END $$;

-- Add unique constraint to prevent future duplicate carts
ALTER TABLE carts ADD CONSTRAINT unique_user_cart UNIQUE (user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id_unique ON carts(user_id); 