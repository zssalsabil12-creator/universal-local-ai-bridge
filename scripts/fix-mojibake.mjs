// One-off repair: reverse UTF-8-read-as-cp1252 mojibake in the two affected UI files.
import fs from 'node:fs';

// cp1252 high bytes (0x80-0x9F) -> unicode
const CP1252 = new Map([
  [0x80, 0x20AC], [0x82, 0x201A], [0x83, 0x0192], [0x84, 0x201E], [0x85, 0x2026],
  [0x86, 0x2020], [0x87, 0x2021], [0x88, 0x02C6], [0x89, 0x2030], [0x8A, 0x0160],
  [0x8B, 0x2039], [0x8C, 0x0152], [0x8E, 0x017D], [0x91, 0x2018], [0x92, 0x2019],
  [0x93, 0x201C], [0x94, 0x201D], [0x95, 0x2022], [0x96, 0x2013], [0x97, 0x2014],
  [0x98, 0x02DC], [0x99, 0x2122], [0x9A, 0x0161], [0x9B, 0x203A], [0x9C, 0x0153],
  [0x9E, 0x017E], [0x9F, 0x0178],
]);

// Reverse map: unicode char (as produced by mis-decoding a byte as cp1252) -> original byte.
const REVERSE = new Map([...CP1252.entries()].map(([byte, uni]) => [uni, byte]));

function fixMojibake(s) {
  // Only repair sequences that actually contain mojibake markers.
  if (!/[\u00C0-\u00FF]/.test(s)) return s;
  const bytes = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (REVERSE.has(cp)) {
      bytes.push(REVERSE.get(cp)); // cp1252-special char -> its original byte
    } else if (cp <= 0xFF) {
      bytes.push(cp); // latin1 passthrough
    } else {
      return s; // genuine unicode (emoji etc.) — abort repair for this run
    }
  }
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return s; // not valid UTF-8 when reinterpreted — leave untouched
  }
  return decoded;
}

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|mjs|js|css|html|json|md)$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

let repairedFiles = 0;
let repairedStrings = 0;
for (const file of walk('src', [])) {
  const original = fs.readFileSync(file, 'utf8');
  const fixed = original.replace(/[^\x00-\x7F\u0600-\u06FF][^\x00-\x7F]*/gu, (m) => {
    const out = fixMojibake(m);
    if (out !== m) repairedStrings++;
    return out;
  });
  if (fixed !== original) {
    fs.writeFileSync(file, fixed, 'utf8');
    repairedFiles++;
    console.log(`REPAIRED: ${file}`);
  }
}
console.log(`Done. Files repaired: ${repairedFiles}, sequences repaired: ${repairedStrings}`);
