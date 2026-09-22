import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isMockMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

let realSupabase = null;
if (!isMockMode) {
  realSupabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not provided or contain placeholder values. Running in localStorage mock mode.');
}

// LocalStorage Mock Database Helpers
const getLocalStorageDb = () => {
  try {
    const db = localStorage.getItem('amara_mock_db');
    return db ? JSON.parse(db) : {
      users: [],
      tasks: [],
      budgets: [],
      expenses: [],
      vendors: [],
      guests: [],
      profiles: [],
      access_codes: [],
      seserahan: [],
      savings: [],
      budget_plans: []
    };
  } catch (_e) {
    return { users: [], tasks: [], budgets: [], expenses: [], vendors: [], guests: [], profiles: [], access_codes: [], seserahan: [], savings: [], budget_plans: [] };
  }
};

const saveLocalStorageDb = (db) => {
  localStorage.setItem('amara_mock_db', JSON.stringify(db));
};

const authStateListeners = new Set();
const triggerAuthStateChange = (event, session) => {
  authStateListeners.forEach(listener => listener(event, session));
};

class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.operation = 'select'; // select, insert, update, upsert, delete
    this.dataToInsertOrUpdate = null;
    this.isSingle = false;
  }

  select(_columns) {
    // Only set to select if no write operation has been set
    if (this.operation === 'select') {
      this.operation = 'select';
    }
    return this;
  }

  insert(data) {
    this.operation = 'insert';
    this.dataToInsertOrUpdate = data;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.dataToInsertOrUpdate = data;
    return this;
  }

  upsert(data) {
    this.operation = 'upsert';
    this.dataToInsertOrUpdate = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (e) {
      resolve({ data: null, error: e });
    }
  }

  async execute() {
    const db = getLocalStorageDb();
    const table = db[this.tableName] || [];
    const currentUser = JSON.parse(localStorage.getItem('amara_mock_session') || 'null');

    if (this.operation === 'select') {
      let filtered = [...table];
      this.filters.forEach(f => {
        filtered = filtered.filter(item => item[f.column] === f.value);
      });
      
      if (this.isSingle) {
        if (filtered.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
        }
        return { data: filtered[0], error: null };
      }
      return { data: filtered, error: null };
    }

    if (this.operation === 'insert') {
      const recordsToInsert = Array.isArray(this.dataToInsertOrUpdate) 
        ? this.dataToInsertOrUpdate 
        : [this.dataToInsertOrUpdate];
        
      const inserted = recordsToInsert.map(record => {
        const newRecord = {
          id: record.id || Math.random().toString(36).substring(2, 9),
          user_id: record.user_id || currentUser?.user?.id || 'mock-user-id',
          created_at: new Date().toISOString(),
          ...record
        };
        table.push(newRecord);
        return newRecord;
      });
      
      db[this.tableName] = table;
      saveLocalStorageDb(db);
      
      const returnData = Array.isArray(this.dataToInsertOrUpdate) ? inserted : inserted[0];
      return { data: this.isSingle ? (Array.isArray(inserted) ? inserted[0] : inserted) : returnData, error: null };
    }

    if (this.operation === 'upsert') {
      const recordsToUpsert = Array.isArray(this.dataToInsertOrUpdate) 
        ? this.dataToInsertOrUpdate 
        : [this.dataToInsertOrUpdate];
        
      const upserted = recordsToUpsert.map(record => {
        const existingIndex = table.findIndex(item => item.id === record.id);
        const newRecord = {
          id: record.id || Math.random().toString(36).substring(2, 9),
          user_id: record.user_id || currentUser?.user?.id || 'mock-user-id',
          created_at: new Date().toISOString(),
          ...record
        };
        
        if (existingIndex !== -1) {
          table[existingIndex] = { ...table[existingIndex], ...newRecord };
          return table[existingIndex];
        } else {
          table.push(newRecord);
          return newRecord;
        }
      });
      
      db[this.tableName] = table;
      saveLocalStorageDb(db);
      
      const returnData = Array.isArray(this.dataToInsertOrUpdate) ? upserted : upserted[0];
      return { data: this.isSingle ? (Array.isArray(upserted) ? upserted[0] : upserted) : returnData, error: null };
    }

    if (this.operation === 'update') {
      const updatedTable = table.map(item => {
        const matches = this.filters.every(f => item[f.column] === f.value);
        if (matches) {
          return { ...item, ...this.dataToInsertOrUpdate };
        }
        return item;
      });
      
      db[this.tableName] = updatedTable;
      saveLocalStorageDb(db);
      
      const updatedResult = updatedTable.filter(item => this.filters.every(f => item[f.column] === f.value));
      return { data: this.isSingle ? (updatedResult[0] || null) : updatedResult, error: null };
    }

    if (this.operation === 'delete') {
      const filteredTable = table.filter(item => {
        const matches = this.filters.every(f => item[f.column] === f.value);
        return !matches;
      });
      
      db[this.tableName] = filteredTable;
      saveLocalStorageDb(db);
      
      return { data: null, error: null };
    }

    return { data: null, error: new Error('Unknown operation') };
  }
}

const mockSupabase = {
  auth: {
    signUp: async ({ email, password }) => {
      const db = getLocalStorageDb();
      const existing = db.users.find(u => u.email === email);
      if (existing) {
        return { data: null, error: new Error('User already exists') };
      }
      const newUser = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        created_at: new Date().toISOString()
      };
      db.users.push({ ...newUser, password });
      
      db.profiles.push({
        id: newUser.id,
        partner_1_name: 'Amara',
        partner_2_name: 'Partner',
        wedding_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0], // 90 days from now
        wedding_location: 'Jakarta, Indonesia',
        avatar_url: ''
      });
      
      db.budgets.push({
        id: Math.random().toString(36).substring(2, 9),
        user_id: newUser.id,
        total_fund: 150000000, // Default mock budget: 150m IDR
        notes: 'Rencana anggaran pernikahan'
      });

      saveLocalStorageDb(db);
      
      const session = {
        user: newUser,
        access_token: 'mock-access-token'
      };
      localStorage.setItem('amara_mock_session', JSON.stringify(session));
      triggerAuthStateChange('SIGNED_IN', session);
      
      return { data: { user: newUser, session }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      const db = getLocalStorageDb();
      const user = db.users.find(u => u.email === email && u.password === password);
      if (!user) {
        return { data: null, error: new Error('Invalid email or password') };
      }
      const session = {
        user: { id: user.id, email: user.email },
        access_token: 'mock-access-token'
      };
      localStorage.setItem('amara_mock_session', JSON.stringify(session));
      triggerAuthStateChange('SIGNED_IN', session);
      
      return { data: { user: session.user, session }, error: null };
    },

    signInWithOAuth: async ({ provider: _provider }) => {
      const db = getLocalStorageDb();
      const mockEmail = 'test.amara@example.com';
      let user = db.users.find(u => u.email === mockEmail);
      if (!user) {
        user = {
          id: 'mock-google-user-id',
          email: mockEmail,
          created_at: new Date().toISOString()
        };
        db.users.push({ ...user, password: 'password123' });
        
        db.profiles.push({
          id: user.id,
          partner_1_name: 'Amara',
          partner_2_name: 'Partner',
          wedding_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().split('T')[0],
          wedding_location: 'Jakarta, Indonesia',
          avatar_url: ''
        });
        
        db.budgets.push({
          id: Math.random().toString(36).substring(2, 9),
          user_id: user.id,
          total_fund: 150000000,
          notes: ''
        });
        saveLocalStorageDb(db);
      }

      const session = {
        user: { id: user.id, email: user.email },
        access_token: 'mock-access-token'
      };
      localStorage.setItem('amara_mock_session', JSON.stringify(session));
      triggerAuthStateChange('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('amara_mock_session');
      triggerAuthStateChange('SIGNED_OUT', null);
      return { error: null };
    },

    getSession: async () => {
      const session = JSON.parse(localStorage.getItem('amara_mock_session') || 'null');
      return { data: { session }, error: null };
    },

    onAuthStateChange: (callback) => {
      authStateListeners.add(callback);
      const session = JSON.parse(localStorage.getItem('amara_mock_session') || 'null');
      callback('INITIAL_SESSION', session);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authStateListeners.delete(callback);
            }
          }
        }
      };
    }
  },

  from: (tableName) => {
    return new MockQueryBuilder(tableName);
  },

  rpc: async (fnName, _args) => {
    if (fnName === 'unlink_wedding_partner') {
      const db = getLocalStorageDb();
      const currentUser = JSON.parse(localStorage.getItem('amara_mock_session') || 'null');
      const uid = currentUser?.user?.id;
      if (uid && db.profiles) {
        db.profiles = db.profiles.map(p => {
          if (p.wedding_owner_id === uid) {
            return { ...p, wedding_owner_id: null, partner_role: null, is_collaborating: false };
          }
          if (p.id === uid) {
            return { ...p, wedding_owner_id: null, is_collaborating: false, invite_code: null };
          }
          return p;
        });
        saveLocalStorageDb(db);
      }
      return { data: null, error: null };
    }

    if (fnName === 'validate_access_code') {
      const db = getLocalStorageDb();
      const code = (_args?.p_code || '').trim().toUpperCase();
      if (!code) return { data: { is_valid: false, message: 'Kode akses tidak boleh kosong' }, error: null };
      
      const found = (db.access_codes || []).find(c => (c.code || '').toUpperCase() === code);
      if (!found) return { data: { is_valid: false, message: 'Kode akses tidak ditemukan atau salah' }, error: null };
      if (found.status === 'revoked') return { data: { is_valid: false, message: 'Kode akses ini telah dinonaktifkan' }, error: null };
      if (found.status === 'used' || (found.used_count || 0) >= (found.max_uses || 1)) {
        return { data: { is_valid: false, message: 'Kode akses ini sudah terpakai' }, error: null };
      }
      return { 
        data: { 
          is_valid: true, 
          code: found.code, 
          type: found.type || 'trial', 
          duration_days: found.duration_days, 
          note: found.note,
          message: 'Kode akses valid' 
        }, 
        error: null 
      };
    }

    if (fnName === 'check_user_access') {
      const db = getLocalStorageDb();
      const currentUser = JSON.parse(localStorage.getItem('amara_mock_session') || 'null');
      const email = (currentUser?.user?.email || '').toLowerCase();
      const uid = currentUser?.user?.id;

      if (!uid) {
        return { data: { has_access: false, reason: 'unauthenticated' }, error: null };
      }

      if (email === 'agung5s7@gmail.com') {
        return { data: { has_access: true, is_admin: true, access_type: 'admin' }, error: null };
      }

      const profile = (db.profiles || []).find(p => p.id === uid);
      if (profile?.is_admin) {
        return { data: { has_access: true, is_admin: true, access_type: 'admin' }, error: null };
      }

      if (profile?.wedding_owner_id) {
        return { data: { has_access: true, is_admin: false, access_type: 'partner' }, error: null };
      }

      if (profile?.has_access && profile?.access_type === 'paid') {
        return { data: { has_access: true, is_admin: false, access_type: 'paid' }, error: null };
      }

      if (profile?.access_type === 'trial') {
        const expiresAt = profile.trial_expires_at ? new Date(profile.trial_expires_at).getTime() : 0;
        if (Date.now() >= expiresAt) {
          profile.has_access = false;
          saveLocalStorageDb(db);
          return { data: { has_access: false, reason: 'trial_expired', access_type: 'trial', expired_at: profile.trial_expires_at }, error: null };
        }
        return { data: { has_access: true, is_admin: false, access_type: 'trial', expires_at: profile.trial_expires_at }, error: null };
      }

      if (profile?.has_access) {
        return { data: { has_access: true, is_admin: false, access_type: profile.access_type || 'licensed' }, error: null };
      }

      return { data: { has_access: false, reason: 'no_license' }, error: null };
    }

    if (fnName === 'claim_access_code') {
      const db = getLocalStorageDb();
      const code = (_args?.p_code || '').trim().toUpperCase();
      const email = (_args?.p_email || '').trim();
      const userId = _args?.p_user_id;
      const idx = (db.access_codes || []).findIndex(c => (c.code || '').toUpperCase() === code);
      if (idx === -1) return { data: { success: false, message: 'Kode akses tidak ditemukan' }, error: null };
      
      const item = db.access_codes[idx];
      item.used_count = (item.used_count || 0) + 1;
      if (item.used_count >= (item.max_uses || 1)) {
        item.status = 'used';
      }
      item.used_by_email = email;
      item.used_at = new Date().toISOString();
      db.access_codes[idx] = item;

      // Update profile
      if (userId && db.profiles) {
        const pIdx = db.profiles.findIndex(p => p.id === userId);
        const durationDays = item.duration_days || 14;
        const trialExpiresAt = item.type === 'trial' ? new Date(Date.now() + durationDays * 86400000).toISOString() : null;
        if (pIdx !== -1) {
          db.profiles[pIdx] = {
            ...db.profiles[pIdx],
            has_access: true,
            access_type: item.type || 'trial',
            trial_expires_at: trialExpiresAt
          };
        }
      }

      saveLocalStorageDb(db);
      return { data: { success: true, message: 'Kode akses berhasil diklaim' }, error: null };
    }

    if (fnName === 'admin_get_all_users') {
      const db = getLocalStorageDb();
      const mockUsers = (db.profiles || []).map(p => ({
        id: p.id,
        email: p.email || 'user@example.com',
        display_name: p.partner_1_name || 'Pengguna Amara',
        avatar_url: null,
        provider: 'google',
        created_at: p.created_at || new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        is_admin: Boolean(p.is_admin),
        partner_1_name: p.partner_1_name,
        partner_2_name: p.partner_2_name,
        wedding_date: p.wedding_date,
        wedding_location: p.wedding_location,
        license_type: 'trial',
        license_code: 'TRL-MOCK-01'
      }));
      return { data: mockUsers, error: null };
    }

    if (fnName === 'admin_toggle_user_admin') {
      const db = getLocalStorageDb();
      const targetId = _args?.p_target_user_id;
      const isAdminVal = Boolean(_args?.p_new_is_admin);
      db.profiles = (db.profiles || []).map(p => p.id === targetId ? { ...p, is_admin: isAdminVal } : p);
      saveLocalStorageDb(db);
      return { data: { success: true, message: 'Status admin diubah' }, error: null };
    }

    if (fnName === 'admin_delete_user') {
      const db = getLocalStorageDb();
      const targetId = _args?.p_target_user_id;
      db.profiles = (db.profiles || []).filter(p => p.id !== targetId);
      saveLocalStorageDb(db);
      return { data: { success: true, message: 'Pengguna berhasil dihapus' }, error: null };
    }

    if (fnName === 'admin_grant_direct_access') {
      const db = getLocalStorageDb();
      const targetId = _args?.p_target_user_id;
      const accessType = _args?.p_access_type || 'trial';
      db.profiles = (db.profiles || []).map(p => p.id === targetId ? { ...p, has_access: true, access_type: accessType } : p);
      saveLocalStorageDb(db);
      return { data: { success: true, message: `Akses ${accessType} berhasil diberikan` }, error: null };
    }

    if (fnName === 'admin_revoke_direct_access') {
      const db = getLocalStorageDb();
      const targetId = _args?.p_target_user_id;
      db.profiles = (db.profiles || []).map(p => p.id === targetId ? { ...p, has_access: false, access_type: null } : p);
      saveLocalStorageDb(db);
      return { data: { success: true, message: 'Akses berhasil dicabut' }, error: null };
    }

    return { data: null, error: null };
  },

  channel: (_name) => {
    const channelObj = {
      on: (_type, _filter, _callback) => channelObj,
      subscribe: (callback) => {
        if (typeof callback === 'function') callback('SUBSCRIBED');
        return channelObj;
      },
      unsubscribe: () => Promise.resolve()
    };
    return channelObj;
  },

  removeChannel: (_channel) => {
    return Promise.resolve();
  }
};

export const supabase = isMockMode ? mockSupabase : realSupabase;
export { isMockMode };
