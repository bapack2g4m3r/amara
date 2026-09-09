import { create } from 'zustand';
import { translations } from '../locales/translations';

// Lock application language to Indonesian ('id')
const useLanguageStore = create((set, get) => ({
  language: 'id',
  setLanguage: () => {
    // Single language (Bahasa Indonesia) enforced
    set({ language: 'id' });
  },
  t: (key, params = {}) => {
    let text = translations['id']?.[key] || translations['en']?.[key] || key;
    
    // Replace placeholders e.g., {category}
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }
}));

export const useTranslation = () => {
  const t = useLanguageStore((state) => state.t);
  const language = 'id';
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  
  return { t, language, setLanguage };
};

export default useLanguageStore;
