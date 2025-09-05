import express from 'express';
import nodemailer from 'nodemailer';
import db from '../db.js';
import { generateVerificationToken, getVerificationEmailTemplate, getWelcomeEmailTemplate } from '../utils/emailTemplates.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Send verification email
export const sendVerificationEmail = async (userId, email, userName) => {
  try {
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes from now
    
    // Save token to database
    await db.query(
      'UPDATE users SET verification_token = $1, verification_expires = $2 WHERE id = $3',
      [verificationToken, expiresAt, userId]
    );
    
    // Create verification URL
    const verificationUrl = `${process.env.SERVER_URL || 'http://localhost:3000'}/verify-email.html?token=${verificationToken}`;
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Send verification email
    await transporter.sendMail({
      from: `StellarShop <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - StellarShop',
      html: getVerificationEmailTemplate(userName, verificationUrl)
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS
    });
    return false;
  }
};

// Verify email endpoint
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this token
    const userResult = await db.query(
      'SELECT * FROM users WHERE verification_token = $1 AND verification_expires > NOW()',
      [token]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Mark email as verified and clear token
    await db.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT token for automatic login
    const jwt = (await import('jsonwebtoken')).default;
    const authToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Check for guest cart and merge if needed
    const guestCartId = req.cookies.guestCartId;
    
    if (guestCartId) {
      try {
        // Create a temporary request object with the user info for cart merging
        const tempReq = {
          user: { id: user.id, email: user.email },
          cookies: { guestCartId },
          guestCartId
        };
        
        // Import cart merge logic
        const { mergeGuestCart } = await import('./cart.js');
        await mergeGuestCart(tempReq, res);
      } catch (mergeError) {
        console.error('Email verification - cart merge error:', mergeError);
        // Don't fail verification if cart merge fails
      }
    }
    
    // Set token as cookie for server-side cart operations
    res.cookie('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Send welcome email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      await transporter.sendMail({
        from: `StellarShop <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Welcome to StellarShop! 🎉',
        html: getWelcomeEmailTemplate(user.name)
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully! Welcome to StellarShop!',
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: true
      },
      mergeCart: true // Add merge cart flag
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during email verification' 
    });
  }
});

// Resend verification email
router.post('/resend', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Check if we can resend (rate limiting - prevent spam, 30 min cooldown)
    const lastSentResult = await db.query(
      'SELECT verification_expires FROM users WHERE id = $1 AND verification_expires > NOW() - INTERVAL \'30 minutes\'',
      [userId]
    );
    
    if (lastSentResult.rows.length > 0) {
      return res.status(429).json({ 
        message: 'Please wait before requesting another verification email' 
      });
    }
    
    // Send verification email
    const emailSent = await sendVerificationEmail(user.id, user.email, user.name);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Verification email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification email' 
      });
    }
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while resending verification email' 
    });
  }
});

// Check verification status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await db.query(
      'SELECT email_verified FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      emailVerified: userResult.rows[0].email_verified 
    });
    
  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking verification status' 
    });
  }
});

export default router; 