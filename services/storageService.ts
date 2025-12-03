
import { DailyLog, Habit, User, Category, CategoryDef, SubItemDef } from '../types';
import { DEFAULT_SUB_ITEMS } from '../constants';

const USERS_KEY = 'lc_users';
const CURRENT_USER_KEY = 'lc_current_user_id';

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

// --- Date Helpers ---
export const getLocalDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- User Management ---
export const getCurrentUserId = (): string | null => {
  return safeGet(CURRENT_USER_KEY);
};

export const getUsers = (): User[] => {
  const stored = safeGet(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const registerUser = (name: string, email: string, password?: string, authType: 'email' | 'google' | 'apple' = 'email'): User => {
  const users = getUsers();
  if (users.find(u => u.email === email)) throw new Error("User already exists");

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name, email, password, authType, createdAt: Date.now()
  };

  users.push(newUser);
  safeSet(USERS_KEY, JSON.stringify(users));
  safeSet(`lc_${newUser.id}_habits`, JSON.stringify([]));
  
  return newUser;
};

export const authenticateUser = (email: string, password?: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("User not found");
  if (user.authType === 'email' && password && user.password !== password) throw new Error("Invalid password");
  return user;
};

export const loginUser = (userId: string) => {
  safeSet(CURRENT_USER_KEY, userId);
  // Trigger category migration on login
  initCategories();
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const deleteAccount = (userId: string) => {
  const users = getUsers().filter(u => u.id !== userId);
  safeSet(USERS_KEY, JSON.stringify(users));
  localStorage.removeItem(`lc_${userId}_habits`);
  localStorage.removeItem(`lc_${userId}_logs`);
  localStorage.removeItem(`lc_${userId}_settings`);
  localStorage.removeItem(`lc_${userId}_categories`);
  
  if (getCurrentUserId() === userId) logoutUser();
};

const getUserKey = (baseKey: string): string => {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user logged in");
  return `lc_${uid}_${baseKey}`;
};

// --- Habits & Logs ---
export const getHabits = (): Habit[] => {
  try {
    const key = getUserKey('habits');
    const stored = safeGet(key);
    if (!stored) {
      safeSet(key, JSON.stringify([]));
      return [];
    }
    const habits = JSON.parse(stored) as Habit[];
    // Legacy cleanup
    const hasLegacyDefault = habits.some(h => h.id === '1' && h.title.includes('Ginger'));
    if (hasLegacyDefault) {
        safeSet(key, JSON.stringify([]));
        return [];
    }
    return habits;
  } catch (e) {
    return [];
  }
};

export const saveHabits = (habits: Habit[]) => {
  try { safeSet(getUserKey('habits'), JSON.stringify(habits)); } catch (e) {}
};

export const getLogs = (): DailyLog[] => {
  try {
    const stored = safeGet(getUserKey('logs'));
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const saveLog = (log: DailyLog) => {
  try {
    const logs = getLogs();
    let updatedLogs = [];
    if (log.id) {
        updatedLogs = [...logs, log];
    } else {
        updatedLogs = logs.filter(l => !(l.habitId === log.habitId && l.date === log.date));
        updatedLogs.push(log);
    }
    safeSet(getUserKey('logs'), JSON.stringify(updatedLogs));
  } catch (e) {}
};

export const updateLogValue = (logId: string, newValue: number) => {
  try {
    const logs = getLogs();
    const index = logs.findIndex(l => l.id === logId);
    if (index !== -1) {
      logs[index].value = newValue;
      safeSet(getUserKey('logs'), JSON.stringify(logs));
    }
  } catch (e) {}
};

export const deleteLog = (habitId: string, date: string, logId?: string) => {
  try {
    const logs = getLogs();
    let filtered;
    if (logId) filtered = logs.filter(l => l.id !== logId);
    else filtered = logs.filter(l => !(l.habitId === habitId && l.date === date));
    safeSet(getUserKey('logs'), JSON.stringify(filtered));
  } catch (e) {}
};

export const getTodayLogs = (): DailyLog[] => {
  const today = getLocalDate();
  return getLogs().filter(l => l.date === today);
};

export const getSettings = () => {
  try {
    const stored = safeGet(getUserKey('settings'));
    return stored ? JSON.parse(stored) : { darkMode: false, notifications: true };
  } catch (e) {
    return { darkMode: false, notifications: true };
  }
};

export const saveSettings = (settings: any) => {
  try { safeSet(getUserKey('settings'), JSON.stringify(settings)); } catch (e) {}
};

// --- DYNAMIC CATEGORY MANAGEMENT SYSTEM ---

const generateId = () => Math.random().toString(36).substr(2, 9);

export const initCategories = () => {
  try {
    const key = getUserKey('categories');
    const stored = safeGet(key);
    
    // Only initialize if empty
    if (!stored) {
      const initialData: CategoryDef[] = Object.values(Category).map(catName => {
        const defaultItems = DEFAULT_SUB_ITEMS[catName] || [];
        return {
          id: generateId(),
          name: catName,
          items: defaultItems.map(item => ({ id: generateId(), name: item })),
          isDefault: true
        };
      });
      safeSet(key, JSON.stringify(initialData));
    }
  } catch (e) {}
};

export const getCategories = (): CategoryDef[] => {
  try {
    const key = getUserKey('categories');
    const stored = safeGet(key);
    if (!stored) {
        initCategories();
        const recheck = safeGet(key);
        return recheck ? JSON.parse(recheck) : [];
    }
    return JSON.parse(stored);
  } catch (e) { return []; }
};

const saveCategories = (cats: CategoryDef[]) => {
    safeSet(getUserKey('categories'), JSON.stringify(cats));
};

// --- Category CRUD ---

export const addCategory = (name: string) => {
    const cats = getCategories();
    if (cats.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Category already exists");
    }
    cats.push({
        id: generateId(),
        name,
        items: []
    });
    saveCategories(cats);
};

export const updateCategory = (id: string, newName: string) => {
    const cats = getCategories();
    const cat = cats.find(c => c.id === id);
    if (!cat) return;
    
    const oldName = cat.name;
    cat.name = newName;
    saveCategories(cats);

    // CASCADE: Update all habits using this category
    const habits = getHabits();
    let habitChanged = false;
    habits.forEach(h => {
        if (h.category === oldName) {
            h.category = newName;
            habitChanged = true;
        }
    });
    if (habitChanged) saveHabits(habits);
};

export const deleteCategory = (id: string, deleteSubItems: boolean) => {
    const cats = getCategories();
    const catIndex = cats.findIndex(c => c.id === id);
    if (catIndex === -1) return;

    const catName = cats[catIndex].name;
    cats.splice(catIndex, 1);
    saveCategories(cats);

    // CASCADE: Update habits
    const habits = getHabits();
    let habitChanged = false;
    habits.forEach(h => {
        if (h.category === catName) {
            h.category = "Unassigned"; // Or "General"
            habitChanged = true;
        }
    });
    if (habitChanged) saveHabits(habits);
};

// --- Sub-Item CRUD ---

export const addSubItem = (categoryId: string, itemName: string) => {
    const cats = getCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (!cat) return;

    if (cat.items.some(i => i.name.toLowerCase() === itemName.toLowerCase())) {
        // Prevent dupes silently or throw
        return; 
    }

    cat.items.push({ id: generateId(), name: itemName });
    saveCategories(cats);
};

export const updateSubItem = (categoryId: string, itemId: string, newName: string) => {
    const cats = getCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (!cat) return;

    const item = cat.items.find(i => i.id === itemId);
    if (!item) return;

    const oldName = item.name;
    item.name = newName;
    saveCategories(cats);

    // CASCADE: Update habits
    const habits = getHabits();
    let habitChanged = false;
    habits.forEach(h => {
        if (h.category === cat.name && h.title === oldName) {
            h.title = newName;
            habitChanged = true;
        }
    });
    if (habitChanged) saveHabits(habits);
};

export const deleteSubItem = (categoryId: string, itemId: string) => {
    const cats = getCategories();
    const cat = cats.find(c => c.id === categoryId);
    if (!cat) return;

    const itemIndex = cat.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const itemName = cat.items[itemIndex].name;
    cat.items.splice(itemIndex, 1);
    saveCategories(cats);

    // CASCADE: Remove habits or mark them? Prompt said "Remove it from existing habits or mark as Undefined"
    // We will mark title as "Undefined Task" or leave it. 
    // Actually, usually users prefer keeping the habit even if removed from template list.
    // But prompt says: "clear from dependent habits".
    const habits = getHabits();
    const newHabits = habits.filter(h => !(h.category === cat.name && h.title === itemName));
    if (newHabits.length !== habits.length) {
        saveHabits(newHabits);
    }
};

// Helper for Habit Editor to find ID by Name
export const getCategoryIdByName = (name: string): string | undefined => {
    const cats = getCategories();
    return cats.find(c => c.name === name)?.id;
};
