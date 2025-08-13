#!/usr/bin/env node

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'server', '.env') });

console.log('🧪 Testing SMTP Configuration...\n');

// Display current configuration (without password)
console.log('📧 Current SMTP Settings:');
console.log(`   Host: ${process.env.SMTP_HOST}`);
console.log(`   Port: ${process.env.SMTP_PORT}`);
console.log(`   Secure: ${process.env.SMTP_SECURE}`);
console.log(`   User: ${process.env.SMTP_USER}`);
console.log(`   Password: ${process.env.SMTP_PASS ? '***SET***' : '❌ MISSING'}\n`);

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test connection
console.log('🔍 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Failed:', error.message);
    console.log('\n💡 Common Solutions:');
    console.log('1. Make sure you\'re using an App Password (not regular password)');
    console.log('2. Enable 2-Factor Authentication on your Google account');
    console.log('3. Generate App Password: Google Account → Security → App passwords');
    console.log('4. Try port 587 with SMTP_SECURE=false');
  } else {
    console.log('✅ SMTP Connection Successful!');
    
    // Send test email
    console.log('\n📤 Sending test email...');
    const testEmail = {
      from: `StellarShop Test <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: '🧪 SMTP Test - StellarShop',
      html: `
        <h2>🎉 SMTP Configuration Test Successful!</h2>
        <p>Your email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><em>This is a test email from your StellarShop application.</em></p>
      `
    };

    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.log('❌ Test Email Failed:', error.message);
      } else {
        console.log('✅ Test Email Sent Successfully!');
        console.log('📧 Check your inbox for the test email.');
        console.log(`   Message ID: ${info.messageId}`);
      }
    });
  }
});


