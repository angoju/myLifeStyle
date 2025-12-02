
import React, { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Habit, Category } from '../types';

interface HabitEditorProps {
  initialHabit: Partial<Habit>;
  onSave: (habit: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const HabitEditor: React.FC<HabitEditorProps> = ({ initialHabit, onSave, onDelete, onClose }) => {
  const [habit, setHabit] = useState<Partial<Habit>>(initialHabit);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    const currentDays = habit.frequency || [0, 1, 2, 3, 4, 5, 6];
    if (currentDays.includes(dayIndex)) {
      setHabit({ ...habit, frequency: currentDays.filter(d => d !== dayIndex) });
    } else {
      setHabit({ ...habit, frequency: [...currentDays, dayIndex].sort() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 h-[85vh] sm:h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {habit.id ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
            <input 
              type="text" 
              value={habit.title || ''} 
              onChange={e => setHabit({...habit, title: e.target.value})}
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium"
              placeholder="e.g. Drink Water"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
              <input 
                type="time" 
                value={habit.time || ''} 
                onChange={e => setHabit({...habit, time: e.target.value})}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium"
              />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <input 
                    type="text" 
                    value={habit.description || ''} 
                    onChange={e => setHabit({...habit, description: e.target.value})}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium"
                    placeholder="Details..."
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
                {Object.values(Category).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setHabit({...habit, category: cat})}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2
                            ${habit.category === cat 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-transparent bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Repeat</label>
            <div className="flex justify-between gap-1">
                {days.map((day, idx) => {
                    const isSelected = (habit.frequency || [0,1,2,3,4,5,6]).includes(idx);
                    return (
                        <button
                            key={day}
                            onClick={() => toggleDay(idx)}
                            className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all
                                ${isSelected 
                                    ? 'bg-primary text-white shadow-md shadow-primary/30' 
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                                }
                            `}
                        >
                            {day.charAt(0)}
                        </button>
                    )
                })}
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-auto">
            {habit.id && onDelete && (
              <button 
                onClick={() => onDelete(habit.id!)}
                className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button 
              onClick={() => onSave(habit)}
              className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
            >
              <Check size={24} /> Save Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitEditor;
