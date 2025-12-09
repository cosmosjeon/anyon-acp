import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { api } from '../lib/api';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await api.getSetting(THEME_STORAGE_KEY);

        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
          setThemeState(savedTheme as ThemeMode);
          applyTheme(savedTheme as ThemeMode);
        } else {
          // Default to dark theme
          setThemeState('dark');
          applyTheme('dark');
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((themeMode: ThemeMode) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('theme-dark', 'theme-light');

    // Add new theme class
    root.classList.add(`theme-${themeMode}`);

    // Update color-scheme for browser UI
    root.style.colorScheme = themeMode === 'light' ? 'light' : 'dark';
  }, []);

  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    try {
      setIsLoading(true);

      // Apply theme immediately
      setThemeState(newTheme);
      applyTheme(newTheme);

      // Save to storage
      await api.saveSetting(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  }, [theme, setTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
