import { Language } from '@/stores/languageStore';
import en from './en';
import ko from './ko';

const translations = {
  en,
  ko,
} as const;

export type TranslationKey = keyof typeof en;

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] ?? translations.en[key] ?? key;
}

export function t(language: Language, key: TranslationKey): string {
  return getTranslation(language, key);
}

export { en, ko };
