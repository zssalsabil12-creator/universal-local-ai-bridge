import { translations, Language } from './translations';

const languages = Object.keys(translations) as Language[];
const baseKeys = Object.keys(translations.en);
const stalePattern = /Browser Extension|browser extension|Get the Extension|Install the extension|إضافة المتصفح|ثبّت الإضافة|شغّل الوكيل|متجر الإضافة|브라우저 확장|浏览器扩展|扩展程序|Chrome 116|Manifest V3/;
const oldStepPattern = /\b(Four|four|Cuatro|Quatre)\b|4가지|四个/;

if (languages.length !== 6) throw new Error(`Expected 6 languages, found ${languages.length}`);

for (const language of languages) {
  const values = translations[language];
  const keys = Object.keys(values);
  const missing = baseKeys.filter(key => !(key in values));
  const extra = keys.filter(key => !(key in translations.en));
  if (missing.length || extra.length) throw new Error(`${language}: missing=${missing.join(',')} extra=${extra.join(',')}`);

  for (const [key, value] of Object.entries(values)) {
    if (/\uFFFD|\?{3,}/.test(value)) throw new Error(`${language}.${key}: replacement or placeholder characters found`);
  }

  const guardedKeys: (keyof typeof values)[] = ['hero.download','howItWorks.step1.title','cta.download','roadmap.phase1','architecture.local.extension','cta.subtitle'];
  for (const key of guardedKeys) {
    if (stalePattern.test(values[key])) throw new Error(`${language}.${String(key)}: stale extension copy`);
  }
  if (oldStepPattern.test(values['howItWorks.subtitle'])) throw new Error(`${language}.howItWorks.subtitle: legacy four-step copy`);
  if (!values['hero.download'].toLowerCase().includes('windows') && language !== 'zh') throw new Error(`${language}.hero.download: missing Windows target`);
}

if (!Object.values(translations).every(t => t['footer.rights'].includes('2026'))) {
  throw new Error('Footer copyright year must be current');
}

console.log('Translation integrity tests: PASS');