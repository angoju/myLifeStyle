import React from 'react';
import {
  Check, X, SkipForward, Clock, RotateCcw,
  Droplet, Pill, Nut, Utensils, Coffee, Sprout, Sun, Moon, Dumbbell, Zap
} from 'lucide-react';
import { Habit, HabitStatus, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  status?: HabitStatus;
  onAction: (id: string, status: HabitStatus) => void;
}

const getHabitIcon = (title: string, category: Category) => {
  const t = title.toLowerCase();

  // Specific keyword matching for supplements and diet
  if (t.includes('shilajit')) return <Droplet className="text-indigo-600 dark:text-indigo-400" size={24} />;
  if (t.includes('garlic')) return <Sprout className="text-green-600 dark:text-green-400" size={24} />;
  if (t.includes('nut') || t.includes('almond') || t.includes('walnut')) return <Nut className="text-amber-700 dark:text-amber-500" size={24} />;
  if (t.includes('ashwagandha') || t.includes('tablet')) return <Pill className="text-purple-600 dark:text-purple-400" size={24} />;
  if (t.includes('ginger') || t.includes('pepper') || t.includes('tea') || t.includes('coffee')) return <Coffee className="text-orange-700 dark:text-orange-500" size={24} />;
  if (t.includes('water') && !t.includes('ginger')) return <Droplet className="text-blue-500" size={24} />;
  if (t.includes('food') || t.includes('meal') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast')) return <Utensils className="text-red-500 dark:text-red-400" size={24} />;

  // Category fallback
  switch (category) {
    case Category.MORNING: return <Sun className="text-orange-500" size={24} />;
    case Category.SUPPLEMENTS: return <Pill className="text-emerald-500" size={24} />;
    case Category.DIET: return <Utensils className="text-blue-500" size={24} />;
    case Category.FITNESS: return <Dumbbell className="text-cyan-500" size={24} />;
    case Category.SLEEP: return <Moon className="text-violet-500" size={24} />;
    default: return <Zap className="text-gray-400" size={24} />;
  }
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, status, onAction }) => {
  const isCompleted = status === HabitStatus.COMPLETED;
  const isSkipped = status === HabitStatus.SKIPPED;
  const isPending = !status || status === HabitStatus.PENDING;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-4 mb-3 transition-all duration-300 border
      ${isCompleted 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
        : isSkipped
          ? 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-70'
          : 'bg-white border-gray-100 dark:bg-card dark:border-gray-800 shadow-sm'
      }
    `}>
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-colors
          ${isCompleted 
             ? 'bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800' 
             : isSkipped
               ? 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
               : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
          }
        `}>
          {getHabitIcon(habit.title, habit.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[habit.category]}`}>
                {habit.category}
              </span>
              <h3 className={`font-semibold text-lg mt-1 leading-tight ${isCompleted || isSkipped ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {habit.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Clock size={14} className="mr-1" />
                {habit.time}
                {habit.description && <span className="mx-1">•</span>}
                {habit.description && <span className="truncate">{habit.description}</span>}
              </div>
            </div>
            
            {isCompleted && <div className="p-1.5 bg-green-100 text-green-600 rounded-full flex-shrink-0"><Check size={18} /></div>}
            {isSkipped && <div className="p-1.5 bg-gray-200 text-gray-500 rounded-full flex-shrink-0"><SkipForward size={18} /></div>}
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="flex gap-2 mt-3 ml-16">
          <button 
            onClick={() => onAction(habit.id, HabitStatus.COMPLETED)}
            className="flex-1 bg-primary hover:bg-sky-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-500/20 text-sm"
          >
            <Check size={16} /> Done
          </button>
          <button 
            onClick={() => onAction(habit.id, HabitStatus.SKIPPED)}
            className="flex-none bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 px-4 rounded-xl font-medium transition-colors text-sm"
          >
            Skip
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-2">
            <button 
                onClick={() => onAction(habit.id, HabitStatus.PENDING)}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <RotateCcw size={12} /> Undo
            </button>
        </div>
      )}
    </div>
  );
};

export default HabitCard;