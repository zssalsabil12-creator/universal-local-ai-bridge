const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const website = path.join(root, 'website');
const indexFile = path.join(website, 'index.html');
const distIndexFile = path.join(website, 'dist', 'index.html');
const releaseDownloadUrl = 'https://github.com/zssalsabil12-creator/universal-local-ai-bridge/releases/download/v3.10.4/ULAB-Setup-3.10.4-Windows-x64.exe';

const indexHtml = fs.readFileSync(indexFile, 'utf8');
const landingSource = fs.readFileSync(path.join(website, 'src', 'pages', 'Landing.tsx'), 'utf8');
const downloadComponent = fs.readFileSync(path.join(website, 'src', 'components', 'DownloadSection.tsx'), 'utf8');

if (!landingSource.includes(releaseDownloadUrl)) throw new Error('LANDING_RELEASE_DOWNLOAD_MISSING');
if (!downloadComponent.includes(releaseDownloadUrl)) throw new Error('DOWNLOAD_COMPONENT_RELEASE_MISSING');
if (!landingSource.includes('AdContainer')) throw new Error('AD_SPACE_SUPPORT_MISSING');

for (const bad of ['â€”', 'Â·', 'â†', 'Ã', 'Â']) {
  if (indexHtml.includes(bad)) throw new Error('MOJIBAKE_' + bad);
}

if (fs.existsSync(distIndexFile)) {
  const distFiles = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else distFiles.push(full);
    }
  };
  walk(path.join(website, 'dist'));
  const distText = distFiles.filter(file => /\.(html|js|css)$/i.test(file)).map(file => fs.readFileSync(file, 'utf8')).join('\n');
  if (!distText.includes(releaseDownloadUrl)) throw new Error('DIST_RELEASE_DOWNLOAD_MISSING');
}

console.log('WEBSITE_CHECK=PASS');
console.log('RELEASE_DOWNLOAD=v3.10.4');
