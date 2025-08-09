# 🚀 StellarShop Quick Start Guide

## Email Verification System Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Gmail account (for sending emails)

### 1. Initial Setup

```bash
# Install all dependencies
npm run install:all

# Run the setup script (configures database and environment)
npm run setup
```

### 2. Configure Email Settings

Add these to your `server/.env` file:

```env
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
DEVELOPER_EMAIL=your-email@gmail.com

# URLs
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App passwords
3. Use the generated password as `SMTP_PASS`

### 3. Start the Application

```bash
# Start both server and client
npm run dev

# Or start them separately:
npm run dev:server  # Backend on port 3000
npm run dev:client  # Frontend on port 5173
```

### 4. Test the System

1. **Register a new user** at `http://localhost:5173/signup`
2. **Check your email** for verification link
3. **Click the verification link** - it will work even if React isn't running
4. **Log in automatically** after verification
5. **Start shopping!** 🛍️

## Available Commands

```bash
npm run setup        # Run complete setup
npm run dev          # Start both servers in development
npm run start        # Start both servers in production
npm run migrate      # Run database migration only
npm run test-email   # Test email configuration
npm run build        # Build client for production
```

## Features

✅ **Beautiful Email Templates** - Responsive HTML emails  
✅ **Automatic Login** - Users are logged in after verification  
✅ **Standalone Verification** - Works without React frontend  
✅ **Rate Limiting** - Prevents spam  
✅ **Secure Tokens** - 24-hour expiry  
✅ **Welcome Emails** - Sent after successful verification  

## Troubleshooting

### Emails not sending?
- Check Gmail app password
- Verify SMTP settings in `.env`
- Check spam folder

### Verification links not working?
- Ensure server is running on port 3000
- Check database migration ran successfully
- Verify `SERVER_URL` in `.env`

### Need to manually verify a user?
```sql
UPDATE users SET email_verified = TRUE WHERE email = 'user@example.com';
```

## File Structure

```
├── setup-email-verification.js    # Main setup script
├── server/
│   ├── public/verify-email.html   # Standalone verification page
│   ├── routes/email-verification.js
│   ├── utils/emailTemplates.js
│   └── migrations/email_verification.sql
└── client/
    └── src/pages/EmailVerificationPage.jsx
```

## Support

- 📚 Full documentation: `EMAIL_VERIFICATION_SETUP.md`
- 🐛 Issues: Check server logs for error messages
- 🔧 Configuration: All settings in `server/.env`

---

**Happy Shopping! 🎉** 