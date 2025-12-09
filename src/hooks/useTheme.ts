import { useThemeContext } from '../contexts/ThemeContext';

/**
 * Hook to access and control the theme system
 *
 * @returns {Object} Theme utilities and state
 * @returns {ThemeMode} theme - Current theme mode ('dark' | 'light')
 * @returns {Function} setTheme - Function to change the theme mode
 * @returns {Function} toggleTheme - Function to toggle between dark and light
 * @returns {boolean} isLoading - Whether theme operations are in progress
 *
 * @example
 * const { theme, setTheme, toggleTheme } = useTheme();
 *
 * // Change theme
 * await setTheme('light');
 *
 * // Toggle theme
 * await toggleTheme();
 */
export const useTheme = () => {
  return useThemeContext();
};