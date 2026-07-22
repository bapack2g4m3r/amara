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
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert([{ id: user.id, ...profileData }])
        .select()
        .single();
      
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
        .insert([{ 
          user_id: user.id,
          category: taskData.category,
          title: taskData.title,
          is_completed: taskData.is_completed || false,
          priority: taskData.priority || 'Medium',
          due_date: taskData.due_date || null
        }])
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
      const { error } = await supabase.from('tasks').update({ is_completed: isCompleted }).eq('id', taskId);
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t)
      }));
    } catch (error) {
      console.error('Error updating task status:', error.message);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? data : t)
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

  deleteTasksByCategory: async (category) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('user_id', user.id).eq('category', category);
      if (error) throw error;
      set((state) => ({ tasks: state.tasks.filter(t => t.category !== category) }));
    } catch (error) {
      console.error('Error deleting tasks by category:', error.message);
    }
  },

  updateTasksCategory: async (oldCategory, newCategory) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { error } = await supabase.from('tasks').update({ category: newCategory }).eq('user_id', user.id).eq('category', oldCategory);
      if (error) throw error;
      set((state) => ({ 
        tasks: state.tasks.map(t => t.category === oldCategory ? { ...t, category: newCategory } : t) 
      }));
    } catch (error) {
      console.error('Error updating tasks category:', error.message);
    }
  },

  generateTemplateTasks: async (category) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const lang = localStorage.getItem('app_language') || 'id';
    const isId = lang === 'id';
    
    // Standard template tasks
    const templates = {
      'Wedding Organizer': [
        { title: isId ? 'Meeting konsep awal' : 'Initial Concept Meeting', priority: 'High', days_offset: 180 },
        { title: isId ? 'Finalisasi rundown' : 'Finalize Rundown', priority: 'High', days_offset: 30 },
        { title: isId ? 'Gladi Bersih' : 'Rehearsal', priority: 'Medium', days_offset: 2 },
      ],
      'Venue': [
        { title: isId ? 'Tentukan kapasitas & budget' : 'Determine capacity and budget', priority: 'High', days_offset: 360 },
        { title: isId ? 'Survey top 3 lokasi' : 'Visit top 3 venue choices', priority: 'Medium', days_offset: 330 },
        { title: isId ? 'Tanda tangan kontrak & DP' : 'Sign contract and pay DP', priority: 'High', days_offset: 300 },
        { title: isId ? 'Technical meeting di lokasi' : 'Technical meeting at venue', priority: 'Medium', days_offset: 30 },
      ],
      'Catering': [
        { title: isId ? 'Tentukan gaya menu' : 'Determine menu style', priority: 'High', days_offset: 200 },
        { title: isId ? 'Test food (Food tasting)' : 'Attend food tasting', priority: 'Medium', days_offset: 150 },
        { title: isId ? 'Finalisasi jumlah pax' : 'Finalize pax count', priority: 'High', days_offset: 30 },
      ],
      'Photography': [
        { title: isId ? 'Booking sesi Pre-wedding' : 'Book Pre-wedding shoot', priority: 'Medium', days_offset: 240 },
        { title: isId ? 'Sesi foto Pre-wedding' : 'Pre-wedding photo session', priority: 'High', days_offset: 180 },
        { title: isId ? 'Kirim moodboard ke fotografer' : 'Provide brief to photographer', priority: 'Medium', days_offset: 60 },
      ],
      'MUA': [
        { title: isId ? 'Booking MUA' : 'Book Makeup Artist', priority: 'High', days_offset: 270 },
        { title: isId ? 'Sesi Trial Makeup' : 'Makeup Trial Session', priority: 'Medium', days_offset: 90 },
      ],
      'Decor & Styling': [
        { title: isId ? 'Diskusi tema & moodboard' : 'Discuss theme and moodboard', priority: 'High', days_offset: 240 },
        { title: isId ? 'Finalisasi desain 3D/mockup' : 'Finalize 3D mockup', priority: 'Medium', days_offset: 120 },
      ],
      'Attire': [
        { title: isId ? 'Fitting pertama gaun pengantin' : 'First fitting for wedding dress', priority: 'High', days_offset: 180 },
        { title: isId ? 'Pesan seragam keluarga' : 'Order family uniforms', priority: 'Medium', days_offset: 150 },
        { title: isId ? 'Fitting gaun terakhir' : 'Final dress fitting', priority: 'High', days_offset: 14 },
      ],
      'Entertainment': [
        { title: isId ? 'Booking Band/DJ' : 'Book band/DJ', priority: 'High', days_offset: 180 },
        { title: isId ? 'Kirim daftar lagu wajib' : 'Submit do-not-play list', priority: 'Low', days_offset: 30 },
      ]
    };

    const templateTasks = templates[category] || [
      { title: isId ? `Tentukan budget untuk ${category}` : `Determine budget for ${category}`, priority: 'High', days_offset: 90 },
      { title: isId ? `Cari dan bandingkan vendor ${category}` : `Find and compare ${category} vendors`, priority: 'Medium', days_offset: 60 },
      { title: isId ? `Booking ${category}` : `Book ${category}`, priority: 'High', days_offset: 45 },
      { title: isId ? `Finalisasi detail dengan vendor ${category}` : `Finalize details with ${category}`, priority: 'Medium', days_offset: 30 }
    ];

    const today = new Date();
    const newTasks = templateTasks.map(t => {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + t.days_offset);
      return {
        user_id: user.id,
        category: category,
        title: t.title,
        priority: t.priority,
        due_date: dueDate.toISOString().split('T')[0],
        is_completed: false
      };
    });

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTasks)
        .select();
      if (error) throw error;
      set((state) => ({ tasks: [...state.tasks, ...data] }));
    } catch (error) {
      console.error('Error generating template tasks:', error.message);
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
