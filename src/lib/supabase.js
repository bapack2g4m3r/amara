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
      profiles: []
    };
  } catch (_e) {
    return { users: [], tasks: [], budgets: [], expenses: [], vendors: [], guests: [], profiles: [] };
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
  }
};

export const supabase = isMockMode ? mockSupabase : realSupabase;
