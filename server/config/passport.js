import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db.js';

// Configure passport
export default function configurePassport() {
  console.log('Configuring Passport strategies...');
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        done(null, result.rows[0]);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, null);
    }
  });

  // Local Strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // Find user by email (any provider)
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
          return done(null, false, { message: 'Incorrect email or password' });
        }
        
        const user = result.rows[0];
        
        // If user exists but not with local provider, check if they have a proper local password
        if (user.provider !== 'local') {
          // Check if the password is a placeholder (OAuth users without local password)
          // Placeholder passwords are 64-character hex strings (from crypto.randomBytes(32))
          const isPlaceholderPassword = /^[a-f0-9]{64}$/.test(user.password);
          
          if (isPlaceholderPassword) {
            return done(null, false, { 
              message: `This email is registered with ${user.provider}. Please use that login method or create a local password first.` 
            });
          }
          // If not a placeholder password, it means they created a local password, so allow login
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect email or password' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Google OAuth Strategy
  console.log('Setting up Google OAuth strategy with client ID:', process.env.GOOGLE_CLIENT_ID);
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let picture = null;
      
      // Handle Google profile picture - try to get the best quality version
      if (profile.photos && profile.photos.length > 0) {
        // Google provides different sizes, try to get the best one
        const photo = profile.photos[0];
        picture = photo.value;
        
        // If the URL contains 'sz=' parameter, try to get a larger size
        if (picture && picture.includes('sz=')) {
          // Replace with larger size (96x96 or 192x192)
          picture = picture.replace(/sz=\d+/, 'sz=192');
        }
        
        // Ensure HTTPS for security
        if (picture && picture.startsWith('http:')) {
          picture = picture.replace('http:', 'https:');
        }
        
        // Remove any additional parameters that might cause issues
        if (picture && picture.includes('?')) {
          const baseUrl = picture.split('?')[0];
          const params = new URLSearchParams(picture.split('?')[1]);
          
          // Keep only essential parameters
          const essentialParams = ['sz'];
          const cleanParams = new URLSearchParams();
          
          essentialParams.forEach(param => {
            if (params.has(param)) {
              cleanParams.set(param, params.get(param));
            }
          });
          
          picture = cleanParams.toString() ? `${baseUrl}?${cleanParams.toString()}` : baseUrl;
        }
      }
      
      const name = profile.displayName || email.split('@')[0];
      
      
      
      // Check if user exists with ANY provider using this email
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];
        
        // Update user info if needed
        const updates = [];
        const updateValues = [];
        let paramCount = 1;
        
        if (name !== user.name) {
          updates.push(`name = $${paramCount++}`);
          updateValues.push(name);
        }
        
        if (picture && user.picture !== picture) {
          updates.push(`picture = $${paramCount++}`);
          updateValues.push(picture);
        }
        
        // Always mark as email verified for OAuth
        if (!user.email_verified) {
          updates.push(`email_verified = $${paramCount++}`);
          updateValues.push(true);
        }
        
        // Only update provider if user was initially registered with OAuth (not local)
        // This prevents overwriting local provider when someone who registered locally tries OAuth
        if (user.provider !== 'google' && user.provider !== 'local') {
          updates.push(`provider = $${paramCount++}`);
          updateValues.push('google');
        }
        
        if (updates.length > 0) {
          updateValues.push(user.id);
          await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
            updateValues
          );
          
          // Update the user object with new values
          user.name = name;
          user.picture = picture || user.picture;
          user.email_verified = true;
          user.provider = 'google';
        }
        
        // Mark for cart merging
        user._mergeCart = true;
        return done(null, user);
      }
      
      // Create new user with secure placeholder password (not user-created, so no need for bcrypt)
      const securePlaceholder = crypto.randomBytes(32).toString('hex');
      const hashedPassword = securePlaceholder; // Store as-is since it's already random and secure
      
      const newUser = await pool.query(
        'INSERT INTO users (name, email, password, provider, role, picture, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, email, hashedPassword, 'google', 'user', picture, true]
      );
      
      // Mark as new user and for cart merging
      newUser.rows[0]._isNewGoogleUser = true;
      newUser.rows[0]._mergeCart = true; // Add merge cart flag for new users too
      return done(null, newUser.rows[0]);
    } catch (err) {
      return done(err);
    }
  }));

  // Facebook OAuth removed
}