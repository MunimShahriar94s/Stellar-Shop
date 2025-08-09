import db from '../db.js';

const createSettingsTable = async () => {
  try {
    console.log('Creating settings table...');
    
    // Create settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        key_name TEXT NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, key_name)
      );
    `);
    
    // Check if settings already exist
    const existingSettings = await db.query('SELECT COUNT(*) as count FROM settings');
    
    if (existingSettings.rows[0].count === '0') {
      console.log('Inserting default settings...');
      
      // Insert default settings
      await db.query(`
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
      `);
      
      console.log('Default settings inserted successfully!');
    } else {
      console.log('Settings table already has data, skipping default insertion.');
    }
    
    console.log('Settings table setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up settings table:', error);
    process.exit(1);
  }
};

createSettingsTable();
