import React, { useState, useEffect } from 'react';
import { BarChart2, Home, Settings, Calendar, Bell } from 'lucide-react';
import { Habit, DailyLog, HabitStatus, Category, QuoteResponse, User } from './types';
import { getHabits, saveHabits, getTodayLogs, saveLog, deleteLog, getSettings, saveSettings, getCurrentUserId, getUsers, logoutUser } from './services/storageService';
import { fetchMotivationalQuote } from './services/geminiService';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import SettingsScreen from './components/SettingsScreen';
import HistoryScreen from './components/HistoryScreen';
import HabitEditor from './components/HabitEditor';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'dashboard' | 'settings'>('home');
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
    const settings = getSettings();
    setDarkMode(settings.darkMode);
    setHabits(getHabits());
    setLogs(getTodayLogs());

    const hour = new Date().getHours();
    const context = hour < 12 ? 'morning' : 'evening';
    if (!quote) {
      fetchMotivationalQuote(context).then(setQuote);
    }
    
    // Notification permission request (Simulated for Web)
    if (Notification.permission === 'default' && settings.notifications) {
        Notification.requestPermission();
    }
  };

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
    setActiveTab('home');
  };

  // --- Habit Management ---

  const handleHabitAction = (habitId: string, status: HabitStatus, value?: number) => {
    const date = new Date().toISOString().split('T')[0];
    if (status === HabitStatus.PENDING) {
      deleteLog(habitId, date);
    } else {
      const newLog: DailyLog = {
        date,
        habitId,
        status,
        timestamp: Date.now(),
        value
      };
      saveLog(newLog);
    }
    setLogs(getTodayLogs());
  };

  const saveHabit = (habitData: Partial<Habit>) => {
    if (!habitData.title || !habitData.time) return;

    const newHabits = [...habits];
    
    if (habitData.id) {
      const index = newHabits.findIndex(h => h.id === habitData.id);
      if (index !== -1) {
        newHabits[index] = { ...newHabits[index], ...habitData } as Habit;
      }
    } else {
      newHabits.push({
        id: generateId(),
        title: habitData.title!,
        time: habitData.time!,
        category: habitData.category || Category.MORNING,
        description: habitData.description || '',
        frequency: habitData.frequency || [0,1,2,3,4,5,6],
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
    saveSettings({ ...getSettings(), darkMode: newMode });
  };

  // --- Filtering Daily Habits ---
  const getDailyHabits = () => {
    const todayIndex = new Date().getDay();
    return habits
      .filter(h => !h.frequency || h.frequency.includes(todayIndex))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const activeHabits = getDailyHabits();
  const progress = activeHabits.length > 0 
    ? Math.round((logs.filter(l => l.status === HabitStatus.COMPLETED).length / activeHabits.length) * 100) 
    : 0;

  // --- Rendering ---

  if (!currentUser) {
    return <AuthScreen onLogin={checkAuth} />;
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-dark w-full transition-colors duration-300`}>
      
      {/* Dynamic Header */}
      {activeTab === 'home' && (
        <header className="px-6 pt-12 pb-6 bg-white dark:bg-card shadow-sm z-10 sticky top-0 rounded-b-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hello, {currentUser.name.split(' ')[0]}
              </h1>
            </div>
            {/* Progress Circle (Small) */}
            <div className="relative w-12 h-12 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * progress) / 100} className="text-primary transition-all duration-1000 ease-out" />
               </svg>
               <span className="absolute text-[10px] font-bold text-gray-700 dark:text-white">{progress}%</span>
            </div>
          </div>

          {/* Quote Card */}
          {quote && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20 mb-2">
              <div className="flex items-start gap-3">
                 <div className="p-2 bg-white/20 rounded-lg"><Bell size={16} /></div>
                 <div>
                    <p className="font-medium text-sm leading-relaxed opacity-95 italic">"{quote.quote}"</p>
                 </div>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 overflow-y-auto w-full max-w-2xl mx-auto pb-32">
        {activeTab === 'home' && (
           <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white px-2">Today's Routine</h2>
              {activeHabits.length === 0 ? (
                 <div className="text-center py-10 text-gray-400">
                    <p>No habits scheduled for today.</p>
                    <p className="text-sm mt-2">Go to Settings to add one.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                    {activeHabits.map(habit => {
                    const log = logs.find(l => l.habitId === habit.id);
                    return (
                        <HabitCard 
                            key={habit.id}
                            habit={habit} 
                            status={log?.status}
                            loggedValue={log?.value}
                            onAction={handleHabitAction}
                        />
                    );
                    })}
                </div>
              )}
           </div>
        )}

        {activeTab === 'dashboard' && <Dashboard habits={habits} />}
        
        {activeTab === 'history' && <HistoryScreen habits={habits} />}
        
        {activeTab === 'settings' && (
            <SettingsScreen 
                user={currentUser}
                habits={habits}
                darkMode={darkMode}
                onToggleTheme={toggleTheme}
                onLogout={handleLogout}
                onOpenEditor={(habit) => {
                    setEditingHabit(habit || {});
                    setIsEditorOpen(true);
                }}
            />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-100 dark:border-gray-800 px-6 py-4 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
            <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-primary scale-105' : 'text-gray-400'}`}
            >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Home</span>
            </button>
            
            <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-primary scale-105' : 'text-gray-400'}`}
            >
            <Calendar size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">History</span>
            </button>

            <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-primary scale-105' : 'text-gray-400'}`}
            >
            <BarChart2 size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Stats</span>
            </button>

            <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'text-primary scale-105' : 'text-gray-400'}`}
            >
            <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Settings</span>
            </button>
        </div>
      </nav>

      {/* Modals */}
      {isEditorOpen && (
        <HabitEditor 
            initialHabit={editingHabit}
            onSave={saveHabit}
            onDelete={deleteHabit}
            onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}