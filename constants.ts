
import { Category, Habit } from './types';

// Helper to get all days
const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

export const formatFrequency = (freq?: number[]): string => {
    if (!freq || freq.length === 7) return 'Everyday';
    if (freq.length === 0) return 'Never';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return freq.map(d => days[d]).join(', ');
};

export const DEFAULT_SUB_ITEMS: Record<Category, string[]> = {
  [Category.MORNING]: ['Pepper Water', 'Ginger Water', 'Yoga', 'Meditation', 'Warm Water + Lemon', 'Read News', 'Make Bed'],
  [Category.SUPPLEMENTS]: ['Shilajit Drops', 'Shilajit Resin', 'Ashwagandha Tablet', 'Brazil Nut', 'Magnesium', 'Multivitamin', 'Omega-3', 'Creatine'],
  [Category.DIET]: ['Dinner Alert', 'Stop eating', 'Hydration', 'Intermittent Fasting Start', 'No Sugar Check', 'Protein Shake', 'Fruit Bowl'],
  [Category.FITNESS]: ['Gym Workout', 'Home Workout', 'Running', 'Walking', 'Stretching', 'Pushups', 'Squats'],
  [Category.EDUCATION]: ['Physics Study', 'Maths Practice', 'Chemistry', 'Biology', 'Coding', 'History', 'Language Learning'],
  [Category.SLEEP]: ['Sleep Tracking', 'Nap', 'Wind Down Routine', 'No Screens'],
  [Category.WORK]: ['Deep Work Session', 'Email Clearance', 'Planning', 'Meeting Prep'],
  [Category.MINDFULNESS]: ['Breathing Exercise', 'Gratitude Journal', 'Visualization', 'Silence']
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Pepper + Ginger Water',
    time: '05:30',
    category: Category.MORNING,
    description: 'Warm water with spices',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: '2',
    title: 'Kashmiri Garlic + Honey',
    time: '05:35',
    category: Category.SUPPLEMENTS,
    description: '2 cloves',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: '3',
    title: 'Brazil Nut',
    time: '05:40',
    category: Category.SUPPLEMENTS,
    description: 'Eat 1 nut',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: '4',
    title: 'Shilajit Drops',
    time: '05:45',
    category: Category.SUPPLEMENTS,
    description: 'Mix in warm water',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: 'physics_1',
    title: 'Physics Study',
    time: '16:00',
    category: Category.EDUCATION,
    description: 'Focus on mechanics',
    frequency: WEEKDAYS,
    enabled: true,
  },
  {
    id: 'maths_1',
    title: 'Maths Practice',
    time: '17:00',
    category: Category.EDUCATION,
    description: 'Calculus problems',
    frequency: WEEKDAYS,
    enabled: true,
  },
  {
    id: 'chem_1',
    title: 'Chemistry',
    time: '18:00',
    category: Category.EDUCATION,
    description: 'Organic revision',
    frequency: WEEKDAYS,
    enabled: true,
  },
  {
    id: '5',
    title: 'Dinner Alert',
    time: '19:00',
    category: Category.DIET,
    description: 'Stop eating',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: '6',
    title: 'Shilajit Resin',
    time: '20:30',
    category: Category.SUPPLEMENTS,
    description: 'Evening dose',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: '7',
    title: 'Ashwagandha Tablet',
    time: '21:15',
    category: Category.SUPPLEMENTS,
    description: 'Prepare for sleep',
    frequency: EVERYDAY,
    enabled: true,
  },
  {
    id: 'sleep_1',
    title: 'Sleep Tracking',
    time: '22:00',
    category: Category.SLEEP,
    description: 'Log sleep hours',
    frequency: EVERYDAY,
    enabled: true,
  }
];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.MORNING]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [Category.SUPPLEMENTS]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [Category.DIET]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [Category.FITNESS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [Category.EDUCATION]: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  [Category.SLEEP]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  [Category.WORK]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  [Category.MINDFULNESS]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};
