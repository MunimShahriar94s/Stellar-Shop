# StellarShop - Online Store

StellarShop is a modern, full-stack e-commerce platform built with React, Node.js, and PostgreSQL. It features robust user authentication, product management, shopping cart functionality, and an administrative dashboard.

## Features

### Shopping Experience
- Product catalog with categories and search
- Shopping cart with persistent items across sessions
- Guest cart support and automatic merging after login
- Responsive design for all devices

### Authentication and Security
- Multiple login options: local email/password, Google OAuth
- Email verification for new accounts
- Secure authentication using JWT tokens and token blacklisting
- Passwords securely hashed with bcrypt

### Administration
- Product management: add, edit, and delete products
- Order management: view and manage customer orders
- User management: monitor registrations
- Product image upload and management
- Real-time updates for admin dashboard

### Security
- CSRF protection
- SQL injection prevention with parameterized queries
- XSS protection through input sanitization
- Secure cookies (HttpOnly, Secure)

## Technology Stack

### Frontend
- React 18
- Styled Components
- React Router
- Context API

### Backend
- Node.js
- Express.js
- PostgreSQL
- Passport.js
- JWT
- Multer
- Nodemailer

### Authentication
- Local strategy (email/password)
- Google OAuth 2.0
- Email verification system

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MunimShahriar94s/StellarShop.git
   cd StellarShop
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Database Setup**
   ```bash
   createdb stellarshop
   psql -d stellarshop -f server/queries.sql
   ```

4. **Environment Configuration**
   Create a `.env` file in the `server/` directory with the following variables:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stellarshop
   DB_USER=your_username
   DB_PASSWORD=your_password

   # Auth
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-random-session-secret

   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   DEVELOPER_EMAIL=admin@stellarshop.com

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Server
   PORT=3000
   NODE_ENV=development

   # Stripe (server side secret)
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

   Create a `.env.local` (or `.env`) file in the `client/` directory for frontend-only variables:
   ```env
   # Backend origin (optional if using Vite proxy in dev)
   VITE_BACKEND_ORIGIN=http://localhost:3000

   # Stripe (publishable key, client side)
   VITE_PUBLISHABLE_KEY=pk_test_xxx
   ```

5. **OAuth Setup**
   - For Google OAuth, create credentials in the Google Cloud Console and set the redirect URI to `http://localhost:3000/auth/google/callback`.

6. **Create Admin User**
   ```bash
   node server/scripts/makeAdmin.js
   ```

## Running the Application

- **Development Mode**
  ```bash
  npm run dev
  ```
  - Backend: http://localhost:3000
  - Frontend: http://localhost:5173

- **Production Mode**
  ```bash
  npm run build
  npm start
  ```

## Project Structure

```
StellarShop/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── assets/         # Static assets
│   │   └── utils/          # Utility functions
│   └── public/             # Public assets
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   ├── scripts/            # Database scripts
│   └── public/             # Static files
├── server/public/images/   # Uploaded images
└── README.md               # Project documentation
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/check` - Check authentication status
- `GET /auth/google` - Google OAuth
 

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /admin/api/products` - Create product (admin)
- `PUT /admin/api/products/:id` - Update product (admin)
- `DELETE /admin/api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/merge` - Merge guest cart with user cart

### Admin
- `GET /admin/api/products` - Get all products (admin)
- `POST /admin/upload` - Upload product image (admin)
- `GET /admin/api/orders` - Get all orders (admin)

## Shopping Cart Features

- Guest users can add items to the cart, which persists using cookies
- Cart is automatically merged with the user account upon login
- Real-time updates for cart contents

## Security Features

- JWT-based authentication and token blacklisting
- Secure cookies (HttpOnly, Secure)
- Password hashing with bcrypt
- SQL injection, XSS, and CSRF protection
- Input validation and sanitization

## Email Features

- Email verification for new users
- Resend verification email functionality
- Developer notifications for new registrations
- Professional HTML email templates

## User Interface and Experience

- Responsive design for mobile, tablet, and desktop
- Clean and minimalist user interface
- Smooth navigation and transitions
- Professional admin dashboard with real-time updates

## Deployment

- Set all required environment variables in production
- Use a production PostgreSQL database and configure backups
- Configure file storage for uploads (e.g., AWS S3, Google Cloud Storage)
- Use a CDN for static assets if needed

## Contributing

We welcome contributions from the community. To contribute:

1. Fork the repository and clone your fork.
2. Install dependencies and set up your environment as described above.
3. Create a new branch for your feature or bugfix.
4. Make your changes, following the code style and commenting guidelines.
5. Test your changes thoroughly.
6. Commit with a clear, descriptive message.
7. Push to your fork and open a pull request.

### Development Guidelines
- Follow the existing code style and structure.
- Use clear, descriptive commit messages.
- Add comments for complex logic.
- Test your changes on different browsers if applicable.
- Update documentation as needed.

### Areas for Contribution
- Bug fixes and issue resolution
- New features and enhancements
- Documentation improvements
- UI/UX improvements
- Backend optimizations

### Issue Reporting
If you encounter a bug or have a feature request, please check the existing issues first. If your issue is not listed, open a new issue with a clear title and detailed description, including steps to reproduce, environment details, and any relevant logs or screenshots.

### Pull Requests
When submitting a pull request, please fill out the provided template and ensure your code passes all checks. Your contribution will be reviewed and merged if it meets the project standards.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The React and Express.js communities
- PostgreSQL for the database
- All contributors and users of this project

---

Made by the StellarShop Team 