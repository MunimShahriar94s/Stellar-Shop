# Email Verification System Setup

This guide will help you set up the email verification system for your StellarShop application.

## Features

- ✅ Beautiful email templates with responsive design
- ✅ Secure token-based verification (24-hour expiry)
- ✅ Rate limiting for resend requests
- ✅ Welcome email after successful verification
- ✅ Frontend verification page with user-friendly UI
- ✅ Integration with existing authentication system

## Database Setup

### 1. Run the Migration

First, run the database migration to add the required columns:

```bash
cd server
node scripts/run-migration.js
```

This will add the following columns to your `users` table:
- `email_verified` (BOOLEAN) - Default: FALSE
- `verification_token` (TEXT) - For storing verification tokens
- `verification_expires` (TIMESTAMP) - Token expiry timestamp

### 2. Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Client URL (for verification links)
CLIENT_URL=http://localhost:5173

# Developer email (for notifications)
DEVELOPER_EMAIL=developer@example.com
```

### 3. Gmail Setup (if using Gmail)

If you're using Gmail as your SMTP provider:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated password as `SMTP_PASS`

## How It Works

### Registration Flow

1. User registers with email and password
2. System creates user with `email_verified = FALSE`
3. Verification email is sent automatically
4. User is redirected to login page with verification message

### Email Verification Flow

1. User clicks verification link in email
2. System validates token and expiry
3. User's email is marked as verified
4. Welcome email is sent
5. User can now log in successfully

### Login Flow

1. User attempts to log in
2. System checks `email_verified` status
3. If not verified, shows error with resend option
4. If verified, login proceeds normally

## API Endpoints

### Email Verification Routes

- `GET /email-verification/verify/:token` - Verify email with token
- `POST /email-verification/resend` - Resend verification email (requires auth)
- `GET /email-verification/status` - Check verification status (requires auth)

### Updated Auth Routes

- `POST /auth/register` - Now sends verification email
- `POST /auth/login` - Now checks email verification status

## Frontend Routes

- `/verify-email` - Email verification page
- Updated `/login` - Shows verification status and resend option
- Updated `/signup` - Shows verification message after registration

## Email Templates

### Verification Email
- Beautiful gradient design
- Clear call-to-action button
- Feature highlights
- Security notice about expiry

### Welcome Email
- Success celebration design
- Feature grid showcasing benefits
- Call-to-action to start shopping

## Testing

### Test the System

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. **Check your email** for the verification link

3. **Click the verification link** or visit:
   ```
   http://localhost:5173/verify-email?token=YOUR_TOKEN
   ```

4. **Try logging in** with the verified account

### Manual Verification (for testing)

If you need to manually verify an email for testing:

```sql
UPDATE users SET email_verified = TRUE WHERE email = 'test@example.com';
```

## Troubleshooting

### Common Issues

1. **Emails not sending:**
   - Check SMTP configuration
   - Verify Gmail app password
   - Check firewall/network settings

2. **Verification links not working:**
   - Ensure `CLIENT_URL` is set correctly
   - Check token expiry (24 hours)
   - Verify database migration ran successfully

3. **Login still blocked after verification:**
   - Clear browser cache
   - Check if user object includes `emailVerified` field
   - Verify database update was successful

### Debug Mode

Add this to your server logs to debug email sending:

```javascript
console.log('SMTP Config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER
});
```

## Security Features

- **Token Expiry:** Verification tokens expire after 24 hours
- **Rate Limiting:** Resend requests are limited to prevent spam
- **Secure Tokens:** 32-byte random hex tokens
- **Database Cleanup:** Expired tokens are automatically ignored

## Customization

### Email Templates

Edit the templates in `server/utils/emailTemplates.js`:
- Colors and styling
- Content and messaging
- Feature highlights
- Branding elements

### Verification Settings

Modify in `server/routes/email-verification.js`:
- Token expiry time (currently 24 hours)
- Rate limiting duration (currently 1 hour)
- Email subject lines
- Verification URL format

## Support

If you encounter any issues:

1. Check the server logs for error messages
2. Verify all environment variables are set
3. Ensure database migration completed successfully
4. Test SMTP configuration with a simple email

The email verification system is now fully integrated and ready to use! 🎉 