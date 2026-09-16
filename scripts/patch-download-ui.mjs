import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const landing = path.join(root, 'src/pages/Landing.tsx');
let page = fs.readFileSync(landing, 'utf8');
page = page.replaceAll("/downloads/ULAB-Windows.zip", "/downloads/ULAB-Setup.exe");
page = page.replaceAll('download="ULAB-Windows.zip"', 'download="ULAB-Setup.exe"');
fs.writeFileSync(landing, page);
const file = path.join(root, 'src/i18n/translations.ts');
let text = fs.readFileSync(file, 'utf8');
const values = {
  ar: ['تحميل ULAB', 'تحميل ULAB لنظام Windows', 'تحميل التطبيق'],
  en: ['Download ULAB', 'Download ULAB for Windows', 'Download the App'],
  es: ['Descargar ULAB', 'Descargar ULAB para Windows', 'Descargar la aplicación'],
  fr: ['Télécharger ULAB', 'Télécharger ULAB pour Windows', "Télécharger l’application"],
  ko: ['ULAB 다운로드', 'Windows용 ULAB 다운로드', '앱 다운로드'],
  zh: ['下载 ULAB', '下载 Windows 版 ULAB', '下载应用'],
};
for (const [lang, [nav, hero, cta]] of Object.entries(values)) {
  const start = text.indexOf(`  ${lang}: {`);
  const end = text.indexOf('\n  },', start);
  if (start < 0 || end < 0) throw new Error(`Language block missing: ${lang}`);
  let block = text.slice(start, end);
  if (!block.includes("'nav.download':")) block = block.replace(/(    'nav\.launch':[^\n]+\n)/, `$1    'nav.download': '${nav}',\n`);
  if (!block.includes("'hero.download':")) block = block.replace(/(    'hero\.cta':[^\n]+\n)/, `$1    'hero.download': '${hero}',\n`);
  if (!block.includes("'cta.download':")) block = block.replace(/(    'cta\.button':[^\n]+\n)/, `$1    'cta.download': '${cta}',\n`);
  text = text.slice(0, start) + block + text.slice(end);
}
fs.writeFileSync(file, text);
console.log('DOWNLOAD_UI_PATCHED=PASS');
