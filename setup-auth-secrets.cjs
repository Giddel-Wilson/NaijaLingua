#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate secure random keys
const jwtSecret = crypto.randomBytes(32).toString('hex');
const authSecret = crypto.randomBytes(32).toString('hex');

console.log('🔐 Generating stable development secrets...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('📁 Found existing .env file');
    
    // Read existing .env
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add JWT_SECRET
    if (envContent.includes('JWT_SECRET=')) {
        console.log('🔄 JWT_SECRET already exists - keeping existing value');
    } else {
        envContent += `\nJWT_SECRET="${jwtSecret}"`;
        console.log('➕ Added JWT_SECRET to .env');
    }
    
    // Update or add AUTH_SECRET  
    if (envContent.includes('AUTH_SECRET=')) {
        console.log('🔄 AUTH_SECRET already exists - keeping existing value');
    } else {
        envContent += `\nAUTH_SECRET="${authSecret}"`;
        console.log('➕ Added AUTH_SECRET to .env');
    }
    
    fs.writeFileSync(envPath, envContent);
} else {
    console.log('📄 Creating new .env file...');
    
    const envTemplate = `# NaijaLingua Environment Configuration
DATABASE_URL="your-database-url-here"

# Authentication secrets (automatically generated)
JWT_SECRET="${jwtSecret}"
AUTH_SECRET="${authSecret}"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY="" 
CLOUDINARY_API_SECRET=""
CLOUDINARY_UPLOAD_PRESET="naijalingua_preset"

# External APIs (optional)
IGBO_API_KEY=""
MAVEN_API_KEY=""
`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file with stable secrets');
}

console.log('\n🎉 Authentication secrets are now configured!');
console.log('💡 This should prevent frequent logouts during development.');
console.log('\n⚠️  Remember to set your DATABASE_URL in the .env file.');
console.log('\n🔒 Keep your .env file secure and never commit it to version control.');