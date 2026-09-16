# ULAB - Multilingual Support

## Overview

ULAB supports **6 languages** with full translation coverage:

| Language | Code | Direction |
|----------|------|-----------|
| Arabic | `ar` | RTL (Right-to-Left) |
| English | `en` | LTR (Left-to-Right) |
| Spanish | `es` | LTR (Left-to-Right) |
| French | `fr` | LTR (Left-to-Right) |
| Korean | `ko` | LTR (Left-to-Right) |
| Chinese (Simplified) | `zh` | LTR (Left-to-Right) |

## Features

### Automatic Language Detection
- Detects browser language on first visit
- Supports all 6 languages automatically
- Falls back to Arabic if language not supported

### Persistent Language Choice
- Language preference saved in localStorage
- Maintains choice across sessions
- Can be changed anytime via language switcher

### Dynamic Layout Switching
- Automatic RTL/LTR layout adjustment
- Proper text alignment for each language
- Icon positioning adapts to language direction
- Smooth transitions between languages

### Language Switcher
- Dropdown menu in navigation bar
- Shows language name in native script
- One-click language change

## Translation Coverage

### Landing Page (100%)
- Navigation menu
- Hero section
- Features section
- Statistics
- How it works
- Advantages
- Architecture
- Roadmap
- Call to action
- Footer

### Workspace (In Progress)
- File tree labels
- Panel titles
- Button labels
- Modal content
- Tooltips

## Technical Implementation

### File Structure
```
src/
├── i18n/
│   ├── translations.ts          # All translations (150+ keys × 6 languages)
│   └── LanguageContext.tsx       # React context for language state
├── components/
│   └── LanguageSwitcher.tsx     # Language selector component
└── pages/
    └── Landing.tsx              # Uses translation system
```

### Usage Example

```typescript
import { useLanguage } from '../i18n/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('hero.title1')}</h1>
      <p>{t('features.context.desc')}</p>
      
      <button onClick={() => setLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### Adding a New Translation

1. Add key to `Translation` interface in `translations.ts`:
```typescript
export interface Translation {
  // ... existing keys
  'newSection.newKey': string;
}
```

2. Add translations for all 6 languages:
```typescript
export const translations: Record<Language, Translation> = {
  ar: { 'newSection.newKey': 'النص العربي' },
  en: { 'newSection.newKey': 'English text' },
  es: { 'newSection.newKey': 'Texto en español' },
  fr: { 'newSection.newKey': 'Texte en français' },
  ko: { 'newSection.newKey': '한국어 텍스트' },
  zh: { 'newSection.newKey': '中文文本' },
};
```

3. Use in component:
```typescript
const { t } = useLanguage();
<h1>{t('newSection.newKey')}</h1>
```

## RTL Support

Arabic is the only RTL language. The system automatically:
- Switches `dir` attribute on `<html>` element
- Adjusts text alignment
- Mirrors layout when needed
- Repositions icons appropriately

## Browser Support

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

All modern browsers with ES6+ support.

## Performance

- **Bundle Size**: +23KB (translations for 6 languages)
- **Load Time**: No impact (loaded with main bundle)
- **Runtime**: Minimal (context lookup)
- **Memory**: Negligible (translation strings cached)

## Accessibility

- Proper `lang` attribute on `<html>`
- Dynamic `dir` attribute (rtl/ltr)
- Semantic HTML maintained
- Screen reader friendly
- Keyboard navigation support

## Testing Checklist

- [ ] Switch between all 6 languages
- [ ] Verify RTL layout for Arabic
- [ ] Verify LTR layout for other languages
- [ ] Check language persistence after refresh
- [ ] Test language detection from browser
- [ ] Verify all sections are translated
- [ ] Check mobile responsiveness in all languages
- [ ] Test with screen reader
- [ ] Verify Korean characters display correctly
- [ ] Verify Chinese characters display correctly

## Future Enhancements

### Phase 1: Complete Workspace Translation
- Translate all workspace components
- Add tooltips translations
- Translate modal content
- Translate error messages

### Phase 2: Additional Languages
- German
- Japanese
- Portuguese
- Russian
- Turkish
- Italian
- Dutch
- Polish

### Phase 3: Advanced Features
- RTL-aware animations
- Language-specific date formats
- Number formatting
- Pluralization rules
- Dynamic content translation

## Contributing Translations

We welcome translation contributions! To contribute:

1. Fork the repository
2. Copy `translations.ts` to your language
3. Translate all keys
4. Test in both RTL and LTR contexts
6. Submit a pull request

### Translation Guidelines
- Maintain technical accuracy
- Keep UI strings concise
- Preserve meaning over literal translation
- Test in the actual UI
- Use native speakers when possible

## Known Limitations

1. **Workspace Not Fully Translated**: Only landing page is complete
2. **No Dynamic Content Translation**: AI responses remain in original language
3. **No Translation Memory**: Each session starts fresh
4. **No User-Generated Content Translation**: Project names, etc. stay as-is

## Resources

- [React Internationalization](https://reactjs.org/docs/context.html)
- [RTL CSS Best Practices](https://rtlcss.com/)
- [Unicode CLDR](https://cldr.unicode.org/) - Locale data
- [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) - Language codes

## Support

For translation issues or questions:
- Open an issue on GitHub
- Tag with `i18n` label
- Provide language and context

---

**Last Updated**: 2025-01-XX  
**Status**: Landing page complete (6 languages)  
**Languages**: Arabic, English, Spanish, French, Korean, Chinese  
**Coverage**: 100% of landing page, workspace in progress
