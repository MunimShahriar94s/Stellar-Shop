import db from '../db.js';

const addHeroSettings = async () => {
  try {
    console.log('Adding hero settings to database...');
    
    // Check if hero settings already exist
    const existingSettings = await db.query(
      'SELECT * FROM settings WHERE category = $1',
      ['hero']
    );
    
    if (existingSettings.rows.length > 0) {
      console.log('Hero settings already exist, skipping...');
      return;
    }
    
    // Insert hero settings
    const heroSettings = [
      {
        category: 'hero',
        key_name: 'slides',
        value: JSON.stringify([
          {
            id: 1,
            title: "Discover <span>Premium</span> Products for Your Lifestyle",
            description: "Explore our curated collection of high-quality products designed to enhance your everyday life. From cutting-edge electronics to stylish home decor, we have everything you need.",
            backgroundImage: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            buttonText: "Shop Now",
            buttonLink: "/products",
            secondaryButtonText: "Learn More",
            secondaryButtonLink: "/about",
            active: true
          },
          {
            id: 2,
            title: "Exclusive Deals & Limited Time Offers",
            description: "Don't miss out on our exclusive deals and limited-time offers. Save big on premium products while supplies last.",
            backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            buttonText: "View Deals",
            buttonLink: "/products",
            secondaryButtonText: "Sign Up",
            secondaryButtonLink: "/signup",
            active: true
          },
          {
            id: 3,
            title: "Free Shipping on Orders Over $100",
            description: "Enjoy free shipping on all orders over $100. Fast, reliable delivery to your doorstep with premium customer service.",
            backgroundImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            buttonText: "Start Shopping",
            buttonLink: "/products",
            secondaryButtonText: "Track Order",
            secondaryButtonLink: "/orders",
            active: true
          }
        ])
      },
      {
        category: 'hero',
        key_name: 'autoPlay',
        value: 'true'
      },
      {
        category: 'hero',
        key_name: 'autoPlaySpeed',
        value: '5000'
      },
      {
        category: 'hero',
        key_name: 'showDots',
        value: 'true'
      },
      {
        category: 'hero',
        key_name: 'showArrows',
        value: 'true'
      }
    ];
    
    for (const setting of heroSettings) {
      await db.query(
        'INSERT INTO settings (category, key_name, value) VALUES ($1, $2, $3) ON CONFLICT (category, key_name) DO NOTHING',
        [setting.category, setting.key_name, setting.value]
      );
    }
    
    console.log('Hero settings added successfully!');
  } catch (error) {
    console.error('Error adding hero settings:', error);
    throw error;
  }
};

// Run the migration
addHeroSettings()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

