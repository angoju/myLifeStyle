import { Category, Habit } from './types';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Pepper + Ginger Warm Water',
    time: '05:30',
    category: Category.MORNING,
    description: 'Start the day with warm spice water',
    enabled: true,
  },
  {
    id: '2',
    title: 'Kashmiri Garlic + Honey',
    time: '05:35',
    category: Category.SUPPLEMENTS,
    description: '2 cloves',
    enabled: true,
  },
  {
    id: '3',
    title: 'Brazil Nut',
    time: '05:40',
    category: Category.SUPPLEMENTS,
    description: 'Eat 1 nut',
    enabled: true,
  },
  {
    id: '4',
    title: 'Shilajit Drops',
    time: '05:45',
    category: Category.SUPPLEMENTS,
    description: 'Mix in warm water',
    enabled: true,
  },
  {
    id: '5',
    title: 'Dinner Alert',
    time: '19:00',
    category: Category.DIET,
    description: 'Time to eat',
    enabled: true,
  },
  {
    id: '6',
    title: 'Shilajit Resin',
    time: '20:30',
    category: Category.SUPPLEMENTS,
    description: 'Evening dose',
    enabled: true,
  },
  {
    id: '7',
    title: 'Ashwagandha Tablet',
    time: '21:15',
    category: Category.SUPPLEMENTS,
    description: 'Prepare for sleep',
    enabled: true,
  }
];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.MORNING]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [Category.SUPPLEMENTS]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [Category.DIET]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [Category.FITNESS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [Category.SLEEP]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};