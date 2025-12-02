
import React from 'react';
import { DailyLog, Habit, HabitStatus } from '../types';
import { Check, SkipForward } from 'lucide-react';
import { getLogs } from '../services/storageService';

interface HistoryScreenProps {
  habits: Habit[];
}

const formatHistoryDuration = (minutes: number) => {
    if (!minutes) return '';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
};

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

      {Object.entries(groupedLogs).map(([date, dayLogs]) => {
        // Fix Date Parsing: 
        // new Date("2023-12-03") assumes UTC midnight. 
        // We explicitly treat it as local components to ensure it renders "Dec 3" not "Dec 2".
        const [y, m, d] = date.split('-').map(Number);
        const displayDate = new Date(y, m - 1, d);
        
        return (
        <div key={date} className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
            {displayDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </h3>
          <div className="space-y-2">
            {dayLogs.map((log, idx) => {
              const habit = habits.find(h => h.id === log.habitId);
              return (
                <div key={`${date}-${idx}-${log.id || 'std'}`} className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-none">{habit?.title || 'Unknown Habit'}</p>
                        {log.value && log.value > 0 && (
                            <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                                Logged: {formatHistoryDuration(log.value)}
                            </p>
                        )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 uppercase tracking-wide
                    ${log.status === HabitStatus.COMPLETED ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {log.status === HabitStatus.COMPLETED ? <Check size={10} /> : <SkipForward size={10} />}
                    {log.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )})}
    </div>
  );
};

export default HistoryScreen;
