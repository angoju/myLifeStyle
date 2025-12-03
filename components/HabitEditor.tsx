
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Trash2, Search, Plus, ChevronDown, Edit2, Settings } from 'lucide-react';
import { Habit } from '../types';
import { getCategories, addSubItem, getCategoryIdByName, initCategories } from '../services/storageService';
import CategoryManager from './CategoryManager';

interface HabitEditorProps {
  initialHabit: Partial<Habit>;
  onSave: (habit: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const HabitEditor: React.FC<HabitEditorProps> = ({ initialHabit, onSave, onDelete, onClose }) => {
  const [habit, setHabit] = useState<Partial<Habit>>({
    ...initialHabit,
    category: initialHabit.category || 'Morning Routine',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialHabit.title || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    // Ensure DB is ready
    initCategories();
    loadCategories();
  }, []);

  const loadCategories = () => {
    const cats = getCategories();
    setCategories(cats);
    // Refresh items for current selection
    if (habit.category) {
        const currentCat = cats.find(c => c.name === habit.category);
        if (currentCat) {
            setAvailableItems(currentCat.items.map((i: any) => i.name));
        } else {
            // Fallback if category was deleted or unassigned
            if (cats.length > 0) setHabit({ ...habit, category: cats[0].name });
        }
    }
  };

  useEffect(() => {
    if (habit.category) {
      const cat = categories.find(c => c.name === habit.category);
      if (cat) {
        setAvailableItems(cat.items.map((i: any) => i.name));
      }
    }
  }, [habit.category, categories]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (!searchQuery.trim()) {
        alert("Please select or enter a habit name");
        return;
    }

    // Auto-add new custom item to the selected category
    const cat = categories.find(c => c.name === habit.category);
    if (cat) {
        const exists = cat.items.some((i: any) => i.name.toLowerCase() === searchQuery.toLowerCase());
        if (!exists) {
            addSubItem(cat.id, searchQuery);
        }
    }

    onSave({
        ...habit,
        title: searchQuery
    });
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = habit.frequency || [0, 1, 2, 3, 4, 5, 6];
    if (currentDays.includes(dayIndex)) {
      setHabit({ ...habit, frequency: currentDays.filter(d => d !== dayIndex) });
    } else {
      setHabit({ ...habit, frequency: [...currentDays, dayIndex].sort() });
    }
  };

  const filteredItems = availableItems.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 h-[90vh] sm:h-auto overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {habit.id ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pb-4">
          
          {/* Category Dropdown with Manager Button */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Category</label>
                <button onClick={() => setShowCatManager(true)} className="text-xs font-bold text-primary flex items-center gap-1">
                    <Settings size={12} /> Manage
                </button>
            </div>
            <div className="relative">
                <select
                    value={habit.category}
                    onChange={(e) => setHabit({...habit, category: e.target.value})}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium appearance-none cursor-pointer shadow-sm"
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronDown size={20} />
                </div>
            </div>
          </div>

          {/* Sub-Item Autocomplete */}
          <div ref={dropdownRef} className="relative z-10">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Habit Name</label>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onClick={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium shadow-sm"
                    placeholder="Search or type custom..."
                />
            </div>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto z-20">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <button
                                key={item}
                                onClick={() => {
                                    setSearchQuery(item);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                            >
                                {item}
                            </button>
                        ))
                    ) : (
                        <div className="p-3 text-center">
                            <p className="text-xs text-gray-400 mb-2">Item not found</p>
                            <button 
                                onClick={() => setIsDropdownOpen(false)}
                                className="text-primary text-sm font-bold flex items-center justify-center gap-1 mx-auto"
                            >
                                <Plus size={14} /> Add "{searchQuery}"
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Time & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time</label>
              <input 
                type="time" 
                value={habit.time || ''} 
                onChange={e => setHabit({...habit, time: e.target.value})}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium shadow-sm"
              />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                <input 
                    type="text" 
                    value={habit.description || ''} 
                    onChange={e => setHabit({...habit, description: e.target.value})}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-gray-900 font-medium shadow-sm"
                    placeholder="Optional..."
                />
            </div>
          </div>

          {/* Repeat */}
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
                                    : 'bg-white border border-gray-200 text-gray-400'
                                }
                            `}
                        >
                            {day.charAt(0)}
                        </button>
                    )
                })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
            {habit.id && onDelete && (
              <button 
                onClick={() => onDelete(habit.id!)}
                className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button 
              onClick={handleSave}
              className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
            >
              <Check size={24} /> Save Habit
            </button>
        </div>
      </div>
    </div>
    
    {showCatManager && (
        <CategoryManager onClose={() => { setShowCatManager(false); loadCategories(); }} />
    )}
    </>
  );
};

export default HabitEditor;
