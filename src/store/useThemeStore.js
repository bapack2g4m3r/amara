import { create } from 'zustand';

// Enforce Light Mode and clean up any previous dark mode setting
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('app_theme');
}

const useThemeStore = create(() => ({
  theme: 'light',
  toggleTheme: () => {}
}));

export default useThemeStore;
