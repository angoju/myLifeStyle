import React, { useState } from 'react';
import {
  Check, X, SkipForward, Clock, RotateCcw,
  Droplet, Pill, Nut, Utensils, Coffee, Sprout, Sun, Moon, Dumbbell, Zap,
  Atom, Calculator, FlaskConical, BookOpen
} from 'lucide-react';
import { Habit, HabitStatus, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  status?: HabitStatus;
  loggedValue?: number;
  onAction: (id: string, status: HabitStatus, value?: number) => void;
}

const getHabitIcon = (title: string, category: Category) => {
  const t = title.toLowerCase();

  // Specific keyword matching
  if (t.includes('shilajit')) return <Droplet className="text-indigo-600 dark:text-indigo-400" size={20} />;
  if (t.includes('garlic')) return <Sprout className="text-green-600 dark:text-green-400" size={20} />;
  if (t.includes('nut') || t.includes('almond') || t.includes('walnut')) return <Nut className="text-amber-700 dark:text-amber-500" size={20} />;
  if (t.includes('ashwagandha') || t.includes('tablet')) return <Pill className="text-purple-600 dark:text-purple-400" size={20} />;
  if (t.includes('ginger') || t.includes('pepper') || t.includes('tea') || t.includes('coffee')) return <Coffee className="text-orange-700 dark:text-orange-500" size={20} />;
  if (t.includes('water') && !t.includes('ginger')) return <Droplet className="text-blue-500" size={20} />;
  if (t.includes('food') || t.includes('meal') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast')) return <Utensils className="text-red-500 dark:text-red-400" size={20} />;
  
  // Education keywords
  if (t.includes('physics') || t.includes('atom')) return <Atom className="text-pink-500" size={20} />;
  if (t.includes('math')) return <Calculator className="text-pink-500" size={20} />;
  if (t.includes('chem')) return <FlaskConical className="text-pink-500" size={20} />;

  // Category fallback
  switch (category) {
    case Category.MORNING: return <Sun className="text-orange-500" size={20} />;
    case Category.SUPPLEMENTS: return <Pill className="text-emerald-500" size={20} />;
    case Category.DIET: return <Utensils className="text-blue-500" size={20} />;
    case Category.FITNESS: return <Dumbbell className="text-cyan-500" size={20} />;
    case Category.EDUCATION: return <BookOpen className="text-pink-500" size={20} />;
    case Category.SLEEP: return <Moon className="text-violet-500" size={20} />;
    default: return <Zap className="text-gray-400" size={20} />;
  }
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, status, loggedValue, onAction }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showInput, setShowInput] = useState(false);

  const isCompleted = status === HabitStatus.COMPLETED;
  const isSkipped = status === HabitStatus.SKIPPED;
  const isPending = !status || status === HabitStatus.PENDING;

  const requiresValue = habit.category === Category.EDUCATION || habit.category === Category.SLEEP;
  const unitLabel = habit.category === Category.SLEEP ? 'hrs' : 'min';

  const handleComplete = () => {
    if (requiresValue && !inputValue && !loggedValue) {
      setShowInput(true);
      return;
    }
    const val = inputValue ? parseFloat(inputValue) : undefined;
    onAction(habit.id, HabitStatus.COMPLETED, val);
    setShowInput(false);
  };

  return (
    <div className={`
      flex flex-col justify-between p-3 rounded-2xl border transition-all duration-300 h-full min-h-[180px] relative overflow-hidden group
      ${isCompleted 
        ? 'bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
        : isSkipped
          ? 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60'
          : 'bg-white border-gray-100 dark:bg-card dark:border-gray-800 shadow-sm hover:shadow-md'
      }
    `}>
      {/* Top Row: Icon and Status/Time */}
      <div className="flex justify-between items-start mb-3">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center border transition-colors
          ${isCompleted 
             ? 'bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800' 
             : isSkipped
               ? 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
               : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
          }
        `}>
          {getHabitIcon(habit.title, habit.category)}
        </div>
        
        {/* Status Badge or Time */}
        <div className="text-right">
            {isCompleted ? (
                 <div className="flex flex-col items-end">
                    <div className="bg-green-500 text-white p-1 rounded-full"><Check size={12} strokeWidth={4} /></div>
                    {loggedValue && <span className="text-[10px] font-bold text-green-600 mt-1">{loggedValue} {unitLabel}</span>}
                 </div>
            ) : isSkipped ? (
                 <div className="bg-gray-400 text-white p-1 rounded-full"><SkipForward size={12} strokeWidth={3} /></div>
            ) : (
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{habit.time}</span>
                </div>
            )}
        </div>
      </div>

      {/* Middle: Title */}
      <div className="flex-1 mb-3">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-xs uppercase tracking-wider mb-1 inline-block ${CATEGORY_COLORS[habit.category]}`}>
            {habit.category.split(' ')[0]}
        </span>
        <h3 className={`font-semibold text-sm leading-tight ${isCompleted || isSkipped ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {habit.title}
        </h3>
        {habit.description && (
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{habit.description}</p>
        )}
      </div>

      {/* Bottom: Actions */}
      <div className="mt-auto">
          {isPending ? (
             showInput ? (
                 <div className="flex items-center gap-1 animate-in slide-in-from-bottom-2 fade-in">
                    <input 
                      type="number" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={unitLabel}
                      autoFocus
                      className="w-full min-w-0 p-2 text-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold outline-none ring-2 ring-primary/50"
                    />
                    <button 
                      onClick={handleComplete}
                      className="bg-primary text-white p-2 rounded-lg"
                    >
                      <Check size={16} />
                    </button>
                 </div>
             ) : (
                <div className="flex gap-2">
                    <button 
                        onClick={handleComplete}
                        className="flex-1 bg-primary hover:bg-sky-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center transition-colors shadow-sm text-sm"
                    >
                        {requiresValue ? 'Log' : 'Done'}
                    </button>
                    <button 
                        onClick={() => onAction(habit.id, HabitStatus.SKIPPED)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-3 rounded-lg transition-colors"
                    >
                        <SkipForward size={16} />
                    </button>
                </div>
             )
          ) : (
              <button 
                onClick={() => {
                  setInputValue('');
                  setShowInput(false);
                  onAction(habit.id, HabitStatus.PENDING);
                }}
                className="w-full text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
              >
                  <RotateCcw size={12} /> Undo
              </button>
          )}
      </div>
    </div>
  );
};

export default HabitCard;