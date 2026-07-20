import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './useAuthStore';

const useWeddingStore = create((set, get) => ({
  profile: null,
  tasks: [],
  budgets: null,
  expenses: [],
  vendors: [],
  guests: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set({ loading: true, error: null });
    try {
      // Fetch Tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      if (tasksError) throw tasksError;

      // Fetch Budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (budgetsError && budgetsError.code !== 'PGRST116') throw budgetsError;

      // Fetch Expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (expensesError) throw expensesError;

      // Fetch Vendors
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id);
      if (vendorsError) throw vendorsError;

      // Fetch Guests
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', user.id);
      if (guestsError) throw guestsError;

      // Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      // Handle the case where profile might not exist yet
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      set({ 
        profile: profile || null,
        tasks: tasks || [], 
        budgets: budgets || null, 
        expenses: expenses || [], 
        vendors: vendors || [], 
        guests: guests || [] 
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // --- PROFILE ---
  updateProfile: async (profileData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const existing = get().profile;
      let data, error;
      
      if (existing) {
        ({ data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from('profiles')
          .insert([{ id: user.id, ...profileData }])
          .select()
          .single());
      }
      
      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Error updating profile:', error.message);
    }
  },

  // --- TASKS ---
  addTask: async (taskData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ tasks: [...state.tasks, data] }));
    } catch (error) {
      console.error('Error adding task:', error.message);
    }
  },

  updateTaskStatus: async (taskId, isCompleted) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId);
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t)
      }));
    } catch (error) {
      console.error('Error updating task:', error.message);
    }
  },

  deleteTask: async (taskId) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  },

  // --- BUDGET & EXPENSES ---
  updateBudget: async (totalFund) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const existing = get().budgets;
      let data, error;
      if (existing) {
        ({ data, error } = await supabase
          .from('budgets')
          .update({ total_fund: totalFund })
          .eq('id', existing.id)
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from('budgets')
          .insert([{ user_id: user.id, total_fund: totalFund }])
          .select()
          .single());
      }
      if (error) throw error;
      set({ budgets: data });
    } catch (error) {
      console.error('Error updating budget:', error.message);
    }
  },

  addExpense: async (expenseData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expenseData, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ expenses: [...state.expenses, data] }));
    } catch (error) {
      console.error('Error adding expense:', error.message);
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      set((state) => ({ expenses: state.expenses.filter(e => e.id !== expenseId) }));
    } catch (error) {
      console.error('Error deleting expense:', error.message);
    }
  },

  // --- VENDORS ---
  addVendor: async (vendorData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([{ ...vendorData, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ vendors: [...state.vendors, data] }));
    } catch (error) {
      console.error('Error adding vendor:', error.message);
    }
  },

  deleteVendor: async (vendorId) => {
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
      if (error) throw error;
      set((state) => ({ vendors: state.vendors.filter(v => v.id !== vendorId) }));
    } catch (error) {
      console.error('Error deleting vendor:', error.message);
    }
  },

  // --- GUESTS ---
  addGuest: async (guestData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{ ...guestData, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ guests: [...state.guests, data] }));
    } catch (error) {
      console.error('Error adding guest:', error.message);
    }
  },

  updateGuestStatus: async (guestId, status) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ status: status })
        .eq('id', guestId);
      if (error) throw error;
      set((state) => ({
        guests: state.guests.map(g => g.id === guestId ? { ...g, status } : g)
      }));
    } catch (error) {
      console.error('Error updating guest:', error.message);
    }
  },

  deleteGuest: async (guestId) => {
    try {
      const { error } = await supabase.from('guests').delete().eq('id', guestId);
      if (error) throw error;
      set((state) => ({ guests: state.guests.filter(g => g.id !== guestId) }));
    } catch (error) {
      console.error('Error deleting guest:', error.message);
    }
  }

}));

export default useWeddingStore;
