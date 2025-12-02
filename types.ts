
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
  password?: string;
  authType: 'email' | 'google' | 'apple';
  createdAt: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  time: string;
  category: Category;
  icon?: string;
  frequency: number[];
  enabled: boolean;
}

export interface DailyLog {
  id?: string; // Unique ID for specific log entries (e.g. multiple study sessions)
  date: string;
  habitId: string;
  status: HabitStatus;
  timestamp: number;
  value?: number; // Duration in minutes
}

export interface QuoteResponse {
  quote: string;
  author: string;
}
