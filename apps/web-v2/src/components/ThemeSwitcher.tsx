import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dim' | 'dark';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light');

  const applyTheme = useCallback((newTheme: Theme) => {
    // Remove all theme classes
    document.body.classList.remove('light', 'dim', 'dark');
    // Add the new theme class
    document.body.classList.add(newTheme);
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  }, []);

  useEffect(() => {
    // Load saved theme from localStorage or default to 'light'
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [applyTheme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dim:border-gray-600 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dim:text-gray-100 dark:text-white">
          Theme
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dim')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme === 'dim'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Dim
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
