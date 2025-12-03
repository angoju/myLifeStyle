
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

export type HabitStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export const HabitStatus = {
  PENDING: 'PENDING' as HabitStatus,
  COMPLETED: 'COMPLETED' as HabitStatus,
  SKIPPED: 'SKIPPED' as HabitStatus
};

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  authType: 'email' | 'google' | 'apple';
  createdAt: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  time: string;
  category: string; // Changed from enum to string to support dynamic categories
  icon?: string;
  frequency: number[];
  enabled: boolean;
}

export interface DailyLog {
  id?: string;
  date: string;
  habitId: string;
  status: HabitStatus;
  timestamp: number;
  value?: number;
}

export interface QuoteResponse {
  quote: string;
  author: string;
}

// Category Manager Types
export interface SubItemDef {
  id: string;
  name: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  items: SubItemDef[];
  isDefault?: boolean;
}
