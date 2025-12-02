import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, BarChart2, List, Plus, Moon, Sun, Bell, Volume2 } from 'lucide-react';
import { Habit, DailyLog, HabitStatus, Category, QuoteResponse } from './types';
import { getHabits, saveHabits, getTodayLogs, saveLog, getSettings, saveSettings } from './services/storageService';
import { fetchMotivationalQuote } from './services/geminiService';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [view, setView] = useState<'daily' | 'dashboard' | 'editor'>('daily');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  
  // Editor State
  const [editingHabit, setEditingHabit] = useState<Partial<Habit>>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadedHabits = getHabits();
    const loadedLogs = getTodayLogs();
    const savedSettings = getSettings();
    
    setHabits(loadedHabits);
    setLogs(loadedLogs);
    setDarkMode(savedSettings.darkMode);

    if (savedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Request notification permission if not denied
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
       // We don't block render, just lazy request
    }

    loadQuote();
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveSettings({ ...getSettings(), darkMode: newMode });
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const loadQuote = async () => {
    setLoadingQuote(true);
    const hour = new Date().getHours();
    const context = hour < 12 ? 'morning' : 'evening';
    const q = await fetchMotivationalQuote(context);
    setQuote(q);
    setLoadingQuote(false);
  };

  const handleHabitAction = (id: string, status: HabitStatus) => {
    const newLog: DailyLog = {
      date: new Date().toISOString().split('T')[0],
      habitId: id,
      status,
      timestamp: Date.now()
    };
    saveLog(newLog);
    setLogs(getTodayLogs()); // Refresh logs
  };

  const handleSaveHabit = () => {
    if (!editingHabit.title || !editingHabit.time) return;
    
    let newHabits = [...habits];
    if (editingHabit.id) {
        newHabits = newHabits.map(h => h.id === editingHabit.id ? { ...h, ...editingHabit } as Habit : h);
    } else {
        const newHabit: Habit = {
            id: generateId(),
            title: editingHabit.title!,
            time: editingHabit.time!,
            category: editingHabit.category || Category.FITNESS,
            description: editingHabit.description || '',
            enabled: true
        };
        newHabits.push(newHabit);
    }
    setHabits(newHabits);
    saveHabits(newHabits);
    setIsEditorOpen(false);
    setEditingHabit({});
  };

  const handleDeleteHabit = (id: string) => {
      const newHabits = habits.filter(h => h.id !== id);
      setHabits(newHabits);
      saveHabits(newHabits);
  };

  const playVoiceGuidance = () => {
      if ('speechSynthesis' in window) {
        const remaining = habits.filter(h => !logs.find(l => l.habitId === h.id)).length;
        const text = `Good ${new Date().getHours() < 12 ? 'morning' : 'evening'}. You have completed ${logs.length} tasks and have ${remaining} remaining. Keep it up!`;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
  };

  const requestNotification = async () => {
      if (typeof Notification === 'undefined') return;
      const result = await Notification.requestPermission();
      if (result === 'granted') {
          new Notification("Notifications Enabled", { body: "You will receive alerts for your habits."});
      }
  };

  // Sort habits by time
  const sortedHabits = [...habits].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 dark:bg-dark pb-32 relative font-sans text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center supports-[backdrop-filter]:bg-white/60">
        <div>
           <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
             Daily Coach
           </h1>
           <p className="text-xs text-gray-500 dark:text-gray-400">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
           </p>
        </div>
        <div className="flex gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={playVoiceGuidance} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-primary">
                <Volume2 size={20} />
            </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        
        {/* Quote Widget */}
        {view === 'daily' && (
          <div className="mb-6 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-20"><Bell size={60} /></div>
             {loadingQuote ? (
                 <div className="animate-pulse h-12 w-3/4 bg-white/20 rounded"></div>
             ) : (
                 <>
                    <p className="text-lg font-medium leading-relaxed italic">"{quote?.quote}"</p>
                    <p className="mt-2 text-sm opacity-80 text-right">— {quote?.author}</p>
                 </>
             )}
          </div>
        )}

        {view === 'daily' && (
            <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-xl font-bold">Today's Routine</h2>
                    <span className="text-sm text-gray-500">{logs.length} / {habits.length} Done</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                    <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(logs.length / Math.max(habits.length, 1)) * 100}%`}}
                    ></div>
                </div>

                <div className="space-y-3 pb-8">
                    {sortedHabits.map(habit => {
                        const log = logs.find(l => l.habitId === habit.id);
                        return (
                            <HabitCard 
                                key={habit.id} 
                                habit={habit} 
                                status={log?.status} 
                                onAction={handleHabitAction}
                            />
                        );
                    })}
                </div>
                
                {habits.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <p>No habits yet. Add one!</p>
                    </div>
                )}
            </div>
        )}

        {view === 'dashboard' && <Dashboard habits={habits} />}
        
        {view === 'editor' && (
            <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm pb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Manage Habits</h2>
                    <button 
                        onClick={() => { setEditingHabit({}); setIsEditorOpen(true); }}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                    >
                        <Plus size={16} /> New Habit
                    </button>
                </div>
                <div className="space-y-3">
                    {sortedHabits.map(habit => (
                        <div key={habit.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                            <div>
                                <p className="font-semibold">{habit.title}</p>
                                <p className="text-xs text-gray-500">{habit.time} • {habit.category}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingHabit(habit); setIsEditorOpen(true); }} className="text-blue-500 text-sm">Edit</button>
                                <button onClick={() => handleDeleteHabit(habit.id)} className="text-red-500 text-sm">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold mb-2">Settings</h3>
                    <button onClick={requestNotification} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span>Enable Notifications</span>
                        <Bell size={18} className="text-primary"/>
                    </button>
                </div>
            </div>
        )}

      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-card border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 shadow-2xl flex items-center gap-8 z-40 max-w-[90vw]">
        <button 
            onClick={() => setView('daily')}
            className={`flex flex-col items-center gap-1 ${view === 'daily' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <List size={24} strokeWidth={view === 'daily' ? 3 : 2} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
        <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <BarChart2 size={24} strokeWidth={view === 'dashboard' ? 3 : 2} />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
        <button 
            onClick={() => setView('editor')}
            className={`flex flex-col items-center gap-1 ${view === 'editor' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Settings size={24} strokeWidth={view === 'editor' ? 3 : 2} />
        </button>
      </nav>

      {/* Habit Editor Modal */}
      {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                  <h3 className="text-xl font-bold mb-4">{editingHabit.id ? 'Edit Habit' : 'New Habit'}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Title</label>
                          <input 
                            type="text" 
                            value={editingHabit.title || ''} 
                            onChange={e => setEditingHabit({...editingHabit, title: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. Drink Water"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Time</label>
                            <input 
                                type="time" 
                                value={editingHabit.time || ''} 
                                onChange={e => setEditingHabit({...editingHabit, time: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                         <div>
                            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Category</label>
                            <select 
                                value={editingHabit.category || Category.MORNING} 
                                onChange={e => setEditingHabit({...editingHabit, category: e.target.value as Category})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none appearance-none"
                            >
                                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                      </div>
                      <div>
                          <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Description</label>
                          <input 
                            type="text" 
                            value={editingHabit.description || ''} 
                            onChange={e => setEditingHabit({...editingHabit, description: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Optional details"
                          />
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button onClick={() => setIsEditorOpen(false)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
                          <button onClick={handleSaveHabit} className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors">Save</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}