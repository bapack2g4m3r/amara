import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set) => ({
  session: null,
  user: null,
  loading: true,
  isPasswordRecovery: false,
  
  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
      if (event === 'PASSWORD_RECOVERY') {
        set({ isPasswordRecovery: true });
      }
      if (event === 'SIGNED_OUT' || !session) {
        if (typeof window !== 'undefined' && window.__AMARA_CLEAR_WEDDING_STORE__) {
          window.__AMARA_CLEAR_WEDDING_STORE__();
        }
      }
    });

    return () => subscription.unsubscribe();
  },
  
  clearPasswordRecovery: () => set({ isPasswordRecovery: false }),

  signOut: async () => {
    if (typeof window !== 'undefined' && window.__AMARA_CLEAR_WEDDING_STORE__) {
      window.__AMARA_CLEAR_WEDDING_STORE__();
    }
    await supabase.auth.signOut();
  }
}));

export default useAuthStore;
