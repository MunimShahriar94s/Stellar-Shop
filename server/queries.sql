CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER,
  category_id INTEGER,
  description VARCHAR(250),
  stock INTEGER,
  image TEXT,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  provider TEXT DEFAULT 'local',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  picture TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_expires TIMESTAMP,
  UNIQUE(email, provider)
);

-- CARTS & CART ITEMS (supports user and guest carts)
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  guest_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_or_guest UNIQUE (user_id, guest_id)
);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(cart_id, product_id)
);


CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  subtotal NUMERIC(10,2) DEFAULT 0,
  shipping NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  phone TEXT,
  address TEXT,
  customer_name TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- SETTINGS TABLE
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  key_name TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key_name)
);

-- Insert default settings
INSERT INTO settings (category, key_name, value) VALUES
-- General Settings
('general', 'storeName', 'StellarShop'),
('general', 'storeEmail', 'info@stellarshop.com'),
('general', 'storePhone', '(212) 555-1234'),
('general', 'storeAddress', '123 Shopping Street, Retail District, New York, NY 10001'),
('general', 'currency', 'USD'),
('general', 'language', 'en'),

-- Appearance Settings
('appearance', 'primaryColor', '#ff6b6b'),
('appearance', 'secondaryColor', '#e05050'),
('appearance', 'logo', '/logo.png'),
('appearance', 'favicon', '/favicon.ico'),
('appearance', 'showFeaturedProducts', 'true'),
('appearance', 'productsPerPage', '12'),
('appearance', 'enableDarkMode', 'false'),

-- Hero Settings
('hero', 'slides', '[{"id": 1, "title": "Discover Premium Products for Your Lifestyle", "description": "Explore our curated collection of high-quality products designed to enhance your everyday life. From cutting-edge electronics to stylish home decor, we have everything you need.", "backgroundImage": "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "buttonText": "Shop Now", "buttonLink": "/products", "secondaryButtonText": "Learn More", "secondaryButtonLink": "/about", "active": true}, {"id": 2, "title": "Exclusive Deals & Limited Time Offers", "description": "Don\'t miss out on our exclusive deals and limited-time offers. Save big on premium products while supplies last.", "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "buttonText": "View Deals", "buttonLink": "/products", "secondaryButtonText": "Sign Up", "secondaryButtonLink": "/signup", "active": true}, {"id": 3, "title": "Free Shipping on Orders Over $100", "description": "Enjoy free shipping on all orders over $100. Fast, reliable delivery to your doorstep with premium customer service.", "backgroundImage": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "buttonText": "Start Shopping", "buttonLink": "/products", "secondaryButtonText": "Track Order", "secondaryButtonLink": "/orders", "active": true}]'),
('hero', 'autoPlay', 'true'),
('hero', 'autoPlaySpeed', '5000'),
('hero', 'showDots', 'true'),
('hero', 'showArrows', 'true'),

-- Shipping Settings
('shipping', 'freeShippingThreshold', '100'),
('shipping', 'standardShippingRate', '10'),
('shipping', 'expressShippingRate', '25'),
('shipping', 'shippingCountries', '["US", "CA", "UK", "AU"]'),
('shipping', 'taxRate', '7'),

-- Payment Settings
('payment', 'acceptCreditCards', 'true'),
('payment', 'acceptPayPal', 'true'),
('payment', 'acceptApplePay', 'false'),
('payment', 'acceptGooglePay', 'false'),
('payment', 'stripePublicKey', 'pk_test_123456789'),
('payment', 'paypalClientId', 'client_id_123456789'),

-- Notification Settings
('notifications', 'orderConfirmation', 'true'),
('notifications', 'orderShipped', 'true'),
('notifications', 'orderDelivered', 'true'),
('notifications', 'abandonedCart', 'true'),
('notifications', 'emailNewsletter', 'true'),
('notifications', 'emailFormat', 'html');

-- Insert default categories
INSERT INTO categories (name, description, sort_order) VALUES
('Furniture', 'High-quality furniture for your home', 1),
('Lighting', 'Beautiful lighting solutions', 2),
('Home Decor', 'Decorative items to enhance your space', 3),
('Kitchen', 'Kitchen essentials and accessories', 4),
('Bedroom', 'Bedroom furniture and accessories', 5);
