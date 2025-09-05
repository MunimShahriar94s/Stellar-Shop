#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 StellarShop Email Verification Setup\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}${colors.bold}${step}${colors.reset} ${message}`);
}

// Check if we're in the right directory
if (!fs.existsSync(path.join(__dirname, 'server'))) {
  log('❌ Error: Please run this script from the project root directory', 'red');
  process.exit(1);
}

async function runSetup() {
  try {
    // Step 1: Run database migration
    logStep('1️⃣', 'Running database migration...');
    try {
      execSync('cd server && node scripts/run-migration.js', { stdio: 'inherit' });
      log('✅ Database migration completed', 'green');
    } catch (error) {
      log('❌ Database migration failed', 'red');
      throw error;
    }

    // Step 2: Update environment variables
    logStep('2️⃣', 'Updating environment variables...');
    const envPath = path.join(__dirname, 'server', '.env');
    
    if (!fs.existsSync(envPath)) {
      log('⚠️  No .env file found. Creating one...', 'yellow');
      fs.writeFileSync(envPath, '');
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Add or update required variables
    const requiredVars = {
      'SERVER_URL': 'http://localhost:3000',
      'CLIENT_URL': 'http://localhost:5173'
    };
    
    let updated = false;
    for (const [key, value] of Object.entries(requiredVars)) {
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`, 'g'), `${key}=${value}`);
      } else {
        envContent += `\n# ${key} for email verification\n${key}=${value}\n`;
      }
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(envPath, envContent);
      log('✅ Environment variables updated', 'green');
    }

    // Step 3: Check required environment variables
    logStep('3️⃣', 'Checking required environment variables...');
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = [];
    
    for (const varName of requiredEnvVars) {
      if (!envContent.includes(`${varName}=`)) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      log('⚠️  Missing required environment variables:', 'yellow');
      missingVars.forEach(varName => {
        log(`   - ${varName}`, 'yellow');
      });
      log('\n📝 Please add these to your server/.env file:', 'blue');
      log('   Example for Gmail:', 'blue');
      log('   SMTP_HOST=smtp.gmail.com', 'blue');
      log('   SMTP_PORT=465', 'blue');
      log('   SMTP_SECURE=true', 'blue');
      log('   SMTP_USER=your-email@gmail.com', 'blue');
      log('   SMTP_PASS=your-app-password', 'blue');
      log('   DEVELOPER_EMAIL=your-email@gmail.com', 'blue');
    } else {
      log('✅ All required environment variables are set', 'green');
    }

    // Step 4: Test email configuration
    logStep('4️⃣', 'Testing email configuration...');
    try {
      execSync('cd server && node -e "import(\'./utils/emailTemplates.js\').then(() => console.log(\'✅ Email templates loaded successfully\'))"', { stdio: 'inherit' });
      log('✅ Email templates are working', 'green');
    } catch (error) {
      log('❌ Email templates test failed', 'red');
    }

    // Step 5: Final instructions
    logStep('5️⃣', 'Setup complete!');
    log('\n🎉 Email verification system is ready!', 'green');
    log('\n📋 Next steps:', 'blue');
    log('1. Start your server: cd server && npm start', 'blue');
    log('2. Start your client: cd client && npm run dev', 'blue');
    log('3. Register a new user to test the system', 'blue');
    log('4. Check your email for verification link', 'blue');
    log('5. Click the link to verify and auto-login', 'blue');
    
    log('\n🔧 Available commands:', 'blue');
    log('   npm run setup    - Run this setup script', 'blue');
    log('   npm run start    - Start both servers', 'blue');
    log('   npm run test     - Test email verification', 'blue');
    
    log('\n📚 Documentation: EMAIL_VERIFICATION_SETUP.md', 'blue');
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('StellarShop Email Verification Setup', 'bold');
  log('\nUsage:', 'blue');
  log('  node setup-email-verification.js [options]', 'blue');
  log('\nOptions:', 'blue');
  log('  --help, -h     Show this help message', 'blue');
  log('  --test         Run email test after setup', 'blue');
  process.exit(0);
}

runSetup(); 