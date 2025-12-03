
import React, { useState } from 'react';
import { authenticateUser, registerUser, loginUser } from '../services/storageService';
import { User, Lock, Mail, ChevronRight, Smartphone } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'signup') {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("All fields are required");
        }
        const user = registerUser(formData.name, formData.email, formData.password);
        loginUser(user.id);
      } else {
        if (!formData.email || !formData.password) {
          throw new Error("Email and password required");
        }
        const user = authenticateUser(formData.email, formData.password);
        loginUser(user.id);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleSocialLogin = (type: 'google' | 'apple') => {
    // Simulation of social login
    try {
        const dummyEmail = `user_${Date.now()}@${type}.com`;
        const user = registerUser(`${type} User`, dummyEmail, 'social_pass', type);
        loginUser(user.id);
        onLogin();
    } catch (e) {
        // If already exists, try logging in (simplified for demo)
        alert("Social login simulation: User created or logged in.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-slate-900 flex flex-col justify-center px-6 transition-colors duration-300">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-lg shadow-primary/20">
            <Smartphone size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Daily Coach</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Master your routine, master your life.</p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-8">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full pl-12 pr-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary !bg-white !text-gray-900"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full pl-12 pr-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary !bg-white !text-gray-900"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary !bg-white !text-gray-900"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-sky-600 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'} <ChevronRight size={20} />
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1"></div>
          <span className="text-xs font-bold text-gray-400 uppercase">Or continue with</span>
          <div className="h-px bg-gray-200 dark:bg-slate-700 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleSocialLogin('google')} className="py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium text-gray-700 dark:text-gray-200">
            <span className="text-xl">G</span> Google
          </button>
          <button onClick={() => handleSocialLogin('apple')} className="py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium text-gray-700 dark:text-gray-200">
            <span className="text-xl"></span> Apple
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
