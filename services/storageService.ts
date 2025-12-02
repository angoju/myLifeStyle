
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

// --- Date Helpers (Local Timezone Fix) ---

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
  
  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, 
    authType,
    createdAt: Date.now()
  };

  users.push(newUser);
  safeSet(USERS_KEY, JSON.stringify(users));
  // Initialize with empty array to ensure clean state
  safeSet(`lc_${newUser.id}_habits`, JSON.stringify([]));
  
  return newUser;
};

export const authenticateUser = (email: string, password?: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) throw new Error("User not found");
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
      safeSet(key, JSON.stringify([]));
      return [];
    }

    const habits = JSON.parse(stored) as Habit[];

    // ONE-TIME CLEANUP: If we detect the old "Pepper + Ginger" default habit (id: '1'), 
    // we clear the list to ensure the user gets the requested "Empty State".
    // This fixes the "I don't see changes" issue for existing users.
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
    let updatedLogs = [];

    // If log has an ID (Education/Sleep session), we append it (allowing multiples per day)
    // If log has no ID (Standard Habit), we replace any existing entry for that day/habit
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
    
    if (logId) {
        // Delete specific session by ID
        filtered = logs.filter(l => l.id !== logId);
    } else {
        // Delete all logs for that habit on that date (Standard toggle behavior)
        filtered = logs.filter(l => !(l.habitId === habitId && l.date === date));
    }
    
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
  try {
    safeSet(getUserKey('settings'), JSON.stringify(settings));
  } catch (e) {}
};
