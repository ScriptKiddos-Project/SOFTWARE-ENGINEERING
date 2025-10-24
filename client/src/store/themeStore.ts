import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update document class
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
        
        console.log('Theme toggled to:', newTheme); // Debug log
        
        set({ theme: newTheme });
      },
      setTheme: (theme) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        
        console.log('Theme set to:', theme); // Debug log
        
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state) {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(state.theme);
          console.log('Theme rehydrated:', state.theme); // Debug log
        }
      },
    }
  )
);