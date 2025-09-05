import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { blacklistToken } from '../utils/tokenBlacklist.js';
import nodemailer from 'nodemailer';
import { sendVerificationEmail } from './email-verification.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists with any provider
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      const existingUser = userExists.rows[0];
      if (existingUser.provider === 'local') {
        return res.status(400).json({ message: 'An account with this email already exists' });
      } else {
        // User exists with OAuth - allow them to create a local password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update the existing account to allow local login
        // Keep the original provider (don't change to 'local') - just add the local password and update name
        await db.query(
          'UPDATE users SET password = $1, name = $2 WHERE id = $3',
          [hashedPassword, name || email.split('@')[0], existingUser.id]
        );
        
        // Don't send verification email if user is already verified
        if (!existingUser.email_verified) {
          try {
            const emailSent = await sendVerificationEmail(
              existingUser.id, 
              email, 
              existingUser.name
            );
            
            if (!emailSent) {
              console.error('Failed to send verification email to:', email);
            }
          } catch (verificationErr) {
            console.error('Error sending verification email:', verificationErr);
          }
        }
        
        // If user is already verified, log them in automatically
        if (existingUser.email_verified) {
          // Generate JWT token
          const token = jwt.sign(
            { 
              id: existingUser.id, 
              email: existingUser.email, 
              role: existingUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
          
          // Return success with token for automatic login
          return res.status(200).json({ 
            message: 'Local password created successfully! You are now logged in.',
            token: token,
            user: {
              id: existingUser.id,
              name: name || email.split('@')[0], // Use the updated name
              email: existingUser.email,
              role: existingUser.role,
              picture: existingUser.picture,
              emailVerified: existingUser.email_verified
            }
          });
        } else {
          // User needs email verification
          return res.status(200).json({ 
            message: 'Local password created successfully! Please check your email to verify your account before logging in.'
          });
        }
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, provider, role, email_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, email_verified',
      [name || email.split('@')[0], email, hashedPassword, 'local', 'user', false]
    );
    
    // Send verification email to the new user
    try {
      const emailSent = await sendVerificationEmail(
        newUser.rows[0].id, 
        email, 
        newUser.rows[0].name
      );
      
      if (!emailSent) {
        console.error('Failed to send verification email to:', email);
      }
    } catch (verificationErr) {
      console.error('Error sending verification email:', verificationErr);
    }
    
    // After successful user creation in /register, send an email to the developer
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
      const devEmail = process.env.DEVELOPER_EMAIL;
      const html = `
        <div style=\"background: #f4f6fb; min-height: 100vh; padding: 0; margin: 0;\">
          <table role=\"presentation\" width=\"100%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"min-height: 100vh; width: 100%; border-collapse: collapse;\">
            <tr>
              <td align=\"center\" valign=\"middle\" style=\"height: 100vh; vertical-align: middle;\">
                <div style=\"max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(30,60,90,0.10); padding: 40px 32px 32px 32px; font-family: 'Segoe UI', Arial, sans-serif;\">
                  <div style=\"margin-bottom: 18px;\">
                    <h2 style=\"margin: 0; color: #222; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.01em;\">New User Registration</h2>
                  </div>
                  <p style=\"font-size: 1.08rem; color: #444; margin-bottom: 28px;\">A new user has just registered on <b>StellarShop</b>:</p>
                  <div style=\"background: #f8f9fa; border-radius: 10px; padding: 18px 22px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);\">
                    <table style=\"width: 100%; font-size: 1.04rem; color: #333; border-collapse: collapse;\">
                      <tr><td style=\"padding: 7px 0; font-weight: 600;\">Name:</td><td>${newUser.rows[0].name}</td></tr>
                      <tr><td style=\"padding: 7px 0; font-weight: 600;\">Email:</td><td>${newUser.rows[0].email}</td></tr>
                      <tr><td style=\"padding: 7px 0; font-weight: 600;\">Provider:</td><td>local</td></tr>
                      <tr><td style=\"padding: 7px 0; font-weight: 600;\">Registered At:</td><td>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} (Asia/Dhaka)</td></tr>
                    </table>
                  </div>
                  <div style=\"margin-top: 18px; color: #888; font-size: 0.98rem; text-align: center;\">This is an automated notification for developers.<br>No action is required.</div>
                  <div style=\"margin-top: 32px; text-align: center; color: #bbb; font-size: 0.93rem;\">&copy; ${new Date().getFullYear()} StellarShop</div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `;
      await transporter.sendMail({
        from: `StellarShop <${process.env.SMTP_USER}>`,
        to: devEmail,
        subject: 'New User Registration - StellarShop',
        html
      });
    } catch (mailErr) {
      console.error('Failed to send developer registration email:', mailErr);
      console.error('SMTP config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        devEmail: process.env.DEVELOPER_EMAIL
      });
    }
    
    res.status(201).json({
      success: true,
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with local strategy
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // Generate JWT token

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
          emailVerified: user.email_verified || false
        },
        token: token,
        isAdmin: user.role === 'admin'
      });
    });
  })(req, res, next);
});

// Google OAuth routes
router.all('/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback: send developer email if new user
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Store token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    // If user is new (req.user._isNewGoogleUser), send developer email
    if (req.user && req.user._isNewGoogleUser) {
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
        const devEmail = process.env.DEVELOPER_EMAIL;
        const html = `
          <div style=\"background: #f4f6fb; min-height: 100vh; padding: 0; margin: 0;\">
            <table role=\"presentation\" width=\"100%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"min-height: 100vh; width: 100%; border-collapse: collapse;\">
              <tr>
                <td align=\"center\" valign=\"middle\" style=\"height: 100vh; vertical-align: middle;\">
                  <div style=\"max-width: 480px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(30,60,90,0.10); padding: 40px 32px 32px 32px; font-family: 'Segoe UI', Arial, sans-serif;\">
                    <div style=\"margin-bottom: 18px;\">
                      <h2 style=\"margin: 0; color: #222; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.01em;\">New User Registration</h2>
                    </div>
                    <p style=\"font-size: 1.08rem; color: #444; margin-bottom: 28px;\">A new user has just registered on <b>StellarShop</b>:</p>
                    <div style=\"background: #f8f9fa; border-radius: 10px; padding: 18px 22px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);\">
                      <table style=\"width: 100%; font-size: 1.04rem; color: #333; border-collapse: collapse;\">
                        <tr><td style=\"padding: 7px 0; font-weight: 600;\">Name:</td><td>${req.user.name}</td></tr>
                        <tr><td style=\"padding: 7px 0; font-weight: 600;\">Email:</td><td>${req.user.email}</td></tr>
                        <tr><td style=\"padding: 7px 0; font-weight: 600;\">Provider:</td><td>google</td></tr>
                        <tr><td style=\"padding: 7px 0; font-weight: 600;\">Registered At:</td><td>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} (Asia/Dhaka)</td></tr>
                      </table>
                    </div>
                    <div style=\"margin-top: 18px; color: #888; font-size: 0.98rem; text-align: center;\">This is an automated notification for developers.<br>No action is required.</div>
                    <div style=\"margin-top: 32px; text-align: center; color: #bbb; font-size: 0.93rem;\">&copy; ${new Date().getFullYear()} StellarShop</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        `;
        await transporter.sendMail({
          from: `StellarShop <${process.env.SMTP_USER}>`,
          to: devEmail,
          subject: 'New User Registration - StellarShop',
          html
        });
      } catch (mailErr) {
        console.error('Failed to send developer registration email (Google):', mailErr);
      }
    }
    
    // If user needs cart merging, add flag to URL
    const mergeCartFlag = req.user._mergeCart ? '&mergeCart=true' : '';
    
    // Redirect to frontend with token in URL for client to store
    res.redirect(`/?login=success&token=${token}${mergeCartFlag}`);
  }
);

// Facebook OAuth removed

// Logout
router.get('/logout', (req, res) => {
  // Clear session if using passport session
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        console.error('Error logging out of session:', err);
      }
    });
  }
  
  // Get token from authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    // Add token to blacklist
    blacklistToken(token);
  }
  
  // Clear JWT cookie
  res.clearCookie('token');
  
  // Clear guest cart cookie to prevent cart persistence after logout
  res.clearCookie('guestCartId', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  
  res.json({ success: true, message: 'Logged out successfully' });
});

// Test profile picture endpoint


// Check if user is authenticated
router.get('/check', (req, res) => {
  // Get token from header, cookie, or query string
  const token = 
    req.headers.authorization?.split(' ')[1] || 
    req.cookies.token || 
    req.query.token;
  
  if (!token) {
    return res.json({ isAuthenticated: false });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database to ensure they still exist
    db.query('SELECT * FROM users WHERE id = $1', [decoded.id])
      .then(result => {
        if (result.rows.length === 0) {
          return res.json({ isAuthenticated: false });
        }
        
        const user = result.rows[0];
        
        return res.json({
          isAuthenticated: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.picture
          },
          isAdmin: user.role === 'admin'
        });
      })
      .catch(err => {
        console.error('Error checking authentication:', err);
        res.json({ isAuthenticated: false });
      });
  } catch (err) {
    console.error('Token verification error:', err);
    res.json({ isAuthenticated: false });
  }
});

export default router;