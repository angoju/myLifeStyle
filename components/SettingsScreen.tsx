
import React, { useState } from 'react';
import { User, Habit } from '../types';
import { Bell, Moon, LogOut, ChevronRight, Edit2, Plus, UserX, Layers } from 'lucide-react';
import { deleteAccount } from '../services/storageService';
import { formatFrequency } from '../constants';
import CategoryManager from './CategoryManager';

interface SettingsScreenProps {
  user: User;
  habits: Habit[];
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenEditor: (habit?: Habit) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, habits, darkMode, onToggleTheme, onLogout, onOpenEditor }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showCatManager, setShowCatManager] = useState(false);

  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      deleteAccount(user.id);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white px-2">Settings</h1>

      {/* Profile */}
      <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg dark:text-white">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Management */}
      <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit2 size={18} /> Manage Habits
          </h3>
          <div className="flex gap-2">
             <button 
                onClick={() => setShowCatManager(true)}
                className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                title="Manage Categories"
            >
                <Layers size={18} />
            </button>
            <button 
                onClick={() => onOpenEditor()}
                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                title="New Habit"
            >
                <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {habits.map(h => (
            <div key={h.id} onClick={() => onOpenEditor(h)} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-10">{h.time}</span>
                <div className="flex flex-col">
                    <span className="text-sm font-medium dark:text-gray-200">{h.title}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{formatFrequency(h.frequency)}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white dark:bg-card rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Bell size={20} /></div>
            <span className="font-medium dark:text-gray-200">Notifications</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
          </label>
        </div>
        
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><Moon size={20} /></div>
            <span className="font-medium dark:text-gray-200">Dark Mode</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={darkMode} onChange={onToggleTheme} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3 pt-4">
        <button onClick={onLogout} className="w-full p-4 bg-white dark:bg-card text-gray-700 dark:text-gray-300 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <LogOut size={20} /> Log Out
        </button>
        <button onClick={handleDeleteAccount} className="w-full p-4 text-red-500 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm">
          <UserX size={16} /> Delete Account
        </button>
      </div>

      {showCatManager && <CategoryManager onClose={() => setShowCatManager(false)} />}
    </div>
  );
};

export default SettingsScreen;
