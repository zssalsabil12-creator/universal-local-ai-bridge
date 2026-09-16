#!/usr/bin/env node

/**
 * ULAB Extension Icon Generator
 * 
 * This script generates placeholder icons for the Chrome extension.
 * In production, these should be replaced with proper designed icons.
 */

const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG icon (lightning bolt)
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#8b5cf6"/>
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
</svg>`;
};

// Generate PNG from SVG (simplified - in production use proper PNG generation)
// For now, we'll create a simple placeholder
const createPlaceholderPNG = (size) => {
  // This is a minimal valid PNG file (1x1 pixel)
  // In production, use proper image generation
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, // bit depth: 8, color type: 2 (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, // compressed data
    0x00, 0x02, 0x00, 0x01, // E2E1
    0x00, 0x05, 0x1E, 0x1D, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return pngHeader;
};

// Generate icons
const sizes = [16, 48, 128];

sizes.forEach(size => {
  // Save SVG
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, createSVGIcon(size));
  console.log(`✓ Created ${svgPath}`);
  
  // Save PNG placeholder
  const pngPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(pngPath, createPlaceholderPNG(size));
  console.log(`✓ Created ${pngPath}`);
});

console.log('\n✓ All icons created successfully!');
console.log('\nNote: These are placeholder icons. For production, replace with properly designed icons.');
