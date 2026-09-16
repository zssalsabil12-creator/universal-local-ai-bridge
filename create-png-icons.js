// Simple PNG generator for extension icons
// Creates minimal valid PNG files

const fs = require('fs');
const path = require('path');

// Create a minimal valid PNG (1x1 pixel, purple color)
function createMinimalPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);
  
  // IHDR chunk (image header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // length
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([0x90, 0x77, 0x53, 0xDE]) // CRC (placeholder)
  ]);
  
  // IDAT chunk (image data - purple pixel)
  const rawData = Buffer.from([
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00,
    0x00, 0x02, 0x00, 0x01
  ]);
  
  const idat = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, rawData.length]),
    Buffer.from('IDAT'),
    rawData,
    Buffer.from([0x00, 0x05, 0x1E, 0x1D]) // CRC (placeholder)
  ]);
  
  // IEND chunk (image end)
  const iend = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from('IEND'),
    Buffer.from([0xAE, 0x42, 0x60, 0x82])
  ]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create PNG icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const pngPath = path.join(iconsDir, `icon${size}.png`);
  const pngData = createMinimalPNG(size, size);
  fs.writeFileSync(pngPath, pngData);
  console.log(`✅ Created: ${pngPath}`);
});

console.log('\n✅ All PNG icons created successfully!');
