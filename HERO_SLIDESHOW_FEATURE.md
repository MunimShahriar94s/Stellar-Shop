# Hero Slideshow Feature

## Overview
The hero slideshow feature allows administrators to create and manage dynamic hero slides that are displayed on the homepage. Each slide can have custom titles, descriptions, background images, and call-to-action buttons.

## Features

### Dynamic Slides
- **Customizable Content**: Each slide can have a unique title, description, and background image
- **Call-to-Action Buttons**: Primary and secondary buttons with custom text and links
- **Active/Inactive Toggle**: Enable or disable individual slides
- **HTML Support**: Titles support HTML formatting (e.g., `<span>Premium</span>`)

### Slideshow Controls
- **Auto-play**: Automatically cycle through slides
- **Custom Speed**: Adjust auto-play speed (1-10 seconds)
- **Navigation Dots**: Click to jump to specific slides
- **Arrow Navigation**: Previous/next buttons for manual navigation
- **Responsive Design**: Works on all device sizes

### Admin Management
- **Visual Editor**: Intuitive interface for managing slides
- **Real-time Preview**: See slide content and images in the admin panel
- **Bulk Operations**: Add, edit, delete, and reorder slides
- **Settings Control**: Configure slideshow behavior

## Database Schema

The hero slideshow uses the existing `settings` table with a new `hero` category:

```sql
-- Hero settings are stored in the settings table
-- Category: 'hero'
-- Key names: 'slides', 'autoPlay', 'autoPlaySpeed', 'showDots', 'showArrows'
```

## Slide Structure

Each slide object contains:
```javascript
{
  id: number,                    // Unique identifier
  title: string,                 // Slide title (supports HTML)
  description: string,           // Slide description
  backgroundImage: string,       // Background image URL
  buttonText: string,           // Primary button text
  buttonLink: string,           // Primary button link
  secondaryButtonText: string,  // Secondary button text (optional)
  secondaryButtonLink: string,  // Secondary button link (optional)
  active: boolean               // Whether slide is active
}
```

## Usage

### For Users
The hero slideshow automatically appears on the homepage. Users can:
- View slides with smooth transitions
- Click navigation dots to jump to specific slides
- Use arrow buttons for manual navigation
- Click call-to-action buttons to navigate to different pages

### For Administrators
1. Navigate to **Admin Panel > Settings > Hero Slideshow**
2. Configure slideshow behavior (auto-play, speed, navigation)
3. Manage slides using the visual editor:
   - Add new slides with the "+ Add New Slide" button
   - Edit existing slides by clicking "Edit"
   - Toggle slide visibility with "Active/Inactive"
   - Delete slides with the "Delete" button

## Default Slides

The system comes with 3 default slides:
1. **Discover Premium Products** - Main promotional slide
2. **Exclusive Deals** - Sales and offers slide
3. **Free Shipping** - Shipping benefits slide

## Technical Implementation

### Components
- `HeroSlideshow.jsx` - Main slideshow component
- `HeroSlidesManager.jsx` - Admin management interface
- `Hero.jsx` - Updated to use slideshow

### Settings Integration
- Uses the existing SettingsContext for data management
- Integrates with the admin settings panel
- Supports real-time updates

### Responsive Design
- Mobile-optimized navigation
- Adaptive image sizing
- Touch-friendly controls

## Migration

The feature includes a migration script that adds default hero settings to the database:
```bash
cd server
node scripts/add-hero-settings.js
```

## Customization

### Adding Custom Slides
1. Go to Admin Panel > Settings > Hero Slideshow
2. Click "+ Add New Slide"
3. Fill in the slide details:
   - Title (supports HTML)
   - Description
   - Background image URL
   - Button text and links
4. Save the slide

### Styling Customization
The slideshow uses CSS custom properties for theming:
- `--primary-color` - Button and accent colors
- `--primary-hover` - Hover states
- `--shadow-color` - Shadow effects

### Image Requirements
- Recommended size: 1920x1080px or similar 16:9 ratio
- Format: JPG, PNG, or WebP
- File size: Optimize for web (under 500KB recommended)
- Content: High contrast with text overlay areas

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

