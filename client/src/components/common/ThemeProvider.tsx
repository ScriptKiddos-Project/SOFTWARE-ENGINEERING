import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Check system preference if not set
    const savedTheme = localStorage.getItem('theme-storage');
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [theme, setTheme]);

  return <>{children}</>;
};