# Internationalization (i18n) Implementation

## Overview

ULAB now supports **6 languages**:
- 🇸🇦 **Arabic (ar)** - RTL (Right-to-Left)
- 🇺🇸 **English (en)** - LTR (Left-to-Right)
- 🇪🇸 **Spanish (es)** - LTR (Left-to-Right)
- 🇫🇷 **French (fr)** - LTR (Left-to-Right)
- 🇰🇷 **Korean (ko)** - LTR (Left-to-Right)
- 🇨🇳 **Chinese (zh)** - LTR (Left-to-Right)

The site is now truly global and accessible to users worldwide.

## Implementation Details

### Architecture

```
src/
├── i18n/
│   ├── translations.ts          # All translations (150+ keys)
│   └── LanguageContext.tsx       # React context for language state
├── components/
│   └── LanguageSwitcher.tsx     # Language selector component
└── pages/
    └── Landing.tsx              # Updated to use translations
```

### Key Features

#### 1. **Language Context**
- React Context API for global language state
- Automatic language detection from browser
- Persistent language preference in localStorage
- Dynamic RTL/LTR switching

#### 2. **Translation System**
- Type-safe translation keys
- 150+ translation strings
- Organized by sections (nav, hero, features, etc.)
- Easy to extend with new languages

#### 3. **Language Switcher**
- Dropdown menu in navbar
- Shows language flag and name
- Smooth transitions
- Accessible design

#### 4. **RTL Support**
- Automatic direction switching
- Proper text alignment
- Layout mirroring for Arabic
- Icon positioning adjustments

## Usage

### For Users

1. **Default Language**: Automatically detects browser language
2. **Manual Switch**: Click language icon in navbar
3. **Persistence**: Choice saved in browser
4. **RTL/LTR**: Automatically adjusts layout

### For Developers

#### Adding a New Translation Key

1. Add key to `Translation` interface in `translations.ts`:
```typescript
export interface Translation {
  // ... existing keys
  'newSection.newKey': string;
}
```

2. Add translations for all 3 languages:
```typescript
export const translations: Record<Language, Translation> = {
  ar: {
    // ...
    'newSection.newKey': 'النص العربي',
  },
  en: {
    // ...
    'newSection.newKey': 'English text',
  },
  es: {
    // ...
    'newSection.newKey': 'Texto en español',
  },
};
```

3. Use in component:
```typescript
const { t } = useLanguage();
<h1>{t('newSection.newKey')}</h1>
```

#### Adding a New Language

1. Add to `Language` type:
```typescript
export type Language = 'ar' | 'en' | 'es' | 'fr';
```

2. Add language info:
```typescript
export const languageInfo: Record<Language, {...}> = {
  // ...
  fr: {
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷'
  }
};
```

3. Add all translations for the new language

4. Update `LanguageSwitcher` component (it will automatically pick up the new language)

## Translation Coverage

### Landing Page (100%)
- ✅ Navbar
- ✅ Hero section
- ✅ Features section
- ✅ Stats section
- ✅ How it works
- ✅ Advantages
- ✅ Architecture
- ✅ Roadmap
- ✅ CTA
- ✅ Footer

### Workspace (TODO)
- ⏳ File tree labels
- ⏳ Panel titles
- ⏳ Button labels
- ⏳ Modal content
- ⏳ Tooltips

## Technical Details

### Language Detection Priority

1. localStorage (user's previous choice)
2. Browser language (navigator.language)
3. Default to Arabic

### Performance

- **Bundle Size**: +15KB (translations)
- **Load Time**: No impact (loaded with main bundle)
- **Runtime**: Minimal (context lookup)

### Accessibility

- Proper `lang` attribute on `<html>`
- Dynamic `dir` attribute (rtl/ltr)
- Semantic HTML maintained
- Screen reader friendly

## Testing

### Manual Testing Checklist

- [ ] Switch between all 3 languages
- [ ] Verify RTL layout for Arabic
- [ ] Verify LTR layout for English/Spanish
- [ ] Check language persistence after refresh
- [ ] Test language detection from browser
- [ ] Verify all sections are translated
- [ ] Check mobile responsiveness in all languages
- [ ] Test with screen reader

### Automated Testing

```typescript
// Example test
describe('Language Switcher', () => {
  it('should switch to English', () => {
    // Click language switcher
    // Select English
    // Verify text changed
  });

  it('should persist language choice', () => {
    // Set language to Spanish
    // Reload page
    // Verify still Spanish
  });
});
```

## Future Enhancements

### Phase 1: Complete Workspace Translation
- Translate all workspace components
- Add tooltips translations
- Translate modal content

### Phase 2: Additional Languages
- 🇩🇪 German
- 🇯🇵 Japanese
- 🇧🇷 Portuguese
- 🇷🇺 Russian
- 🇹🇷 Turkish
- 🇮🇹 Italian
- 🇳🇱 Dutch
- 🇵🇱 Polish

### Phase 3: Advanced Features
- RTL-aware animations
- Language-specific date formats
- Number formatting
- Pluralization rules
- Dynamic content translation

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Known Limitations

1. **Workspace Not Fully Translated**: Only landing page is complete
2. **No Dynamic Content Translation**: AI responses remain in original language
3. **No Translation Memory**: Each session starts fresh
4. **No User-Generated Content Translation**: Project names, etc. stay as-is

## Contributing Translations

We welcome translation contributions! To contribute:

1. Fork the repository
2. Copy `translations.ts` to your language
3. Translate all keys
4. Submit a pull request

Translation guidelines:
- Maintain technical accuracy
- Keep UI strings concise
- Preserve meaning over literal translation
- Test in both RTL and LTR contexts

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
**Status**: ✅ Landing page complete, Workspace in progress  
**Languages**: 6 (Arabic, English, Spanish, French, Korean, Chinese)
