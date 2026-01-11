/**
 * Language Switcher Component
 *
 * Allows users to switch between English and Traditional Chinese.
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLang = i18n.language;
  const isZh = currentLang.startsWith('zh');

  const toggleLanguage = () => {
    const newLang = isZh ? 'en' : 'zh-TW';
    i18n.changeLanguage(newLang);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-1.5 bg-white/80 hover:bg-white border border-warm-200 rounded-xl text-sm font-medium text-warm-700 hover:text-primary-600 transition-all press-feedback"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={t('language.switchTo')}
    >
      <motion.span
        className="text-lg mr-1"
        key={currentLang}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {isZh ? '🇹🇼' : '🇬🇧'}
      </motion.span>
      <span className="text-xs">{t('language.switchTo')}</span>
    </motion.button>
  );
}
