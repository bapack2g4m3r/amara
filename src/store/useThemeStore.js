import { create } from 'zustand';

const savedTheme = localStorage.getItem('app_theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const useThemeStore = create((set, get) => ({
  theme: savedTheme,
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('app_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: newTheme });
  }
}));

export default useThemeStore;
