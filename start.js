#!/usr/bin/env node

/**
 * Start ULAB Development Server
 * Quick start script for running ULAB locally
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Universal Local AI Bridge...\n');

// Check if node_modules exists
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installing dependencies...\n');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Start the development server
console.log('🌐 Starting development server...\n');
console.log('📍 The app will be available at: http://localhost:5173\n');
console.log('⏹️  Press Ctrl+C to stop the server\n');

try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  if (error.status === 130) {
    console.log('\n\n👋 Server stopped. Goodbye!\n');
  } else {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}
