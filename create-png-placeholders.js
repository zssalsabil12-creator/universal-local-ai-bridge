#!/usr/bin/env node

/**
 * Create PNG placeholder icons for Chrome extension
 * 
 * This script creates minimal valid PNG files (1x1 pixel) as placeholders.
 * These should be replaced with real designed icons before production.
 * 
 * Usage: node create-png-placeholders.js
 */

const fs = require('fs');
const path = require('path');

// Minimal valid PNG (1x1 pixel, purple color #8b5cf6)
function createMinimalPNG() {
  return Buffer.from([
    // PNG signature
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    // IHDR chunk (13 bytes)
    0x00, 0x00, 0x00, 0x0D, // length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, // bit depth: 8
    0x02, // color type: RGB
    0x00, // compression: 0
    0x00, // filter: 0
    0x00, // interlace: 0
    0x90, 0x77, 0x53, 0xDE, // CRC
    // IDAT chunk (compressed image data)
    0x00, 0x00, 0x00, 0x0C, // length: 12
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, // compressed data
    0x00, 0x02, 0x00, 0x01,
    0x00, 0x05, 0x1E, 0x1D, // CRC
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // length: 0
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder PNGs
const sizes = [16, 48, 128];
const pngData = createMinimalPNG();

sizes.forEach(size => {
  const pngPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(pngPath, pngData);
  console.log(`✅ Created: ${pngPath}`);
});

console.log('\n✅ All PNG placeholder icons created!');
console.log('\n⚠️  IMPORTANT: These are minimal placeholders (1x1 pixel).');
console.log('Replace them with real designed icons before production.');
console.log('\nTo create proper icons:');
console.log('1. Design icons at 16x16, 48x48, and 128x128 pixels');
console.log('2. Save as PNG format');
console.log('3. Replace the placeholder files in extension/icons/');
