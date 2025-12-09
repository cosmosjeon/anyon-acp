import { useCallback } from 'react';
import { useLanguageStore, Language } from '@/stores/languageStore';
import { t, TranslationKey } from '@/lib/i18n';

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();

  const translate = useCallback(
    (key: TranslationKey): string => {
      return t(language, key);
    },
    [language]
  );

  return {
    t: translate,
    language,
    setLanguage,
  };
}

export type { Language, TranslationKey };
