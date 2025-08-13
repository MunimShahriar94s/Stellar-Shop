-- Migration to add hero slides functionality

-- Create hero slides table
CREATE TABLE hero_slides (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  product_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hero_slide_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Add hero settings to settings table
INSERT INTO settings (category, key_name, value) VALUES
-- Hero Settings
('hero', 'title', 'Discover Premium Products for Your Lifestyle'),
('hero', 'description', 'Explore our curated collection of high-quality products designed to enhance your everyday life. From cutting-edge electronics to stylish home decor, we have everything you need.'),
('hero', 'enableSlideshow', 'true'),
('hero', 'autoPlay', 'true'),
('hero', 'autoPlaySpeed', '5000');
