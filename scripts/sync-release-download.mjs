import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const releaseDir = path.join(root, 'release');
const publicDir = path.join(root, 'public', 'downloads');
const files = [
  ['ULAB-Setup.exe', 'ULAB-Setup.exe'],
  ['ULAB-v1.0.0-Windows.zip', 'ULAB-Windows.zip'],
];
fs.mkdirSync(publicDir, { recursive: true });
for (const [sourceName, targetName] of files) {
  const source = path.join(releaseDir, sourceName);
  const target = path.join(publicDir, targetName);
  if (!fs.existsSync(source)) throw new Error(`Release artifact not found: ${source}`);
  fs.copyFileSync(source, target);
  console.log(`DOWNLOAD_SYNCED=${target} (${fs.statSync(target).size} bytes)`);
}
