import { DailyLog, Habit, User, Category } from '../types';
import { DEFAULT_HABITS } from '../constants';

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
  
  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, // In real app, hash this
    authType,
    createdAt: Date.now()
  };

  users.push(newUser);
  safeSet(USERS_KEY, JSON.stringify(users));
  
  // Initialize default habits
  safeSet(`lc_${newUser.id}_habits`, JSON.stringify(DEFAULT_HABITS));
  
  return newUser;
};

export const authenticateUser = (email: string, password?: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) throw new Error("User not found");
  
  // For simulated auth, we check simple string match if password provided
  if (user.authType === 'email' && password && user.password !== password) {
    throw new Error("Invalid password");
  }
  
  return user;
};

export const loginUser = (userId: string) => {
  safeSet(CURRENT_USER_KEY, userId);
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const deleteAccount = (userId: string) => {
  const users = getUsers().filter(u => u.id !== userId);
  safeSet(USERS_KEY, JSON.stringify(users));
  
  // Cleanup user data
  localStorage.removeItem(`lc_${userId}_habits`);
  localStorage.removeItem(`lc_${userId}_logs`);
  localStorage.removeItem(`lc_${userId}_settings`);
  
  if (getCurrentUserId() === userId) {
    logoutUser();
  }
};

// --- Data Access ---

const getUserKey = (baseKey: string): string => {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user logged in");
  return `lc_${uid}_${baseKey}`;
};

export const getHabits = (): Habit[] => {
  try {
    const key = getUserKey('habits');
    const stored = safeGet(key);
    if (!stored) {
      safeSet(key, JSON.stringify(DEFAULT_HABITS));
      return DEFAULT_HABITS;
    }
    
    // Auto-update: If user is missing the new Education habits (simple check by count or ID), merge them.
    // This ensures existing users see the new "features" without deleting their data.
    const userHabits = JSON.parse(stored) as Habit[];
    const hasEducation = userHabits.some(h => h.category === Category.EDUCATION);
    
    if (!hasEducation) {
        const eduHabits = DEFAULT_HABITS.filter(h => h.category === Category.EDUCATION || h.category === Category.SLEEP);
        const merged = [...userHabits, ...eduHabits];
        safeSet(key, JSON.stringify(merged));
        return merged;
    }

    return userHabits;
  } catch (e) {
    return DEFAULT_HABITS;
  }
};

export const saveHabits = (habits: Habit[]) => {
  try {
    safeSet(getUserKey('habits'), JSON.stringify(habits));
  } catch (e) {}
};

export const getLogs = (): DailyLog[] => {
  try {
    const stored = safeGet(getUserKey('logs'));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveLog = (log: DailyLog) => {
  try {
    const logs = getLogs();
    const filtered = logs.filter(l => !(l.habitId === log.habitId && l.date === log.date));
    filtered.push(log);
    safeSet(getUserKey('logs'), JSON.stringify(filtered));
  } catch (e) {}
};

export const deleteLog = (habitId: string, date: string) => {
  try {
    const logs = getLogs();
    const filtered = logs.filter(l => !(l.habitId === habitId && l.date === date));
    safeSet(getUserKey('logs'), JSON.stringify(filtered));
  } catch (e) {}
};

export const getTodayLogs = (): DailyLog[] => {
  const today = new Date().toISOString().split('T')[0];
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
  try {
    safeSet(getUserKey('settings'), JSON.stringify(settings));
  } catch (e) {}
};