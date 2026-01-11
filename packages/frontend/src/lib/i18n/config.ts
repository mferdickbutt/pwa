/**
 * i18n Configuration
 *
 * Sets up internationalization with support for English and Traditional Chinese.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../../locales/en.json';
import zhTWTranslations from '../../locales/zh-TW.json';

// Import date-fns locales
import { enUS, zhTW } from 'date-fns/locale';
import type { Locale } from 'date-fns/locale';

// Export date-fns locales for use in components
export const dateFnsLocales = {
  en: enUS,
  'zh-TW': zhTW,
};

// Get the date-fns locale for a given language
export function getDateFnsLocale(lang?: string): Locale {
  const localeKey = (lang || 'en') as keyof typeof dateFnsLocales;
  return dateFnsLocales[localeKey] || enUS;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations.translation,
      },
      'zh-TW': {
        translation: zhTWTranslations.translation,
      },
    },
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'timehut_language',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
