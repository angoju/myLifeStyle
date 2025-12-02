
export enum Category {
  MORNING = 'Morning Routine',
  SUPPLEMENTS = 'Supplements',
  DIET = 'Diet',
  FITNESS = 'Fitness',
  EDUCATION = 'Education',
  SLEEP = 'Sleep',
  WORK = 'Work',
  MINDFULNESS = 'Mindfulness'
}

export enum HabitStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed. Storing plain for demo simulation.
  authType: 'email' | 'google' | 'apple';
  createdAt: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:mm format
  category: Category;
  icon?: string; // Emoji or icon name
  frequency: number[]; // Array of days 0-6 (Sun-Sat). If empty/undefined, assume daily.
  enabled: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  status: HabitStatus;
  timestamp: number;
  value?: number; // Duration in minutes or hours
}

export interface QuoteResponse {
  quote: string;
  author: string;
}
