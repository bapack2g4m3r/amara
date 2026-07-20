import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './useAuthStore';

const useWeddingStore = create((set, get) => ({
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
      if (budgetsError && budgetsError.code !== 'PGRST116') throw budgetsError; // Ignore not found initially

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

      set({ 
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

  // Functions for Tasks
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
  }

  // Other CRUD methods (addGuest, addExpense, etc.) can be added similarly
}));

export default useWeddingStore;
