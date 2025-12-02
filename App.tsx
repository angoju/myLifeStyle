
import React, { useState, useEffect } from 'react';
import { Settings, BarChart2, List, Plus, Moon, Sun, LogOut, Users, X, Trash2, Check } from 'lucide-react';
import { Habit, DailyLog, HabitStatus, Category, QuoteResponse, User } from './types';
import { getHabits, saveHabits, getTodayLogs, saveLog, deleteLog, getSettings, saveSettings, getCurrentUserId, getUsers, logoutUser } from './services/storageService';
import { fetchMotivationalQuote } from './services/geminiService';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import { CATEGORY_COLORS } from './constants';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [view, setView] = useState<'daily' | 'dashboard'>('daily');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Partial<Habit>>({});

  // --- Initialization & Auth ---

  const checkAuth = () => {
    const userId = getCurrentUserId();
    if (userId) {
      const users = getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        setCurrentUser(user);
        loadUserData();
      } else {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loadUserData = async () => {
    // Load Settings
    const settings = getSettings();
    setDarkMode(settings.darkMode);
    
    // Load Habits & Logs
    setHabits(getHabits());
    setLogs(getTodayLogs());

    // Load Quote (Morning routine)
    const hour = new Date().getHours();
    const context = hour < 12 ? 'morning' : 'evening';
    // Simple cache check to avoid over-fetching on re-renders
    if (!quote) {
      fetchMotivationalQuote(context).then(setQuote);
    }
  };

  // Effect to apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setHabits([]);
    setLogs([]);
    setQuote(null);
  };

  // --- Habit Management ---

  const handleHabitAction = (habitId: string, status: HabitStatus, value?: number) => {
    const date = new Date().toISOString().split('T')[0];
    
    if (status === HabitStatus.PENDING) {
      // Undo action
      deleteLog(habitId, date);
    } else {
      // Log action
      const newLog: DailyLog = {
        date,
        habitId,
        status,
        timestamp: Date.now(),
        value
      };
      saveLog(newLog);
    }
    
    // Refresh logs immediately
    setLogs(getTodayLogs());
  };

  const saveHabit = () => {
    if (!editingHabit.title || !editingHabit.time) return;

    const newHabits = [...habits];
    
    if (editingHabit.id) {
      // Edit existing
      const index = newHabits.findIndex(h => h.id === editingHabit.id);
      if (index !== -1) {
        newHabits[index] = { ...newHabits[index], ...editingHabit } as Habit;
      }
    } else {
      // Add new
      newHabits.push({
        id: generateId(),
        title: editingHabit.title!,
        time: editingHabit.time!,
        category: editingHabit.category || Category.MORNING,
        description: editingHabit.description || '',
        enabled: true
      });
    }

    setHabits(newHabits);
    saveHabits(newHabits);
    setIsEditorOpen(false);
    setEditingHabit({});
  };

  const deleteHabit = (id: string) => {
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    saveHabits(newHabits);
    setIsEditorOpen(false);
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveSettings({ darkMode: newMode });
  };

  // --- Rendering ---

  if (!currentUser) {
    return <AuthScreen onLogin={checkAuth} />;
  }

  // Sort habits by time
  const sortedHabits = [...habits].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-dark w-full transition-colors duration-300`}>
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 bg-white dark:bg-card shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hi, {currentUser.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Users size={20} />
            </button>
          </div>
        </div>

        {/* Quote Card */}
        {view === 'daily' && quote && (
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20 mb-2 animate-in fade-in slide-in-from-top-4">
            <p className="font-medium text-sm leading-relaxed opacity-90 italic">"{quote.quote}"</p>
            <p className="text-xs font-bold mt-2 text-blue-100 uppercase tracking-wide">— {quote.author}</p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto w-full max-w-2xl mx-auto pb-24">
        {view === 'daily' ? (
          <div className="grid grid-cols-2 gap-3">
            {sortedHabits.map(habit => {
              const log = logs.find(l => l.habitId === habit.id);
              return (
                <div key={habit.id} onClick={() => { setEditingHabit(habit); setIsEditorOpen(true); }}>
                    {/* Wrap HabitCard in a div to capture clicks for editing, pass specific props to prevent bubbling if needed */}
                   <div onClick={(e) => e.stopPropagation()}>
                       <HabitCard 
                         habit={habit} 
                         status={log?.status}
                         loggedValue={log?.value}
                         onAction={handleHabitAction}
                       />
                   </div>
                </div>
              );
            })}
            
            {/* Add Button */}
            <button 
              onClick={() => { setEditingHabit({}); setIsEditorOpen(true); }}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50 dark:hover:bg-slate-800 transition-all min-h-[180px]"
            >
              <Plus size={32} />
              <span className="text-xs font-bold mt-2">New Habit</span>
            </button>
          </div>
        ) : (
          <Dashboard habits={habits} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-around items-center z-20 pb-safe">
        <button 
          onClick={() => setView('daily')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'daily' ? 'text-primary' : 'text-gray-400'}`}
        >
          <List size={24} />
          <span className="text-[10px] font-bold">Routine</span>
        </button>
        
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-primary' : 'text-gray-400'}`}
        >
          <BarChart2 size={24} />
          <span className="text-[10px] font-bold">Progress</span>
        </button>
      </nav>

      {/* Habit Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                {editingHabit.id ? 'Edit Habit' : 'New Habit'}
              </h2>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={editingHabit.title || ''} 
                  onChange={e => setEditingHabit({...editingHabit, title: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder="e.g. Drink Water"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                  <input 
                    type="time" 
                    value={editingHabit.time || ''} 
                    onChange={e => setEditingHabit({...editingHabit, time: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <input 
                        type="text" 
                        value={editingHabit.description || ''} 
                        onChange={e => setEditingHabit({...editingHabit, description: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                        placeholder="Optional details"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Category).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setEditingHabit({...editingHabit, category: cat})}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2
                                ${editingHabit.category === cat 
                                    ? 'border-primary bg-primary/10 text-primary' 
                                    : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editingHabit.id && (
                  <button 
                    onClick={() => deleteHabit(editingHabit.id!)}
                    className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  onClick={saveHabit}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Save Habit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
