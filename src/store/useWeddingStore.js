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
      'Persiapan Awal': [
        { title: 'Menentukan tanggal lamaran dan pernikahan', priority: 'High' },
        { title: 'Budgeting', priority: 'High' },
        { title: 'Membuat wedding moodboard', priority: 'Medium' },
        { title: 'Menentukan tema acara', priority: 'High' },
        { title: 'First family meeting', priority: 'High' },
        { title: 'Membuat list vendor', priority: 'Medium' },
        { title: 'Datang ke wedding exhibition', priority: 'Low' },
        { title: 'Mengikuti kelas pra-nikah', priority: 'Medium' },
        { title: 'Pre-marital check-up', priority: 'High' }
      ],
      'Lamaran': [
        { title: 'Booking venue lamaran', priority: 'High' },
        { title: 'Booking dekorasi lamaran', priority: 'High' },
        { title: 'Booking MC lamaran', priority: 'Medium' },
        { title: 'Beli / sewa attire lamaran', priority: 'High' },
        { title: 'Membeli bunga', priority: 'Medium' },
        { title: 'Membeli cincin lamaran', priority: 'High' },
        { title: 'Fiksasi vendor lamaran', priority: 'High' },
        { title: 'Lamaran', priority: 'High' }
      ],
      'Seserahan, Mahar, dan Cincin': [
        { title: 'Menyicil seserahan', priority: 'Medium' },
        { title: 'Fiksasi seserahan', priority: 'High' },
        { title: 'Menyicil mahar', priority: 'Medium' },
        { title: 'Fiksasi mahar', priority: 'High' },
        { title: 'Menghias mahar', priority: 'Low' },
        { title: 'Survey cincin', priority: 'Medium' },
        { title: 'Fiksasi cincin', priority: 'High' }
      ],
      'Wedding Organizer': [
        { title: 'Survey WO', priority: 'Medium' },
        { title: 'Fiksasi WO', priority: 'High' },
        { title: 'Down paid WO', priority: 'High' },
        { title: 'Menyusun rundown acara', priority: 'High' },
        { title: 'Meeting 1 dengan WO', priority: 'Medium' },
        { title: 'Meeting 2 dengan WO', priority: 'Medium' },
        { title: 'Family meeting dengan WO', priority: 'High' },
        { title: 'Pelunasan WO', priority: 'High' },
        { title: 'Gladi resik', priority: 'High' }
      ],
      'Venue': [
        { title: 'Survey venue', priority: 'Medium' },
        { title: 'Fiksasi venue', priority: 'High' },
        { title: 'Down paid venue', priority: 'High' },
        { title: 'Visit venue', priority: 'Medium' },
        { title: 'Membuat layout acara', priority: 'Medium' },
        { title: 'Pelunasan venue', priority: 'High' }
      ],
      'Administrasi': [
        { title: 'Fotokopi keperluan dokumen CPP (KTP, KK, dll)', priority: 'Medium' },
        { title: 'Fotokopi keperluan dokumen CPW (KTP, KK, dll)', priority: 'Medium' },
        { title: 'Fotokopi KTP orang tua CPP', priority: 'Medium' },
        { title: 'Fotokopi KTP orang tua CPW', priority: 'Medium' },
        { title: 'Vaksin tetanus', priority: 'High' },
        { title: 'Surat keterangan sehat', priority: 'High' },
        { title: 'Surat keterangan belum menikah', priority: 'High' },
        { title: 'Surat pengantar nikah kelurahan setempat', priority: 'High' },
        { title: 'Pas foto', priority: 'Medium' },
        { title: 'Pendaftaran ke KUA', priority: 'High' }
      ],
      'Catering': [
        { title: 'Survey catering', priority: 'Medium' },
        { title: 'Fiksasi catering', priority: 'High' },
        { title: 'Test food pertama', priority: 'Medium' },
        { title: 'Test food final', priority: 'High' },
        { title: 'Down paid catering', priority: 'High' },
        { title: 'Pelunasan catering', priority: 'High' }
      ],
      'Dekorasi': [
        { title: 'Survey vendor dekorasi', priority: 'Medium' },
        { title: 'Fiksasi vendor dekorasi', priority: 'High' },
        { title: 'Down paid dekorasi', priority: 'High' },
        { title: 'Meeting dengan dekorasi', priority: 'Medium' },
        { title: 'Finalisasi konsep dekorasi', priority: 'High' },
        { title: 'Pelunasan dekorasi', priority: 'High' },
        { title: 'Load in dekorasi di venue', priority: 'Medium' }
      ],
      'Attire': [
        { title: 'Survey vendor attire', priority: 'Medium' },
        { title: 'Fiksasi vendor attire', priority: 'High' },
        { title: 'Down paid attire', priority: 'High' },
        { title: 'Fitting attire 1', priority: 'Medium' },
        { title: 'Fitting attire 2', priority: 'Medium' },
        { title: 'Fitting final attire', priority: 'High' },
        { title: 'Pelunasan attire', priority: 'High' }
      ],
      'MUA': [
        { title: 'Survey MUA', priority: 'Medium' },
        { title: 'Fiksasi MUA', priority: 'High' },
        { title: 'Down paid MUA', priority: 'High' },
        { title: 'Pelunasan MUA', priority: 'High' }
      ],
      'Dokumentasi': [
        { title: 'Survey photographer', priority: 'Medium' },
        { title: 'Survey videographer', priority: 'Medium' },
        { title: 'Survey live streamer', priority: 'Medium' },
        { title: 'Fiksasi photographer', priority: 'High' },
        { title: 'Fiksasi videographer', priority: 'High' },
        { title: 'Fiksasi live streamer', priority: 'High' },
        { title: 'Finalisasi konsep dokumentasi', priority: 'High' },
        { title: 'Down paid vendor dokumentasi', priority: 'High' },
        { title: 'Photoshoot pre-wedding', priority: 'Medium' },
        { title: 'Pelunasan vendor dokumentasi', priority: 'High' }
      ],
      'MC & Entertainment': [
        { title: 'Survey vendor entertainment', priority: 'Medium' },
        { title: 'Survey MC', priority: 'Medium' },
        { title: 'Fiksasi vendor entertainment', priority: 'High' },
        { title: 'Fiksasi MC', priority: 'High' },
        { title: 'Down paid vendor entertainment', priority: 'High' },
        { title: 'Down paid MC', priority: 'High' },
        { title: 'Pelunasan vendor entertainment', priority: 'High' },
        { title: 'Pelunasan MC', priority: 'High' }
      ],
      'Undangan': [
        { title: 'Survey vendor undangan digital', priority: 'Medium' },
        { title: 'Survey vendor cetak undangan fisik', priority: 'Medium' },
        { title: 'Fiksasi vendor undangan digital', priority: 'High' },
        { title: 'Fiksasi vendor undangan fisik', priority: 'High' },
        { title: 'Finalisasi jumlah tamu regular & VIP', priority: 'High' },
        { title: 'Desain undangan', priority: 'Medium' },
        { title: 'Bayar vendor undangan', priority: 'High' },
        { title: 'Menyebarkan undangan', priority: 'High' }
      ],
      'Others': [
        { title: 'Survey vendor photobooth', priority: 'Medium' },
        { title: 'Fiksasi vendor photobooth', priority: 'High' },
        { title: 'Bayar vendor photobooth', priority: 'High' },
        { title: 'Menentukan souvenir', priority: 'Medium' },
        { title: 'Beli souvenir', priority: 'High' },
        { title: 'Survey destinasi honeymoon', priority: 'Medium' },
        { title: 'Booking destinasi honeymoon', priority: 'High' }
      ]
    };

    const templateTasks = templates[category] || [
      { title: isId ? `Tentukan budget untuk ${category}` : `Determine budget for ${category}`, priority: 'High' },
      { title: isId ? `Cari dan bandingkan vendor ${category}` : `Find and compare ${category} vendors`, priority: 'Medium' },
      { title: isId ? `Booking ${category}` : `Book ${category}`, priority: 'High' },
      { title: isId ? `Finalisasi detail dengan vendor ${category}` : `Finalize details with ${category}`, priority: 'Medium' }
    ];

    const newTasks = templateTasks.map(t => {
      return {
        user_id: user.id,
        category: category,
        title: t.title,
        priority: t.priority,
        due_date: null,
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
