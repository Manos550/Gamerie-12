import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../lib/store';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gaming-card transition-colors"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-gaming-neon hover:text-gaming-neon-light" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
      )}
    </button>
  );
}