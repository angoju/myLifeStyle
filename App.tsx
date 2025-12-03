
import React, { useState, useEffect } from 'react';
import { BarChart2, Home, Settings, Calendar, Bell, Plus, X } from 'lucide-react';
import { Habit, DailyLog, HabitStatus, QuoteResponse, User } from './types';
import { getHabits, saveHabits, getTodayLogs, saveLog, deleteLog, updateLogValue, getSettings, saveSettings, getCurrentUserId, getUsers, logoutUser, getLocalDate, initCategories } from './services/storageService';
import { fetchMotivationalQuote } from './services/geminiService';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import SettingsScreen from './components/SettingsScreen';
import HistoryScreen from './components/HistoryScreen';
import HabitEditor from './components/HabitEditor';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'dashboard' | 'settings'>('home');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Partial<Habit>>({});

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
    // Initialize DBs
    initCategories();

    const settings = getSettings();
    setDarkMode(settings.darkMode);
    setHabits(getHabits());
    setLogs(getTodayLogs());

    const hour = new Date().getHours();
    const context = hour < 12 ? 'morning' : 'evening';
    if (!quote) fetchMotivationalQuote(context).then(setQuote);
    
    if (Notification.permission === 'default' && settings.notifications) {
        Notification.requestPermission();
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setHabits([]);
    setLogs([]);
    setQuote(null);
    setActiveTab('home');
  };

  const handleHabitAction = (habitId: string, status: HabitStatus, value?: number) => {
    const date = getLocalDate();
    if (status === HabitStatus.PENDING) {
      deleteLog(habitId, date);
    } else {
      const newLog: DailyLog = {
        date, habitId, status, timestamp: Date.now(), value
      };
      if (value !== undefined) newLog.id = generateId();
      saveLog(newLog);
    }
    setLogs(getTodayLogs());
  };

  const handleUpdateLog = (logId: string, newValue: number) => {
      updateLogValue(logId, newValue);
      setLogs(getTodayLogs());
  };

  const handleDeleteLog = (habitId: string, logId: string) => {
      const date = getLocalDate();
      deleteLog(habitId, date, logId);
      setLogs(getTodayLogs());
  };

  const saveHabit = (habitData: Partial<Habit>) => {
    if (!habitData.title || !habitData.time) return;
    const newHabits = [...habits];
    if (habitData.id) {
      const index = newHabits.findIndex(h => h.id === habitData.id);
      if (index !== -1) newHabits[index] = { ...newHabits[index], ...habitData } as Habit;
    } else {
      newHabits.push({
        id: generateId(),
        title: habitData.title!,
        time: habitData.time!,
        category: habitData.category || 'Morning Routine',
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

  const getDailyHabits = () => {
    const todayIndex = new Date().getDay();
    return habits
      .filter(h => !h.frequency || h.frequency.includes(todayIndex))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const activeHabits = getDailyHabits();
  const distinctCompletedHabits = new Set(logs.filter(l => l.status === HabitStatus.COMPLETED).map(l => l.habitId));
  const progress = activeHabits.length > 0 ? Math.round((distinctCompletedHabits.size / activeHabits.length) * 100) : 0;

  if (!currentUser) return <AuthScreen onLogin={checkAuth} />;

  return (
    <div className={`min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-dark w-full transition-colors duration-300`}>
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
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                     <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * progress) / 100} className="text-primary transition-all duration-1000 ease-out" />
                   </svg>
                   <span className="absolute text-[10px] font-bold text-gray-700 dark:text-white">{progress}%</span>
                </div>
            </div>
          </div>
          {quote && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20 mb-2 relative group animate-in slide-in-from-top-4">
              <button onClick={() => setQuote(null)} className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/80 hover:text-white"><X size={14} strokeWidth={2.5} /></button>
              <div className="flex items-start gap-3">
                 <div className="p-2 bg-white/20 rounded-lg"><Bell size={16} /></div>
                 <div className="pr-6"><p className="font-medium text-sm leading-relaxed opacity-95 italic">"{quote.quote}"</p></div>
              </div>
            </div>
          )}
        </header>
      )}

      <main className="flex-1 px-4 py-6 overflow-y-auto w-full max-w-2xl mx-auto pb-32">
        {activeTab === 'home' && (
           <div className="space-y-4 h-full">
              {activeHabits.length > 0 ? (
                <>
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Routine</h2>
                        <button onClick={() => { setEditingHabit({}); setIsEditorOpen(true); }} className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-95">
                        <Plus size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {activeHabits.map(habit => {
                        const habitLogs = logs.filter(l => l.habitId === habit.id && l.status === HabitStatus.COMPLETED);
                        const totalValue = habitLogs.reduce((sum, l) => sum + (l.value || 0), 0);
                        const currentStatus = habitLogs.length > 0 ? HabitStatus.COMPLETED : logs.find(l => l.habitId === habit.id)?.status;
                        return (
                            <HabitCard key={habit.id} habit={habit} status={currentStatus} logs={habitLogs} loggedValue={totalValue} onAction={handleHabitAction} onUpdateLog={handleUpdateLog} onDeleteLog={handleDeleteLog} />
                        );
                        })}
                    </div>
                </>
              ) : (
                 <div className="flex flex-col items-center justify-center h-[50vh] animate-in fade-in zoom-in duration-300">
                    <p className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-6 text-center">Add your daily routine</p>
                    <button onClick={() => { setEditingHabit({}); setIsEditorOpen(true); }} className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:bg-sky-600 transition-all hover:scale-105 active:scale-95">
                        <Plus size={40} strokeWidth={2.5} />
                    </button>
                 </div>
              )}
           </div>
        )}
        {activeTab === 'dashboard' && <Dashboard habits={habits} />}
        {activeTab === 'history' && <HistoryScreen habits={habits} />}
        {activeTab === 'settings' && (
            <SettingsScreen 
                user={currentUser} habits={habits} darkMode={darkMode} onToggleTheme={toggleTheme} onLogout={handleLogout}
                onOpenEditor={(habit) => { setEditingHabit(habit || {}); setIsEditorOpen(true); }}
            />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-100 dark:border-gray-800 px-6 py-4 z-30 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
            {['home', 'history', 'dashboard', 'settings'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === tab ? 'text-primary scale-105' : 'text-gray-400'}`}>
                    {tab === 'home' && <Home size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                    {tab === 'history' && <Calendar size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                    {tab === 'dashboard' && <BarChart2 size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                    {tab === 'settings' && <Settings size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                    <span className="text-[10px] font-bold capitalize">{tab === 'dashboard' ? 'Stats' : tab}</span>
                </button>
            ))}
        </div>
      </nav>

      {isEditorOpen && <HabitEditor initialHabit={editingHabit} onSave={saveHabit} onDelete={deleteHabit} onClose={() => setIsEditorOpen(false)} />}
    </div>
  );
}
