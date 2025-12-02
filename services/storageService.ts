import { DailyLog, Habit } from '../types';
import { DEFAULT_HABITS } from '../constants';

const HABITS_KEY = 'lifestyle_coach_habits';
const LOGS_KEY = 'lifestyle_coach_logs';
const SETTINGS_KEY = 'lifestyle_coach_settings';

// Safe storage wrapper to prevent crashes in incognito/private modes
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

export const getHabits = (): Habit[] => {
  const stored = safeGet(HABITS_KEY);
  if (!stored) {
    safeSet(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
    return DEFAULT_HABITS;
  }
  return JSON.parse(stored);
};

export const saveHabits = (habits: Habit[]) => {
  safeSet(HABITS_KEY, JSON.stringify(habits));
};

export const getLogs = (): DailyLog[] => {
  const stored = safeGet(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLog = (log: DailyLog) => {
  const logs = getLogs();
  // Remove existing log for same habit on same day if exists (update)
  const filtered = logs.filter(l => !(l.habitId === log.habitId && l.date === log.date));
  filtered.push(log);
  safeSet(LOGS_KEY, JSON.stringify(filtered));
};

export const getTodayLogs = (): DailyLog[] => {
  const today = new Date().toISOString().split('T')[0];
  return getLogs().filter(l => l.date === today);
};

export const getSettings = () => {
  const stored = safeGet(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : { darkMode: false, notifications: false };
};

export const saveSettings = (settings: any) => {
  safeSet(SETTINGS_KEY, JSON.stringify(settings));
};