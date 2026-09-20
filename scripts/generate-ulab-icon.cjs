const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  name.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return out;
}
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

function setPixel(data, size, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
}

function insideTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const s = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
  const t = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  const u = (cx - bx) * (py - by) - (cy - by) * (px - by);
  return (s < 0) === (t < 0) && (t < 0) === (u < 0);
}

function fillPolygon(data, size, points, colorA, colorB) {
  const xs = points.map(p => p[0]); const ys = points.map(p => p[1]);
  const minX = Math.max(0, Math.floor(Math.min(...xs) * size));
  const maxX = Math.min(size - 1, Math.ceil(Math.max(...xs) * size));
  const minY = Math.max(0, Math.floor(Math.min(...ys) * size));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(...ys) * size));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let hit = false;
      for (let i = 1; i < points.length - 1; i++) {
        hit ||= insideTriangle(
          x / size, y / size,
          points[0][0], points[0][1],
          points[i][0], points[i][1],
          points[i + 1][0], points[i + 1][1]
        );
      }
      if (!hit) continue;
      const t = (x + y) / (2 * size);
      setPixel(data, size, x, y, lerp(colorA[0], colorB[0], t), lerp(colorA[1], colorB[1], t), lerp(colorA[2], colorB[2], t));
    }
  }
}
function makePng(size) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size);
      setPixel(rgba, size, x, y, lerp(5, 13, t), lerp(7, 16, t), lerp(24, 38, t));
    }
  }

  fillPolygon(rgba, size, [[.22,.17],[.39,.17],[.39,.49],[.53,.54],[.53,.78],[.34,.71],[.22,.62]], [34,211,238], [99,102,241]);
  fillPolygon(rgba, size, [[.47,.79],[.47,.59],[.59,.63],[.59,.34],[.78,.24],[.78,.71],[.65,.83]], [6,182,212], [168,85,247]);

  for (let y = Math.floor(size * .22); y < Math.floor(size * .54); y++) {
    for (let x = Math.floor(size * .43); x < Math.floor(size * .57); x++) {
      if (x < size * .44 || x > size * .55) continue;
      const t = (y / size - .22) / .32;
      setPixel(rgba, size, x, y, 239, 242, 255, Math.round(225 - 25 * t));
    }
  }

  const scanlines = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    scanlines[y * (size * 4 + 1)] = 0;
    rgba.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  return png;
}
const outDir = path.join(__dirname, '..', 'desktop', 'build');
fs.mkdirSync(outDir, { recursive: true });

const sizes = [256, 128, 64, 48, 32, 16];
const images = sizes.map(size => ({ size, png: makePng(size) }));
for (const image of images) fs.writeFileSync(path.join(outDir, `ulab-${image.size}.png`), image.png);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
const entries = Buffer.alloc(images.length * 16);
let offset = 6 + entries.length;
const bodies = [];
images.forEach((image, index) => {
  const e = index * 16;
  entries[e] = image.size === 256 ? 0 : image.size;
  entries[e + 1] = image.size === 256 ? 0 : image.size;
  entries[e + 2] = 0; entries[e + 3] = 0;
  entries.writeUInt16LE(1, e + 4);
  entries.writeUInt16LE(32, e + 6);
  entries.writeUInt32LE(image.png.length, e + 8);
  entries.writeUInt32LE(offset, e + 12);
  bodies.push(image.png);
  offset += image.png.length;
});
fs.writeFileSync(path.join(outDir, 'ulab.ico'), Buffer.concat([header, entries, ...bodies]));
console.log(`Created ULAB icon set in ${outDir}`);
