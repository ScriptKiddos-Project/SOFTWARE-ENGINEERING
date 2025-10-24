import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Update document class
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(newTheme);
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);