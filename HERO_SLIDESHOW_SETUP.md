# Hero Slideshow Setup Guide

## Overview
The hero slideshow feature has been implemented with the following capabilities:
- Dynamic slideshow with configurable slides
- Product linking for each slide
- Admin management interface
- Auto-play functionality
- Responsive design

## Database Migration

To set up the hero slideshow, you need to run the database migration:

### Option 1: Using psql directly
```bash
cd server
psql -d stellarshop -f migrations/hero_slides.sql
```

### Option 2: Using the database connection
If you have access to your database through a GUI tool or other method, run the SQL from `server/migrations/hero_slides.sql`:

```sql
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
```

## Features Implemented

### 1. Hero Slideshow Component
- **Location**: `client/src/components/hero/HeroSlideshow.jsx`
- **Features**:
  - Auto-playing slideshow
  - Manual navigation with arrows and dots
  - Product information display on bottom right
  - Click to navigate to linked product
  - Responsive design

### 2. Admin Management
- **Location**: Admin Settings → Hero Slideshow tab
- **Features**:
  - Global title and description settings
  - Enable/disable slideshow
  - Auto-play controls
  - Individual slide management (add, edit, delete)
  - Product linking for each slide
  - Image upload functionality

### 3. API Endpoints
- **GET** `/api/hero-slides` - Public slides (active only)
- **GET** `/api/hero-slides/admin` - Admin slides (all)
- **POST** `/api/hero-slides` - Create new slide
- **PUT** `/api/hero-slides/:id` - Update slide
- **DELETE** `/api/hero-slides/:id` - Delete slide

### 4. Quick View Modal
- **Status**: Already positioned relative to viewport (fixed positioning)
- **Features**: Centered modal that works with any page content

## Usage Instructions

### For Admins:
1. Go to Admin Panel → Settings → Hero Slideshow
2. Configure global settings (title, description, auto-play)
3. Add slides using the "Add New Slide" button
4. Upload images and link to products
5. Set sort order and active status
6. Save settings

### For Users:
1. The slideshow appears on the homepage
2. Slides auto-play by default
3. Users can manually navigate with arrows/dots
4. Clicking a slide navigates to the linked product
5. Product info appears on bottom right of each slide

## File Structure

```
client/src/
├── components/
│   ├── hero/
│   │   ├── HeroSlideshow.jsx (new)
│   │   └── Hero.jsx (original)
│   └── admin/
│       └── HeroSlideUpload.jsx (new)
├── pages/
│   ├── HomePage.jsx (updated to use HeroSlideshow)
│   └── admin/
│       └── Settings.jsx (updated with hero tab)

server/
├── routes/
│   └── hero-slides.js (new)
├── migrations/
│   └── hero_slides.sql (new)
└── index.js (updated with hero routes)
```

## Configuration Options

### Global Settings:
- **Title**: Main slideshow title
- **Description**: Main slideshow description
- **Enable Slideshow**: Toggle slideshow on/off
- **Auto-play**: Enable/disable automatic slide transitions
- **Auto-play Speed**: Transition interval in milliseconds

### Per Slide Settings:
- **Image**: Slide background image
- **Title**: Individual slide title
- **Description**: Individual slide description
- **Product Link**: Optional link to a specific product
- **Sort Order**: Display order (lower numbers first)
- **Active Status**: Show/hide individual slides

## Troubleshooting

### If slides don't appear:
1. Check if the database migration was run successfully
2. Verify that slides are marked as active in admin settings
3. Check browser console for any JavaScript errors

### If images don't upload:
1. Ensure the `/uploads/hero/` directory exists
2. Check file permissions on the uploads directory
3. Verify image file format (jpeg, jpg, png, gif, webp)

### If product links don't work:
1. Ensure the referenced products exist in the database
2. Check that product IDs are correctly set in slide settings

## Notes

- The original `Hero.jsx` component is still available but not used by default
- The slideshow gracefully falls back to static content if no slides are configured
- All images are stored in `/uploads/hero/` directory
- The feature is fully responsive and works on mobile devices
