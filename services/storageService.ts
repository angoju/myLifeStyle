
import { DailyLog, Habit, User } from '../types';
import { DEFAULT_HABITS } from '../constants';

const USERS_KEY = 'lc_users';
const CURRENT_USER_KEY = 'lc_current_user_id';

// Legacy keys for migration
const LEGACY_HABITS_KEY = 'lifestyle_coach_habits';
const LEGACY_LOGS_KEY = 'lifestyle_coach_logs';
const LEGACY_SETTINGS_KEY = 'lifestyle_coach_settings';

// Safe storage wrapper
const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('Storage access failed', e);
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Storage save failed', e);
  }
};

// --- User Management ---

export const getCurrentUserId = (): string | null => {
  return safeGet(CURRENT_USER_KEY);
};

export const getUsers = (): User[] => {
  const stored = safeGet(USERS_KEY);
  let users: User[] = stored ? JSON.parse(stored) : [];

  // Migration: If no users exist but legacy data does, create a default user and migrate data
  if (users.length === 0 && safeGet(LEGACY_HABITS_KEY)) {
    console.log("Migrating legacy data to default user...");
    const defaultUser: User = { id: 'default', name: 'My Profile', createdAt: Date.now() };
    users = [defaultUser];
    safeSet(USERS_KEY, JSON.stringify(users));
    
    // Move legacy data to new prefixed keys
    const habits = safeGet(LEGACY_HABITS_KEY);
    const logs = safeGet(LEGACY_LOGS_KEY);
    const settings = safeGet(LEGACY_SETTINGS_KEY);

    if (habits) safeSet(`lc_${defaultUser.id}_habits`, habits);
    if (logs) safeSet(`lc_${defaultUser.id}_logs`, logs);
    if (settings) safeSet(`lc_${defaultUser.id}_settings`, settings);

    // Set as current
    safeSet(CURRENT_USER_KEY, defaultUser.id);
  }

  return users;
};

export const createUser = (name: string): User => {
  const users = getUsers();
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    createdAt: Date.now()
  };
  users.push(newUser);
  safeSet(USERS_KEY, JSON.stringify(users));
  
  // Initialize default habits for new user
  safeSet(`lc_${newUser.id}_habits`, JSON.stringify(DEFAULT_HABITS));
  
  return newUser;
};

export const loginUser = (userId: string) => {
  safeSet(CURRENT_USER_KEY, userId);
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// --- Data Access (Scoped to Current User) ---

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
    return JSON.parse(stored);
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
    return stored ? JSON.parse(stored) : { darkMode: false, notifications: false };
  } catch (e) {
    return { darkMode: false, notifications: false };
  }
};

export const saveSettings = (settings: any) => {
  try {
    safeSet(getUserKey('settings'), JSON.stringify(settings));
  } catch (e) {}
};
