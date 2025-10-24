import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};