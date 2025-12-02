import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DailyLog, Habit, HabitStatus } from '../types';
import { getLogs } from '../services/storageService';

interface DashboardProps {
  habits: Habit[];
}

const Dashboard: React.FC<DashboardProps> = ({ habits }) => {
  const logs = useMemo(() => getLogs(), []); // In a real app, this would be reactive or passed down
  
  // Calculate today's stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === todayStr);
  const activeHabitsCount = habits.filter(h => h.enabled).length;
  const completedToday = todayLogs.filter(l => l.status === HabitStatus.COMPLETED).length;
  const skippedToday = todayLogs.filter(l => l.status === HabitStatus.SKIPPED).length;

  // Refined Calculation: Exclude skipped habits from the denominator
  // If a user skips a habit, it shouldn't penalize the completion score of the remaining tasks.
  // Effectively calculates "Completion of Non-Skipped Tasks"
  const effectiveTotal = Math.max(0, activeHabitsCount - skippedToday);
  const progress = effectiveTotal > 0 
    ? Math.round((completedToday / effectiveTotal) * 100) 
    : 0;

  // Prepare weekly data
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.date === dateStr && l.status === HabitStatus.COMPLETED);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayLogs.length
      });
    }
    return data;
  }, [logs]);

  const pieData = [
    { name: 'Completed', value: completedToday, color: '#22c55e' },
    { name: 'Skipped', value: skippedToday, color: '#9ca3af' },
    { name: 'Remaining', value: Math.max(0, activeHabitsCount - completedToday - skippedToday), color: '#1e293b' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 text-sm font-medium">Daily Completion</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-primary">{progress}%</span>
            {skippedToday > 0 && <span className="text-xs text-gray-400 mb-1">({skippedToday} skipped)</span>}
          </div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 text-sm font-medium">Streak</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-success">3</span>
            <span className="text-sm text-gray-400 mb-1">days</span>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Today's Breakdown</h3>
        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-sm mt-2">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-success"></div> Done</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Skipped</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-800"></div> To Do</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Weekly Consistency</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff' }}
              />
              <Bar dataKey="completed" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Logs Table (Streamlit-like feature) */}
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Recent Supplements Log</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                      <tr>
                          <th className="px-3 py-2">Time</th>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {todayLogs.filter(l => [HabitStatus.COMPLETED, HabitStatus.SKIPPED].includes(l.status)).slice(0, 5).map((log, i) => {
                          const habit = habits.find(h => h.id === log.habitId);
                          return (
                              <tr key={i} className="border-b dark:border-gray-700">
                                  <td className="px-3 py-2 text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                  <td className="px-3 py-2 font-medium dark:text-white">{habit?.title || 'Unknown'}</td>
                                  <td className="px-3 py-2">
                                      <span className={`px-2 py-0.5 rounded text-xs ${log.status === HabitStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                          {log.status}
                                      </span>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
              {todayLogs.length === 0 && <p className="text-center text-gray-400 py-4">No activity yet today.</p>}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;