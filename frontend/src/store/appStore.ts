import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ru';
export type TimeFormat = '12h' | '24h';

interface AppState {
  theme: Theme;
  language: Language;
  timeFormat: TimeFormat;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleTimeFormat: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      timeFormat: '24h',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setLanguage: (lang) => set({ language: lang }),
      toggleTimeFormat: () =>
        set((state) => ({
          timeFormat: state.timeFormat === '24h' ? '12h' : '24h',
        })),
    }),
    {
      name: 'app-storage',
    }
  )
);
