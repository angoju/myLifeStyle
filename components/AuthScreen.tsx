
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser, loginUser } from '../services/storageService';
import { User as UserIcon, Plus, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleLogin = (id: string) => {
    loginUser(id);
    onLogin();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const user = createUser(newName);
    loginUser(user.id);
    onLogin();
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <UserIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Coach</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Who is checking in today?</p>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white block group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-4 mt-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} /> Add Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Profile Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. John"
                autoFocus
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none text-lg"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-sky-600 transition-all"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
