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
  customCategories: [],
  loading: false,
  error: null,

  // Initialize customCategories from localStorage on boot
  initCustomCategories: () => {
    try {
      const saved = localStorage.getItem('amara_custom_categories');
      if (saved) {
        set({ customCategories: JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to parse custom categories');
    }
  },

  addCustomCategory: (categoryName) => {
    set((state) => {
      if (!state.customCategories.includes(categoryName)) {
        const updated = [...state.customCategories, categoryName];
        localStorage.setItem('amara_custom_categories', JSON.stringify(updated));
        return { customCategories: updated };
      }
      return state;
    });
  },

  updateCustomCategories: (updatedCategories) => {
    set({ customCategories: updatedCategories });
    localStorage.setItem('amara_custom_categories', JSON.stringify(updatedCategories));
  },

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

      // Diagnostic check: verify if the new columns actually exist in the DB
      if (expenses && expenses.length > 0 && !('planned_amount' in expenses[0])) {
        console.error("DIAGNOSTIC: Columns 'planned_amount', 'actual_amount', etc. are MISSING from Supabase!");
        alert("PENTING: Sistem mendeteksi bahwa kolom-kolom baru (seperti planned_amount) BELUM TERBUAT di database Supabase Anda. Mohon pastikan Anda telah menjalankan skrip SQL di menu SQL Editor Supabase.");
      }

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
        { title: isId ? 'Menentukan tanggal lamaran dan pernikahan' : 'Determine engagement and wedding dates', priority: 'High' },
        { title: isId ? 'Budgeting' : 'Budgeting', priority: 'High' },
        { title: isId ? 'Membuat wedding moodboard' : 'Create wedding moodboard', priority: 'Medium' },
        { title: isId ? 'Menentukan tema acara' : 'Determine event theme', priority: 'High' },
        { title: isId ? 'First family meeting' : 'First family meeting', priority: 'High' },
        { title: isId ? 'Membuat list vendor' : 'Create vendor list', priority: 'Medium' },
        { title: isId ? 'Datang ke wedding exhibition' : 'Attend wedding exhibition', priority: 'Low' },
        { title: isId ? 'Mengikuti kelas pra-nikah' : 'Attend pre-marital class', priority: 'Medium' },
        { title: isId ? 'Pre-marital check-up' : 'Pre-marital check-up', priority: 'High' }
      ],
      'Lamaran': [
        { title: isId ? 'Booking venue lamaran' : 'Book engagement venue', priority: 'High' },
        { title: isId ? 'Booking dekorasi lamaran' : 'Book engagement decoration', priority: 'High' },
        { title: isId ? 'Booking MC lamaran' : 'Book engagement MC', priority: 'Medium' },
        { title: isId ? 'Beli / sewa attire lamaran' : 'Buy/rent engagement attire', priority: 'High' },
        { title: isId ? 'Membeli bunga' : 'Buy flowers', priority: 'Medium' },
        { title: isId ? 'Membeli cincin lamaran' : 'Buy engagement ring', priority: 'High' },
        { title: isId ? 'Fiksasi vendor lamaran' : 'Finalize engagement vendors', priority: 'High' },
        { title: isId ? 'Lamaran' : 'Engagement Day', priority: 'High' }
      ],
      'Seserahan, Mahar, dan Cincin': [
        { title: isId ? 'Menyicil seserahan' : 'Prepare gifts (Seserahan)', priority: 'Medium' },
        { title: isId ? 'Fiksasi seserahan' : 'Finalize gifts (Seserahan)', priority: 'High' },
        { title: isId ? 'Menyicil mahar' : 'Prepare dowry (Mahar)', priority: 'Medium' },
        { title: isId ? 'Fiksasi mahar' : 'Finalize dowry (Mahar)', priority: 'High' },
        { title: isId ? 'Menghias mahar' : 'Decorate dowry', priority: 'Low' },
        { title: isId ? 'Survey cincin' : 'Survey rings', priority: 'Medium' },
        { title: isId ? 'Fiksasi cincin' : 'Finalize rings', priority: 'High' }
      ],
      'Wedding Organizer': [
        { title: isId ? 'Survey WO' : 'Survey WO', priority: 'Medium' },
        { title: isId ? 'Fiksasi WO' : 'Finalize WO', priority: 'High' },
        { title: isId ? 'Down paid WO' : 'Pay WO down payment', priority: 'High' },
        { title: isId ? 'Menyusun rundown acara' : 'Draft event rundown', priority: 'High' },
        { title: isId ? 'Meeting 1 dengan WO' : 'Meeting 1 with WO', priority: 'Medium' },
        { title: isId ? 'Meeting 2 dengan WO' : 'Meeting 2 with WO', priority: 'Medium' },
        { title: isId ? 'Family meeting dengan WO' : 'Family meeting with WO', priority: 'High' },
        { title: isId ? 'Pelunasan WO' : 'Pay WO final balance', priority: 'High' },
        { title: isId ? 'Gladi resik' : 'Final Rehearsal', priority: 'High' }
      ],
      'Venue': [
        { title: isId ? 'Survey venue' : 'Survey venue', priority: 'Medium' },
        { title: isId ? 'Fiksasi venue' : 'Finalize venue', priority: 'High' },
        { title: isId ? 'Down paid venue' : 'Pay venue down payment', priority: 'High' },
        { title: isId ? 'Visit venue' : 'Visit venue', priority: 'Medium' },
        { title: isId ? 'Membuat layout acara' : 'Create event layout', priority: 'Medium' },
        { title: isId ? 'Pelunasan venue' : 'Pay venue final balance', priority: 'High' }
      ],
      'Administrasi': [
        { title: isId ? 'Fotokopi keperluan dokumen CPP (KTP, KK, dll)' : 'Copy Groom documents (ID, Family Card, etc)', priority: 'Medium' },
        { title: isId ? 'Fotokopi keperluan dokumen CPW (KTP, KK, dll)' : 'Copy Bride documents (ID, Family Card, etc)', priority: 'Medium' },
        { title: isId ? 'Fotokopi KTP orang tua CPP' : 'Copy Groom parents ID', priority: 'Medium' },
        { title: isId ? 'Fotokopi KTP orang tua CPW' : 'Copy Bride parents ID', priority: 'Medium' },
        { title: isId ? 'Vaksin tetanus' : 'Tetanus vaccine', priority: 'High' },
        { title: isId ? 'Surat keterangan sehat' : 'Health certificate', priority: 'High' },
        { title: isId ? 'Surat keterangan belum menikah' : 'Certificate of unmarried status', priority: 'High' },
        { title: isId ? 'Surat pengantar nikah kelurahan setempat' : 'Marriage cover letter from local sub-district', priority: 'High' },
        { title: isId ? 'Pas foto' : 'Passport photos', priority: 'Medium' },
        { title: isId ? 'Pendaftaran ke KUA' : 'Registration at KUA', priority: 'High' }
      ],
      'Catering': [
        { title: isId ? 'Survey catering' : 'Survey catering', priority: 'Medium' },
        { title: isId ? 'Fiksasi catering' : 'Finalize catering', priority: 'High' },
        { title: isId ? 'Test food pertama' : 'First food tasting', priority: 'Medium' },
        { title: isId ? 'Test food final' : 'Final food tasting', priority: 'High' },
        { title: isId ? 'Down paid catering' : 'Pay catering down payment', priority: 'High' },
        { title: isId ? 'Pelunasan catering' : 'Pay catering final balance', priority: 'High' }
      ],
      'Dekorasi': [
        { title: isId ? 'Survey vendor dekorasi' : 'Survey decoration vendors', priority: 'Medium' },
        { title: isId ? 'Fiksasi vendor dekorasi' : 'Finalize decoration vendor', priority: 'High' },
        { title: isId ? 'Down paid dekorasi' : 'Pay decoration down payment', priority: 'High' },
        { title: isId ? 'Meeting dengan dekorasi' : 'Meeting with decoration vendor', priority: 'Medium' },
        { title: isId ? 'Finalisasi konsep dekorasi' : 'Finalize decoration concept', priority: 'High' },
        { title: isId ? 'Pelunasan dekorasi' : 'Pay decoration final balance', priority: 'High' },
        { title: isId ? 'Load in dekorasi di venue' : 'Load in decoration at venue', priority: 'Medium' }
      ],
      'Attire': [
        { title: isId ? 'Survey vendor attire' : 'Survey attire vendors', priority: 'Medium' },
        { title: isId ? 'Fiksasi vendor attire' : 'Finalize attire vendor', priority: 'High' },
        { title: isId ? 'Down paid attire' : 'Pay attire down payment', priority: 'High' },
        { title: isId ? 'Fitting attire 1' : 'Attire fitting 1', priority: 'Medium' },
        { title: isId ? 'Fitting attire 2' : 'Attire fitting 2', priority: 'Medium' },
        { title: isId ? 'Fitting final attire' : 'Final attire fitting', priority: 'High' },
        { title: isId ? 'Pelunasan attire' : 'Pay attire final balance', priority: 'High' }
      ],
      'MUA': [
        { title: isId ? 'Survey MUA' : 'Survey MUA', priority: 'Medium' },
        { title: isId ? 'Fiksasi MUA' : 'Finalize MUA', priority: 'High' },
        { title: isId ? 'Down paid MUA' : 'Pay MUA down payment', priority: 'High' },
        { title: isId ? 'Pelunasan MUA' : 'Pay MUA final balance', priority: 'High' }
      ],
      'Dokumentasi': [
        { title: isId ? 'Survey photographer' : 'Survey photographer', priority: 'Medium' },
        { title: isId ? 'Survey videographer' : 'Survey videographer', priority: 'Medium' },
        { title: isId ? 'Survey live streamer' : 'Survey live streamer', priority: 'Medium' },
        { title: isId ? 'Fiksasi photographer' : 'Finalize photographer', priority: 'High' },
        { title: isId ? 'Fiksasi videographer' : 'Finalize videographer', priority: 'High' },
        { title: isId ? 'Fiksasi live streamer' : 'Finalize live streamer', priority: 'High' },
        { title: isId ? 'Finalisasi konsep dokumentasi' : 'Finalize documentation concept', priority: 'High' },
        { title: isId ? 'Down paid vendor dokumentasi' : 'Pay documentation down payment', priority: 'High' },
        { title: isId ? 'Photoshoot pre-wedding' : 'Pre-wedding photoshoot', priority: 'Medium' },
        { title: isId ? 'Pelunasan vendor dokumentasi' : 'Pay documentation final balance', priority: 'High' }
      ],
      'MC & Entertainment': [
        { title: isId ? 'Survey vendor entertainment' : 'Survey entertainment vendors', priority: 'Medium' },
        { title: isId ? 'Survey MC' : 'Survey MC', priority: 'Medium' },
        { title: isId ? 'Fiksasi vendor entertainment' : 'Finalize entertainment vendor', priority: 'High' },
        { title: isId ? 'Fiksasi MC' : 'Finalize MC', priority: 'High' },
        { title: isId ? 'Down paid vendor entertainment' : 'Pay entertainment down payment', priority: 'High' },
        { title: isId ? 'Down paid MC' : 'Pay MC down payment', priority: 'High' },
        { title: isId ? 'Pelunasan vendor entertainment' : 'Pay entertainment final balance', priority: 'High' },
        { title: isId ? 'Pelunasan MC' : 'Pay MC final balance', priority: 'High' }
      ],
      'Undangan': [
        { title: isId ? 'Survey vendor undangan digital' : 'Survey digital invitation vendors', priority: 'Medium' },
        { title: isId ? 'Survey vendor cetak undangan fisik' : 'Survey physical invitation vendors', priority: 'Medium' },
        { title: isId ? 'Fiksasi vendor undangan digital' : 'Finalize digital invitation vendor', priority: 'High' },
        { title: isId ? 'Fiksasi vendor undangan fisik' : 'Finalize physical invitation vendor', priority: 'High' },
        { title: isId ? 'Finalisasi jumlah tamu regular & VIP' : 'Finalize regular & VIP guest count', priority: 'High' },
        { title: isId ? 'Desain undangan' : 'Invitation design', priority: 'Medium' },
        { title: isId ? 'Bayar vendor undangan' : 'Pay invitation vendor', priority: 'High' },
        { title: isId ? 'Menyebarkan undangan' : 'Distribute invitations', priority: 'High' }
      ],
      'Others': [
        { title: isId ? 'Survey vendor photobooth' : 'Survey photobooth vendor', priority: 'Medium' },
        { title: isId ? 'Fiksasi vendor photobooth' : 'Finalize photobooth vendor', priority: 'High' },
        { title: isId ? 'Bayar vendor photobooth' : 'Pay photobooth vendor', priority: 'High' },
        { title: isId ? 'Menentukan souvenir' : 'Determine souvenirs', priority: 'Medium' },
        { title: isId ? 'Beli souvenir' : 'Buy souvenirs', priority: 'High' },
        { title: isId ? 'Survey destinasi honeymoon' : 'Survey honeymoon destinations', priority: 'Medium' },
        { title: isId ? 'Booking destinasi honeymoon' : 'Book honeymoon destination', priority: 'High' }
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
      // Ensure numeric fields default to 0 if not provided
      const dataToInsert = {
        ...expenseData,
        user_id: user.id,
        planned_amount: expenseData.planned_amount || 0,
        actual_amount: expenseData.actual_amount || 0,
        paid_amount: expenseData.paid_amount || 0,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([dataToInsert])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ expenses: [...state.expenses, data] }));
    } catch (error) {
      console.error('Error adding expense:', error.message);
    }
  },

  updateExpense: async (expenseId, updates) => {
    // Optimistic update for blazing fast UI
    set((state) => ({
      expenses: state.expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e)
    }));

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single();
      if (error) throw error;
      
      // Update with exact data from DB
      set((state) => ({
        expenses: state.expenses.map(e => e.id === expenseId ? data : e)
      }));
    } catch (error) {
      console.error('Error updating expense:', error.message);
      // Revert by fetching fresh data if it fails
      get().fetchDashboardData();
      alert('Gagal menyimpan data ke database. Pastikan RLS Update Policy sudah diaktifkan di Supabase Anda.');
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
        .insert([{ 
          ...vendorData, 
          user_id: user.id 
        }])
        .select()
        .single();
      if (error) throw error;
      set((state) => ({ vendors: [...state.vendors, data] }));
    } catch (error) {
      console.error('Error adding vendor:', error.message);
    }
  },

  updateVendor: async (vendorId, updates) => {
    set((state) => ({
      vendors: state.vendors.map(v => v.id === vendorId ? { ...v, ...updates } : v)
    }));

    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorId)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        vendors: state.vendors.map(v => v.id === vendorId ? data : v)
      }));
    } catch (error) {
      console.error('Error updating vendor:', error.message);
      get().fetchDashboardData();
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

  updateGuest: async (guestId, updates) => {
    set((state) => ({
      guests: state.guests.map(g => g.id === guestId ? { ...g, ...updates } : g)
    }));

    try {
      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', guestId)
        .select()
        .single();
      if (error) throw error;
      
      set((state) => ({
        guests: state.guests.map(g => g.id === guestId ? data : g)
      }));
    } catch (error) {
      console.error('Error updating guest:', error.message);
      get().fetchDashboardData();
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
  },

  resetData: async (force = false) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    if (!force) {
      if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus seluruh data Anda (Tugas, Budget, Pengeluaran, Vendor, Tamu)? Tindakan ini tidak dapat dibatalkan.')) return;
    }

    try {
      // Execute deletions concurrently for speed
      await Promise.all([
        supabase.from('tasks').delete().eq('user_id', user.id),
        supabase.from('expenses').delete().eq('user_id', user.id),
        supabase.from('budgets').delete().eq('user_id', user.id),
        supabase.from('vendors').delete().eq('user_id', user.id),
        supabase.from('guests').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('id', user.id)
      ]);
      
      // Clear onboarding flag so Welcome Modal appears again
      localStorage.removeItem('amara_onboarding_done');

      // Clear local state
      set({
        profile: null,
        tasks: [],
        budgets: null,
        expenses: [],
        vendors: [],
        guests: []
      });
      
      alert(localStorage.getItem('app_language') === 'en' 
        ? 'All data has been reset successfully!' 
        : 'Semua data berhasil dikosongkan!');
      
      // Reload to trigger Welcome Modal
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error.message);
      alert('Gagal mengosongkan data. Pastikan RLS DELETE Policy sudah aktif di Supabase.');
    }
  }

}));

export default useWeddingStore;
