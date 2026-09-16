#!/usr/bin/env node

/**
 * Create Placeholder PNG Icons
 * 
 * This script creates minimal PNG files as placeholders.
 * These should be replaced with real designed icons before production.
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'extension', 'icons');

// Create a minimal valid PNG (1x1 pixel, purple)
function createMinimalPNG() {
  // PNG signature
  const signature = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);
  
  // IHDR chunk (image header)
  const ihdr = Buffer.from([
    0x00, 0x00, 0x00, 0x0D, // length: 13
    0x49, 0x48, 0x44, 0x52, // type: IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, // bit depth: 8
    0x02, // color type: RGB
    0x00, // compression method
    0x00, // filter method
    0x00, // interlace method
    0x90, 0x77, 0x53, 0xDE  // CRC
  ]);
  
  // IDAT chunk (image data - purple pixel)
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x0C, // length: 12
    0x49, 0x44, 0x41, 0x54, // type: IDAT
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, // compressed data
    0x00, 0x02, 0x00, 0x01, // 
    0x00, 0x05, 0x1E, 0x1D, // CRC
  ]);
  
  // IEND chunk (image end)
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // length: 0
    0x49, 0x45, 0x4E, 0x44, // type: IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder PNGs
const sizes = [16, 48, 128];
const pngData = createMinimalPNG();

sizes.forEach(size => {
  const pngPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(pngPath, pngData);
  console.log(`✅ Created placeholder: ${pngPath}`);
});

console.log('\n✅ Placeholder PNG icons created!');
console.log('\n⚠️  IMPORTANT: These are minimal placeholders.');
console.log('Replace them with real designed icons before production.');
console.log('\nTo convert SVG to PNG, run: node convert-icons.js');
console.log('(requires: npm install sharp)');
