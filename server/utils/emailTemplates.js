import crypto from 'crypto';

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Beautiful email verification template
export const getVerificationEmailTemplate = (userName, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - StellarShop</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        
        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2d3748;
        }
        
        .message {
          font-size: 1.1rem;
          color: #4a5568;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .verification-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff !important;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          margin: 20px 0;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
        }
        
        .verification-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(16, 185, 129, 0.4);
        }
        
        .info-box {
          background: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 30px 0;
          border-radius: 8px;
        }
        
        .info-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
        }
        
        .info-text {
          color: #4a5568;
          font-size: 0.95rem;
        }
        
        .footer {
          background: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
          color: #718096;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }
        
        .social-links {
          margin-top: 20px;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 10px;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .expiry-notice {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #c53030;
          font-size: 0.9rem;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 15px;
          }
          
          .header, .content, .footer {
            padding: 20px;
          }
          
          .logo {
            font-size: 2rem;
          }
          
          .greeting {
            font-size: 1.3rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">⭐ StellarShop</div>
          <div class="subtitle">Your Premium Shopping Destination</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${userName}! 👋</div>
          
          <div class="message">
            Welcome to StellarShop! We're excited to have you join our community of premium shoppers. 
            To get started and unlock all the amazing features, please verify your email address.
          </div>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="verification-button">
              ✨ Verify My Email
            </a>
          </div>
          
          <div class="info-box">
            <div class="info-title">🎉 What happens after verification?</div>
            <div class="info-text">
              • Access to exclusive member-only deals<br>
              • Faster checkout process<br>
              • Order tracking and history<br>
              • Personalized recommendations<br>
              • Priority customer support
            </div>
          </div>
          
                  <div class="expiry-notice">
          ⏰ <strong>Important:</strong> This verification link will expire in 60 minutes for security reasons.
        </div>
          
          <div class="message">
            If the button above doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            If you didn't create an account with StellarShop, you can safely ignore this email.
          </div>
          
          <div class="social-links">
            <a href="#" class="social-link">Help Center</a>
            <a href="#" class="social-link">Contact Support</a>
            <a href="#" class="social-link">Privacy Policy</a>
          </div>
          
          <div style="margin-top: 20px; color: #a0aec0; font-size: 0.8rem;">
            © ${new Date().getFullYear()} StellarShop. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Welcome email template (sent after verification)
export const getWelcomeEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to StellarShop!</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        
        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .success-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #2d3748;
          text-align: center;
        }
        
        .message {
          font-size: 1.1rem;
          color: #4a5568;
          margin-bottom: 30px;
          line-height: 1.7;
          text-align: center;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          margin: 20px 0;
          box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
          transition: all 0.3s ease;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(72, 187, 120, 0.4);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .feature-card {
          background: #f7fafc;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .feature-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .feature-desc {
          color: #4a5568;
          font-size: 0.9rem;
        }
        
        .footer {
          background: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
          color: #718096;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 15px;
          }
          
          .header, .content, .footer {
            padding: 20px;
          }
          
          .logo {
            font-size: 2rem;
          }
          
          .greeting {
            font-size: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">⭐ StellarShop</div>
          <div class="success-icon">🎉</div>
          <div style="font-size: 1.2rem; opacity: 0.9;">Email Verified Successfully!</div>
        </div>
        
        <div class="content">
          <div class="greeting">Welcome to StellarShop, ${userName}! 🚀</div>
          
          <div class="message">
            Your email has been successfully verified! You now have full access to all the amazing features 
            and exclusive deals that StellarShop has to offer.
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta-button">
              🛍️ Start Shopping Now
            </a>
          </div>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🔥</div>
              <div class="feature-title">Exclusive Deals</div>
              <div class="feature-desc">Access to member-only discounts and early access to sales</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <div class="feature-title">Fast Checkout</div>
              <div class="feature-desc">Save your details for lightning-fast purchases</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <div class="feature-title">Order Tracking</div>
              <div class="feature-desc">Real-time updates on your order status</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <div class="feature-title">Smart Recommendations</div>
              <div class="feature-desc">Personalized product suggestions just for you</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            Thank you for choosing StellarShop! We're excited to provide you with an amazing shopping experience.
          </div>
          
          <div style="margin-top: 20px; color: #a0aec0; font-size: 0.8rem;">
            © ${new Date().getFullYear()} StellarShop. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}; 

import { getThemeSettings } from './theme.js';

const buildAssetUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const base = process.env.PUBLIC_ASSET_URL || process.env.SERVER_URL || 'http://localhost:3000';
  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}${normalized}`;
};

export const getOrderPlacedTemplate = async ({ userName, orderId, total, address, phone, items }) => {
  const { storeName, primaryColor, secondaryColor } = await getThemeSettings();
  const itemsRows = (items || [])
    .map(it => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #1f2937">${it.title}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1f2937;text-align:center">x${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1f2937;text-align:right">$${Number(it.price || 0).toFixed(2)}</td>
      </tr>`)
    .join('');
  return `
  <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:680px;margin:auto;background:#0b0b0b;color:#f3f4f6;border:1px solid #1f2937;border-radius:12px;overflow:hidden">
    <div style="background:${primaryColor};padding:18px 22px">
      <div style="font-size:1.2rem;font-weight:700;color:#fff">${storeName}</div>
      <div style="color:#fff;opacity:.85">Order Confirmation</div>
    </div>
    <div style="padding:22px">
      <h2 style="margin:0 0 8px;color:#fff">Thanks, ${userName || 'there'}! 🎉</h2>
      <div style="opacity:.85;margin-bottom:14px">Your order <strong>#${orderId}</strong> was placed successfully.</div>
      <div style="background:#111827;border:1px solid #374151;border-radius:10px;padding:14px 16px;margin:14px 0">
        <div><strong>Ship to:</strong> ${address || 'N/A'}</div>
        <div><strong>Phone:</strong> ${phone || 'N/A'}</div>
      </div>
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#0f1115;border:1px solid #1f2937;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:${secondaryColor};color:#fff">
            <th style="text-align:left;padding:10px 12px">Item</th>
            <th style="text-align:center;padding:10px 12px">Qty</th>
            <th style="text-align:right;padding:10px 12px">Price</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div style="border-top:1px solid #1f2937;margin:10px 0 8px"></div>
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#0f1115">
        <tr>
          <td style="padding:8px 12px;opacity:.9">Subtotal</td>
          <td style="padding:8px 12px;text-align:right"><strong>$${Number(((items||[]).reduce((s,i)=>s+(Number(i.price||0)*Number(i.quantity||0)),0))||0).toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;opacity:.9">Shipping</td>
          <td style="padding:8px 12px;text-align:right"><strong>${((items||[]).reduce((s,i)=>s+(Number(i.price||0)*Number(i.quantity||0)),0))>100?'Free':`$${(10).toFixed(2)}`}</strong></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;opacity:.9">Tax</td>
          <td style="padding:8px 12px;text-align:right"><strong>$${Number((((items||[]).reduce((s,i)=>s+(Number(i.price||0)*Number(i.quantity||0)),0))*0.07)||0).toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-top:1px solid #1f2937">Total</td>
          <td style="padding:10px 12px;border-top:1px solid #1f2937;text-align:right"><strong>$${Number(total||0).toFixed(2)}</strong></td>
        </tr>
      </table>
      <div style="font-size:12px;color:#9ca3af;margin-top:16px">Questions? Reply to this email.</div>
    </div>
  </div>`;
};

export const getOrderStatusTemplate = async ({ userName, orderId, status, items, total }) => {
  const { storeName, primaryColor, secondaryColor } = await getThemeSettings();
  const title = status === 'processing' ? 'Approved' : status === 'cancelled' ? 'Cancelled' : 'Updated';
  const itemsRows = (items || [])
    .map(it => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #1f2937">${it.title}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1f2937;text-align:center">x${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1f2937;text-align:right">$${Number(it.price || 0).toFixed(2)}</td>
      </tr>`)
    .join('');
  return `
  <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:680px;margin:auto;background:#0b0b0b;color:#f3f4f6;border:1px solid #1f2937;border-radius:12px;overflow:hidden">
    <div style="background:${primaryColor};padding:18px 22px">
      <div style="font-size:1.2rem;font-weight:700;color:#fff">${storeName}</div>
      <div style="color:#fff;opacity:.85">Order #${orderId} ${title}</div>
    </div>
    <div style="padding:22px">
      <p style="margin:0 0 12px;opacity:.9">Hi ${userName || 'there'}, your order status is now <strong>${status}</strong>.</p>
      ${items && items.length ? `
      <table style="width:100%;border-collapse:collapse;background:#0f1115;border:1px solid #1f2937;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:${secondaryColor};color:#fff">
            <th style="text-align:left;padding:10px 12px">Item</th>
            <th style="text-align:center;padding:10px 12px">Qty</th>
            <th style="text-align:right;padding:10px 12px">Price</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div style="border-top:1px solid #1f2937;margin:10px 0 8px"></div>
      <div style="margin-top:0;text-align:right;opacity:.95">
        <div style="margin:4px 0">Subtotal: $${Number(((items||[]).reduce((s,i)=>s+(Number(i.price||0)*Number(i.quantity||0)),0))||0).toFixed(2)}</div>
        <div style="margin:4px 0">Shipping: ${((items||[]).reduce((s,i)=>s+(Number(i.price||0)*Number(i.quantity||0)),0))>100?'Free':`$${(10).toFixed(2)}`}</div>
        <div style="margin:4px 0">Tax: $${Number((((items||[]).reduce((s,i)=>s+(Number(i.price||0)*Number(i.quantity||0)),0))*0.07)||0).toFixed(2)}</div>
        <div style="margin:8px 0 0"><strong>Total:</strong> $${Number(total || 0).toFixed(2)}</div>
      </div>
      `: ''}
    </div>
  </div>`;
};