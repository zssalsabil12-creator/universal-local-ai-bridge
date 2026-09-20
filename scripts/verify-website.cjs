const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const website = path.join(root, 'website');
const releaseUrl = 'https://github.com/zssalsabil12-creator/universal-local-ai-bridge/releases/download/v3.10.1/ULAB-Setup-3.10.1-Windows-x64.exe';
const checksumUrl = releaseUrl + '.sha256';

for (const name of ['index.html', 'download.html']) {
  const file = path.join(website, name);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(releaseUrl)) throw new Error(name + ':RELEASE_DOWNLOAD_LINK_MISSING');
  if (!html.includes(checksumUrl)) throw new Error(name + ':CHECKSUM_LINK_MISSING');
  if (!html.includes('Download ULAB for Windows')) throw new Error(name + ':DOWNLOAD_LABEL_MISSING');
  for (const bad of ['â€”', 'Â·', 'â†', 'Ã', 'Â']) {
    if (html.includes(bad)) throw new Error(name + ':MOJIBAKE_' + bad);
  }
}
console.log('WEBSITE_CHECK=PASS');
console.log('RELEASE_ASSET=' + releaseUrl);
console.log('PAGES=2');