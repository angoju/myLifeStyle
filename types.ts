
export enum Category {
  MORNING = 'Morning Routine',
  SUPPLEMENTS = 'Supplements',
  DIET = 'Diet',
  FITNESS = 'Fitness',
  EDUCATION = 'Education',
  SLEEP = 'Sleep'
}

export enum HabitStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface User {
  id: string;
  name: string;
  createdAt: number;
}

export interface Habit {
  id: string;
  title: string;
  time: string; // HH:mm format
  category: Category;
  description?: string;
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
