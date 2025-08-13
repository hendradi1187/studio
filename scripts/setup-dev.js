#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SPEKTRA Development Environment...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please update the configuration values.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Test database connection
console.log('🔍 Testing database connection...');
const { testConnection } = require('../src/lib/database');

testConnection()
  .then((success) => {
    if (success) {
      console.log('✅ Database connection successful!\n');
      
      console.log('🎉 Setup complete! Next steps:');
      console.log('1. Update your .env file with correct database credentials');
      console.log('2. Run the database schema: psql -d spektra_db -f database/spektra_schema.sql');
      console.log('3. Insert sample data: psql -d spektra_db -f database/sample_data.sql');
      console.log('4. Start the development server: npm run dev\n');
      
      console.log('📖 API Documentation:');
      console.log('- Authentication: POST /api/auth/sign-in');
      console.log('- Users: GET/POST /api/users');
      console.log('- Assets: GET/POST /api/assets');
      console.log('- And more endpoints as documented in the README\n');
    } else {
      console.log('❌ Database connection failed. Please check your configuration.\n');
      console.log('Make sure PostgreSQL is running and .env is configured correctly.');
    }
  })
  .catch((error) => {
    console.log('❌ Setup failed:', error.message);
    console.log('\nPlease ensure:');
    console.log('1. PostgreSQL is installed and running');
    console.log('2. Database credentials in .env are correct');
    console.log('3. Database "spektra_db" exists');
  });