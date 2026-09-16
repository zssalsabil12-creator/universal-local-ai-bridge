#!/usr/bin/env node

/**
 * Icon Converter - Converts SVG icons to PNG format
 * 
 * This script requires the 'sharp' library for image processing.
 * Install it first: npm install sharp
 * 
 * Usage: node convert-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp library not found!');
  console.error('');
  console.error('Please install sharp:');
  console.error('  npm install sharp');
  console.error('');
  console.error('Or use an alternative method to convert SVG to PNG:');
  console.error('  - Use online converter: https://cloudconvert.com/svg-to-png');
  console.error('  - Use ImageMagick: convert icon.svg icon.png');
  console.error('  - Use Inkscape: inkscape icon.svg --export-png=icon.png');
  console.error('');
  console.error('Required sizes: 16x16, 48x48, 128x128');
  process.exit(1);
}

const iconsDir = path.join(__dirname, 'extension', 'icons');
const sizes = [16, 48, 128];

async function convertIcons() {
  console.log('🔄 Converting SVG icons to PNG...\n');

  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon${size}.svg`);
    const pngPath = path.join(iconsDir, `icon${size}.png`);

    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  SVG not found: ${svgPath}`);
      continue;
    }

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      console.log(`✅ Created: ${pngPath} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error converting ${svgPath}:`, error.message);
    }
  }

  console.log('\n✅ Icon conversion complete!');
  console.log('\nNext steps:');
  console.log('1. Update manifest.json to reference PNG files');
  console.log('2. Build the extension');
  console.log('3. Test in Chrome');
}

convertIcons().catch(console.error);
