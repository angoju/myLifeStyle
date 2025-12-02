
import React from 'react';
import { DailyLog, Habit, HabitStatus } from '../types';
import { Check, X, SkipForward } from 'lucide-react';
import { getLogs } from '../services/storageService';

interface HistoryScreenProps {
  habits: Habit[];
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ habits }) => {
  const logs = getLogs().sort((a, b) => b.timestamp - a.timestamp);
  
  // Group logs by date
  const groupedLogs: Record<string, DailyLog[]> = {};
  logs.forEach(log => {
    if (!groupedLogs[log.date]) groupedLogs[log.date] = [];
    groupedLogs[log.date].push(log);
  });

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white px-2">History</h1>
      
      {Object.keys(groupedLogs).length === 0 && (
          <div className="text-center py-20 text-gray-400">
              <p>No activity logged yet.</p>
          </div>
      )}

      {Object.entries(groupedLogs).map(([date, dayLogs]) => (
        <div key={date} className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
            {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </h3>
          <div className="space-y-3">
            {dayLogs.map((log, idx) => {
              const habit = habits.find(h => h.id === log.habitId);
              return (
                <div key={`${date}-${idx}`} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{habit?.title || 'Deleted Habit'}</p>
                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1
                    ${log.status === HabitStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {log.status === HabitStatus.COMPLETED ? <Check size={12} /> : <SkipForward size={12} />}
                    {log.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryScreen;
