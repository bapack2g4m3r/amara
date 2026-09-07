import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './useAuthStore';

const useWeddingStore = create((set, get) => ({
  profile: null,
  myProfile: null,
  connectedPartner: null,
  userRole: 'owner', // 'owner' | 'editor' | 'viewer'
  targetUserId: null,
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
      // 1. Fetch current user's profile
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Handle the case where profile might not exist yet
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      let targetUserId = user.id;
      let userRole = 'owner';
      let weddingProfile = myProfile || null;
      let connectedPartner = null;

      // Check if current user is an invited partner connected to an owner
      if (myProfile?.wedding_owner_id) {
        targetUserId = myProfile.wedding_owner_id;
        userRole = myProfile.partner_role || 'editor';

        // Fetch owner profile for wedding details
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (ownerProfile) {
          weddingProfile = ownerProfile;
          connectedPartner = ownerProfile;
        }
      } else {
        // Current user is the owner. Check if any partner has linked to this account
        const { data: partnerList } = await supabase
          .from('profiles')
          .select('*')
          .eq('wedding_owner_id', user.id);
        
        if (partnerList && partnerList.length > 0) {
          connectedPartner = partnerList[0];
        }
      }

      // Fetch Tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', targetUserId);
      if (tasksError) throw tasksError;

      // Fetch Budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', targetUserId)
        .single();
      if (budgetsError && budgetsError.code !== 'PGRST116') throw budgetsError;

      // Fetch Expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', targetUserId);
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
        .eq('user_id', targetUserId);
      if (vendorsError) throw vendorsError;

      // Fetch Guests
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', targetUserId);
      if (guestsError) throw guestsError;

      set({ 
        profile: weddingProfile,
        myProfile: myProfile || null,
        connectedPartner: connectedPartner,
        userRole: userRole,
        targetUserId: targetUserId,
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
    const targetUserId = get().targetUserId || user.id;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([{ id: targetUserId, ...profileData }])
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
    const targetUserId = get().targetUserId || user.id;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          user_id: targetUserId,
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
    const targetUserId = get().targetUserId || user.id;
    try {
      const { error } = await supabase.from('tasks').delete().eq('user_id', targetUserId).eq('category', category);
      if (error) throw error;
      set((state) => ({ tasks: state.tasks.filter(t => t.category !== category) }));
    } catch (error) {
      console.error('Error deleting tasks by category:', error.message);
    }
  },

  updateTasksCategory: async (oldCategory, newCategory) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const targetUserId = get().targetUserId || user.id;
    try {
      const { error } = await supabase.from('tasks').update({ category: newCategory }).eq('user_id', targetUserId).eq('category', oldCategory);
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

    const targetUserId = get().targetUserId || user.id;
    const newTasks = templateTasks.map(t => {
      return {
        user_id: targetUserId,
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
    const targetUserId = get().targetUserId || user.id;
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
          .insert([{ user_id: targetUserId, total_fund: totalFund }])
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
    const targetUserId = get().targetUserId || user.id;
    try {
      // Ensure numeric fields default to 0 if not provided
      const dataToInsert = {
        ...expenseData,
        user_id: targetUserId,
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
    const targetUserId = get().targetUserId || user.id;
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([{ 
          ...vendorData, 
          user_id: targetUserId 
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
    const targetUserId = get().targetUserId || user.id;
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{ ...guestData, user_id: targetUserId }])
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

  exportFullBackup: async () => {
    try {
      const user = useAuthStore.getState().user;
      
      // Default to current loaded store state
      let profile = get().profile;
      let budgets = get().budgets;
      let expenses = get().expenses || [];
      let tasks = get().tasks || [];
      let vendors = get().vendors || [];
      let guests = get().guests || [];
      let customCategories = get().customCategories || [];

      // Attempt to fetch latest fresh data from Supabase if user is logged in
      const targetUserId = get().targetUserId || user?.id;
      if (targetUserId) {
        try {
          const [tasksRes, budgetsRes, expensesRes, vendorsRes, guestsRes, profileRes] = await Promise.all([
            supabase.from('tasks').select('*').eq('user_id', targetUserId),
            supabase.from('budgets').select('*').eq('user_id', targetUserId),
            supabase.from('expenses').select('*').eq('user_id', targetUserId),
            supabase.from('vendors').select('*').eq('user_id', targetUserId),
            supabase.from('guests').select('*').eq('user_id', targetUserId),
            supabase.from('profiles').select('*').eq('id', targetUserId)
          ]);

          if (tasksRes.data) tasks = tasksRes.data;
          if (budgetsRes.data && budgetsRes.data.length > 0) budgets = budgetsRes.data[0];
          if (expensesRes.data) expenses = expensesRes.data;
          if (vendorsRes.data) vendors = vendorsRes.data;
          if (guestsRes.data) guests = guestsRes.data;
          if (profileRes.data && profileRes.data.length > 0) profile = profileRes.data[0];
        } catch (dbErr) {
          console.warn('Could not fetch fresh data from Supabase, using active store data instead:', dbErr);
        }
      }

      // Also ensure customCategories from localStorage if available
      try {
        const saved = localStorage.getItem('amara_custom_categories');
        if (saved) customCategories = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse custom categories:', e);
      }

      const couple = profile 
        ? `${profile.partner_1_name || 'Partner 1'} & ${profile.partner_2_name || 'Partner 2'}`
        : 'Amara Couple';

      const backupPayload = {
        app: 'Amara Wedding Dashboard',
        version: '1.0',
        exported_at: new Date().toISOString(),
        couple,
        data: {
          profile: profile || null,
          budgets: budgets || null,
          expenses: expenses || [],
          tasks: tasks || [],
          vendors: vendors || [],
          guests: guests || [],
          customCategories: customCategories || []
        }
      };

      // Trigger download
      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const sanitizedCouple = couple.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      link.href = url;
      link.download = `amara-backup_${sanitizedCouple}_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after short delay so browser handles download
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 200);

      return backupPayload;
    } catch (err) {
      console.error('exportFullBackup error:', err);
      throw err;
    }
  },

  importFullBackup: async (backupPayload, mode = 'replace') => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    if (!backupPayload || !backupPayload.data) {
      throw new Error('Invalid backup data structure');
    }

    const { profile, budgets, expenses = [], tasks = [], vendors = [], guests = [], customCategories = [] } = backupPayload.data;

    set({ loading: true, error: null });

    try {
      if (mode === 'replace') {
        // Delete all existing entities for this user
        await Promise.all([
          supabase.from('tasks').delete().eq('user_id', user.id),
          supabase.from('expenses').delete().eq('user_id', user.id),
          supabase.from('budgets').delete().eq('user_id', user.id),
          supabase.from('vendors').delete().eq('user_id', user.id),
          supabase.from('guests').delete().eq('user_id', user.id)
        ]);
      }

      // 1. Profile
      if (profile) {
        const { id, created_at, ...profileData } = profile;
        await supabase
          .from('profiles')
          .upsert([{ id: user.id, ...profileData, updated_at: new Date().toISOString() }]);
      }

      // 2. Budgets
      if (budgets) {
        const { id, created_at, ...budgetData } = budgets;
        if (mode === 'replace') {
          await supabase.from('budgets').insert([{ ...budgetData, user_id: user.id }]);
        } else {
          const existingBudget = get().budgets;
          if (existingBudget) {
            await supabase.from('budgets').update({ total_fund: budgetData.total_fund }).eq('id', existingBudget.id);
          } else {
            await supabase.from('budgets').insert([{ ...budgetData, user_id: user.id }]);
          }
        }
      }

      // Helper chunk inserter to prevent payload size issues
      const insertChunks = async (table, rows) => {
        if (!rows || rows.length === 0) return;
        const chunkSize = 50;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const { error } = await supabase.from(table).insert(chunk);
          if (error) {
            console.error(`Error inserting into ${table}:`, error);
            throw error;
          }
        }
      };

      // 3. Tasks
      if (tasks && tasks.length > 0) {
        const sanitizedTasks = tasks.map(t => {
          const { id, created_at, ...rest } = t;
          return { ...rest, user_id: user.id };
        });
        await insertChunks('tasks', sanitizedTasks);
      }

      // 4. Vendors
      if (vendors && vendors.length > 0) {
        const sanitizedVendors = vendors.map(v => {
          const { id, created_at, ...rest } = v;
          return { ...rest, user_id: user.id };
        });
        await insertChunks('vendors', sanitizedVendors);
      }

      // 5. Expenses
      if (expenses && expenses.length > 0) {
        const sanitizedExpenses = expenses.map(e => {
          const { id, created_at, ...rest } = e;
          return { ...rest, user_id: user.id };
        });
        await insertChunks('expenses', sanitizedExpenses);
      }

      // 6. Guests
      if (guests && guests.length > 0) {
        const sanitizedGuests = guests.map(g => {
          const { id, created_at, ...rest } = g;
          return { ...rest, user_id: user.id };
        });
        await insertChunks('guests', sanitizedGuests);
      }

      // 7. Custom Categories
      if (customCategories && Array.isArray(customCategories)) {
        if (mode === 'replace') {
          localStorage.setItem('amara_custom_categories', JSON.stringify(customCategories));
          set({ customCategories });
        } else {
          const current = get().customCategories || [];
          const merged = Array.from(new Set([...current, ...customCategories]));
          localStorage.setItem('amara_custom_categories', JSON.stringify(merged));
          set({ customCategories: merged });
        }
      }

      // Re-fetch all data to refresh store
      await get().fetchDashboardData();
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // --- PARTNER COLLABORATION ---
  generateInviteCode: async (role = 'editor') => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not logged in');

    // Generate readable uppercase invite code: AMARA-XXXXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `AMARA-${randomPart}`;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          invite_code: code,
          partner_role: role
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        myProfile: state.myProfile ? { ...state.myProfile, invite_code: code, partner_role: role } : data,
        profile: state.profile ? { ...state.profile, invite_code: code, partner_role: role } : data
      }));

      // Encode portable snapshot for seamless cross-profile / cross-browser mock sharing
      const currentProfile = get().profile;
      const ownerPayload = {
        id: user.id,
        partner_1_name: currentProfile?.partner_1_name || 'Pasangan',
        partner_2_name: currentProfile?.partner_2_name || '',
        wedding_date: currentProfile?.wedding_date || '',
        wedding_location: currentProfile?.wedding_location || '',
        partner_role: role,
        invite_code: code
      };
      
      let encoded = '';
      try {
        encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(ownerPayload)))));
      } catch (e) {
        console.warn('Could not encode invite payload', e);
      }

      const inviteUrl = encoded 
        ? `${window.location.origin}/join?code=${code}&d=${encoded}`
        : `${window.location.origin}/join?code=${code}`;

      return { code, inviteUrl, role };
    } catch (err) {
      console.error('Error generating invite code:', err);
      throw err;
    }
  },

  getInviteInfo: async (inviteCode, fallbackPayload = null) => {
    if (!inviteCode) return { error: 'Kode undangan diperlukan.' };
    try {
      const cleanCode = inviteCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, partner_1_name, partner_2_name, wedding_date, wedding_location, partner_role, invite_code')
        .eq('invite_code', cleanCode);

      if (!error && data && data.length > 0) {
        return { success: true, owner: data[0] };
      }

      // If database returned 0 rows (e.g. running in localStorage mock mode across different Chrome profiles)
      // check if fallbackPayload is available from the URL query parameter '&d=...'
      if (fallbackPayload) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(fallbackPayload)))));
          if (decoded && decoded.invite_code === cleanCode) {
            // Also register into current profile's mock DB if in mock mode so future queries find it!
            try {
              const mockDbStr = localStorage.getItem('amara_mock_db');
              if (mockDbStr) {
                const db = JSON.parse(mockDbStr);
                if (db && db.profiles) {
                  const existingIdx = db.profiles.findIndex(p => p.id === decoded.id);
                  if (existingIdx !== -1) {
                    db.profiles[existingIdx] = { ...db.profiles[existingIdx], ...decoded };
                  } else {
                    db.profiles.push(decoded);
                  }
                  localStorage.setItem('amara_mock_db', JSON.stringify(db));
                }
              }
            } catch (_e) {}

            return { success: true, owner: decoded };
          }
        } catch (decErr) {
          console.warn('Failed to parse fallback payload:', decErr);
        }
      }

      if (error) {
        console.error('Error getting invite info from Supabase:', error);
        return { error: error.message || 'Gagal memeriksa kode undangan.' };
      }

      return { error: 'Undangan tidak ditemukan atau kode sudah kedaluwarsa.' };
    } catch (err) {
      console.error('Error getting invite info:', err);
      return { error: err.message || 'Gagal memeriksa kode undangan.' };
    }
  },

  acceptPartnerInvite: async (inviteCode, fallbackOwner = null, partnerCustomName = '') => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not logged in');

    let owner = fallbackOwner;
    if (!owner) {
      const info = await get().getInviteInfo(inviteCode);
      if (info.error) throw new Error(info.error);
      owner = info.owner;
    }

    if (owner.id === user.id) {
      throw new Error('Anda tidak bisa menerima undangan dari akun Anda sendiri.');
    }

    try {
      const role = owner.partner_role || 'editor';

      // 1. Link current user to owner's wedding (using upsert in case profile row is new)
      const updatePayload = {
        id: user.id,
        wedding_owner_id: owner.id,
        partner_role: role,
        is_collaborating: true
      };
      if (partnerCustomName) {
        updatePayload.partner_name = partnerCustomName;
      }

      const { error: linkErr } = await supabase
        .from('profiles')
        .upsert([updatePayload]);

      if (linkErr) throw linkErr;

      // 2. If partner provided their real name, update the shared wedding profile partner_2_name so it replaces any old default name!
      if (partnerCustomName) {
        try {
          await supabase
            .from('profiles')
            .update({ partner_2_name: partnerCustomName })
            .eq('id', owner.id);
        } catch (_ignored) {}
      }

      // 3. Mark owner profile as collaborating (optional, ignore if blocked by RLS)
      try {
        await supabase
          .from('profiles')
          .update({ is_collaborating: true })
          .eq('id', owner.id);
      } catch (_ignored) {}

      // 4. Mark onboarding as completed so partner never gets prompted with welcome/setup modal
      localStorage.setItem('amara_onboarding_done', 'true');

      // 5. Re-fetch dashboard with owner's data
      await get().fetchDashboardData();
      return { success: true, owner, role };
    } catch (err) {
      console.error('Error accepting partner invite:', err);
      throw err;
    }
  },

  updatePartnerRole: async (newRole) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const partner = get().connectedPartner;
      if (partner) {
        await supabase
          .from('profiles')
          .update({ partner_role: newRole })
          .eq('id', partner.id);

        set((state) => ({
          connectedPartner: state.connectedPartner ? { ...state.connectedPartner, partner_role: newRole } : null
        }));
      }

      await supabase
        .from('profiles')
        .update({ partner_role: newRole })
        .eq('id', user.id);

      set((state) => ({
        myProfile: state.myProfile ? { ...state.myProfile, partner_role: newRole } : null,
        profile: state.profile ? { ...state.profile, partner_role: newRole } : null
      }));
    } catch (err) {
      console.error('Error updating partner role:', err);
      throw err;
    }
  },

  unlinkPartner: async () => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    try {
      const myProfile = get().myProfile;
      const partner = get().connectedPartner;
      let rpcSucceeded = false;

      // 1. Try server RPC function first (atomic, security definer - recommended)
      try {
        const { error: rpcErr } = await supabase.rpc('unlink_wedding_partner');
        if (!rpcErr) {
          rpcSucceeded = true;
        } else {
          console.warn('RPC unlink_wedding_partner failed or not yet deployed, trying direct update fallback:', rpcErr);
        }
      } catch (e) {
        console.warn('RPC unlink exception:', e);
      }

      // 2. Direct table update fallback if RPC didn't succeed
      if (!rpcSucceeded) {
        if (myProfile?.wedding_owner_id) {
          // Partner disconnecting from owner
          const { error: err1 } = await supabase
            .from('profiles')
            .update({
              wedding_owner_id: null,
              partner_role: null,
              is_collaborating: false
            })
            .eq('id', user.id);
          if (err1) console.warn('Direct unlink partner error:', err1);

          try {
            await supabase
              .from('profiles')
              .update({ is_collaborating: false })
              .eq('id', myProfile.wedding_owner_id);
          } catch (_) {}
        } else {
          // Owner disconnecting partner
          if (partner?.id) {
            const { error: errPartner } = await supabase
              .from('profiles')
              .update({
                wedding_owner_id: null,
                partner_role: null,
                is_collaborating: false
              })
              .eq('id', partner.id);
            if (errPartner) console.warn('Direct unlink target partner error:', errPartner);
          }

          const { error: errLinks } = await supabase
            .from('profiles')
            .update({
              wedding_owner_id: null,
              partner_role: null,
              is_collaborating: false
            })
            .eq('wedding_owner_id', user.id);
          if (errLinks) console.warn('Direct unlink owner links error:', errLinks);

          const { error: errSelf } = await supabase
            .from('profiles')
            .update({
              is_collaborating: false,
              invite_code: null
            })
            .eq('id', user.id);
          if (errSelf) console.warn('Direct unlink owner self error:', errSelf);
        }
      }

      // 3. Clear local state immediately
      set({
        connectedPartner: null,
        myProfile: get().myProfile ? {
          ...get().myProfile,
          wedding_owner_id: null,
          is_collaborating: false,
          invite_code: null,
          partner_role: null
        } : null
      });

      // 4. Re-fetch fresh dashboard data
      await get().fetchDashboardData();
      return { success: true };
    } catch (err) {
      console.error('Error unlinking partner:', err);
      throw err;
    }
  },

  resetData: async (force = false) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    if (get().userRole === 'viewer') {
      alert('Akses hanya lihat (Viewer) tidak diizinkan untuk mengosongkan data.');
      return;
    }
    
    if (!force) {
      if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus seluruh data Anda (Tugas, Budget, Pengeluaran, Vendor, Tamu)? Tindakan ini tidak dapat dibatalkan.')) return;
    }

    const targetUserId = get().targetUserId || user.id;

    try {
      // Execute deletions concurrently for speed
      await Promise.all([
        supabase.from('tasks').delete().eq('user_id', targetUserId),
        supabase.from('expenses').delete().eq('user_id', targetUserId),
        supabase.from('budgets').delete().eq('user_id', targetUserId),
        supabase.from('vendors').delete().eq('user_id', targetUserId),
        supabase.from('guests').delete().eq('user_id', targetUserId),
        supabase.from('profiles').delete().eq('id', targetUserId)
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
