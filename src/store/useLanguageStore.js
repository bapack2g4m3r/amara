import { create } from 'zustand';
import { translations } from '../locales/translations';

// Initialize with saved language or default to 'id'
const savedLang = localStorage.getItem('app_language') || 'id';

const useLanguageStore = create((set, get) => ({
  language: savedLang,
  setLanguage: (lang) => {
    localStorage.setItem('app_language', lang);
    set({ language: lang });
  },
  t: (key, params = {}) => {
    const { language } = get();
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    
    // Replace placeholders e.g., {category}
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }
}));

export const useTranslation = () => {
  const t = useLanguageStore((state) => state.t);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  
  return { t, language, setLanguage };
};

export default useLanguageStore;
