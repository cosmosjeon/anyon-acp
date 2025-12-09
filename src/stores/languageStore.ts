import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ko';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko', // 기본값: 한국어
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);
