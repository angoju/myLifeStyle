
import React, { useState } from 'react';
import {
  Check, SkipForward, X,
  Droplet, Pill, Nut, Utensils, Coffee, Sprout, Sun, Moon, Dumbbell, Zap,
  Atom, Calculator, FlaskConical, BookOpen, Plus, RotateCcw, Clock, Trash2, Edit2, List
} from 'lucide-react';
import { Habit, HabitStatus, Category, DailyLog } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  status?: HabitStatus;
  logs?: DailyLog[];
  loggedValue?: number;
  onAction: (id: string, status: HabitStatus, value?: number) => void;
  onUpdateLog?: (logId: string, newValue: number) => void;
  onDeleteLog?: (habitId: string, logId: string) => void;
}

const getHabitIcon = (title: string, category: Category) => {
  const t = title.toLowerCase();

  if (t.includes('shilajit')) return <Droplet className="text-indigo-600 dark:text-indigo-400" size={20} />;
  if (t.includes('garlic')) return <Sprout className="text-green-600 dark:text-green-400" size={20} />;
  if (t.includes('nut') || t.includes('almond') || t.includes('walnut')) return <Nut className="text-amber-700 dark:text-amber-500" size={20} />;
  if (t.includes('ashwagandha') || t.includes('tablet')) return <Pill className="text-purple-600 dark:text-purple-400" size={20} />;
  if (t.includes('ginger') || t.includes('pepper') || t.includes('tea') || t.includes('coffee')) return <Coffee className="text-orange-700 dark:text-orange-500" size={20} />;
  if (t.includes('food') || t.includes('meal') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast')) return <Utensils className="text-red-500 dark:text-red-400" size={20} />;
  
  if (t.includes('physics') || t.includes('atom')) return <Atom className="text-pink-500" size={20} />;
  if (t.includes('math')) return <Calculator className="text-pink-500" size={20} />;
  if (t.includes('chem')) return <FlaskConical className="text-pink-500" size={20} />;

  switch (category) {
    case Category.MORNING: return <Sun className="text-orange-500" size={20} />;
    case Category.SUPPLEMENTS: return <Pill className="text-emerald-500" size={20} />;
    case Category.DIET: return <Utensils className="text-blue-500" size={20} />;
    case Category.FITNESS: return <Dumbbell className="text-cyan-500" size={20} />;
    case Category.EDUCATION: return <BookOpen className="text-pink-500" size={20} />;
    case Category.SLEEP: return <Moon className="text-violet-500" size={20} />;
    default: return <Zap className="text-gray-400" size={20} />;
  }
};

const formatDuration = (minutes: number) => {
    if (!minutes) return '0 min';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
    if (hrs > 0) return `${hrs} hr`;
    return `${mins} min`;
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, status, loggedValue, logs = [], onAction, onUpdateLog, onDeleteLog }) => {
  const [inputValue, setInputValue] = useState<string>('');
  
  // Sleep specific state
  const [sleepHrs, setSleepHrs] = useState<string>('');
  const [sleepMins, setSleepMins] = useState<string>('');
  
  const [showInput, setShowInput] = useState(false);
  const [showLogList, setShowLogList] = useState(false); // To toggle the session manager view
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const isCompleted = status === HabitStatus.COMPLETED;
  const isSkipped = status === HabitStatus.SKIPPED;
  
  const isEducation = habit.category === Category.EDUCATION;
  const isSleep = habit.category === Category.SLEEP;
  const requiresValue = isEducation || isSleep;

  // Validation Logic reused for adding and editing
  const validateValue = (hrsStr: string, minsStr: string, isSleepType: boolean): number | null => {
      if (isSleepType) {
          const hrs = parseInt(hrsStr || '0', 10);
          const mins = parseInt(minsStr || '0', 10);

          if (!Number.isInteger(hrs) || !Number.isInteger(mins) || parseFloat(hrsStr || '0') % 1 !== 0 || parseFloat(minsStr || '0') % 1 !== 0) {
              alert("Please enter valid whole numbers only.");
              return null;
          }
          if (hrs < 0 || mins < 0 || mins >= 60) {
              alert("Invalid time format.");
              return null;
          }
          const total = (hrs * 60) + mins;
          if (total > 720) {
              alert("Sleep time cannot exceed 12 hours.");
              return null;
          }
          if (total === 0) return null;
          return total;
      } else {
          // Education
          const val = parseInt(minsStr, 10);
          if (!Number.isInteger(val) || parseFloat(minsStr) % 1 !== 0) {
              alert("Please enter integer minutes only (no decimals).");
              return null;
          }
          if (val <= 0) return null;
          if (val > 60) {
              alert("Maximum study session is 60 minutes. Add multiple sessions if needed.");
              return null;
          }
          return val;
      }
  };

  const handleComplete = () => {
    // Logic for Standard Habits (Diet, Supplements, Morning)
    if (!requiresValue) {
        onAction(habit.id, HabitStatus.COMPLETED);
        return;
    }

    // Logic for Value Habits (Education, Sleep)
    if (!showInput) {
        setShowInput(true);
        setEditingLogId(null);
        return;
    }

    const val = validateValue(sleepHrs, isSleep ? sleepMins : inputValue, isSleep);
    if (val !== null) {
        onAction(habit.id, HabitStatus.COMPLETED, val);
        // Reset Form
        setInputValue('');
        setSleepHrs('');
        setSleepMins('');
        setShowInput(false);
    }
  };

  const handleSaveEdit = (logId: string) => {
      if (!onUpdateLog) return;
      const val = validateValue(sleepHrs, isSleep ? sleepMins : inputValue, isSleep);
      if (val !== null) {
          onUpdateLog(logId, val);
          setEditingLogId(null);
          setInputValue('');
          setSleepHrs('');
          setSleepMins('');
      }
  };

  const startEditingLog = (log: DailyLog) => {
      setEditingLogId(log.id!);
      if (isSleep) {
          const hrs = Math.floor((log.value || 0) / 60);
          const mins = (log.value || 0) % 60;
          setSleepHrs(hrs.toString());
          setSleepMins(mins.toString());
      } else {
          setInputValue((log.value || 0).toString());
      }
  };

  const handleDeleteSession = (logId: string) => {
      if (confirm("Delete this session?") && onDeleteLog) {
          onDeleteLog(habit.id, logId);
      }
  };

  const handleCancelInput = () => {
      setShowInput(false);
      setEditingLogId(null);
      setInputValue('');
      setSleepHrs('');
      setSleepMins('');
  };

  return (
    <div className={`
      flex flex-col justify-between p-3 rounded-2xl border transition-all duration-300 h-full min-h-[160px] relative overflow-hidden group
      ${isCompleted 
        ? 'bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
        : isSkipped
          ? 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60'
          : 'bg-white border-gray-100 dark:bg-card dark:border-gray-800 shadow-sm hover:shadow-md'
      }
    `}>
      {/* View Mode */}
      {!showLogList && (
          <>
            <div className="flex justify-between items-start mb-2">
                <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center border transition-colors
                ${isCompleted 
                    ? 'bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800' 
                    : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                }
                `}>
                {getHabitIcon(habit.title, habit.category)}
                </div>
                
                <div className="text-right">
                    {isCompleted ? (
                        <div className="flex flex-col items-end animate-in zoom-in duration-200">
                            <div className="bg-green-500 text-white p-1 rounded-full"><Check size={10} strokeWidth={4} /></div>
                            {requiresValue && loggedValue && loggedValue > 0 && (
                                <button 
                                    onClick={() => setShowLogList(true)}
                                    className="text-[10px] font-bold text-green-600 mt-1 whitespace-nowrap bg-green-100 px-1.5 py-0.5 rounded-full dark:bg-green-900/40 dark:text-green-400 hover:bg-green-200 transition-colors flex items-center gap-1"
                                >
                                    {formatDuration(loggedValue)} <Edit2 size={8} />
                                </button>
                            )}
                        </div>
                    ) : isSkipped ? (
                        <div className="bg-gray-400 text-white p-1 rounded-full"><SkipForward size={10} strokeWidth={3} /></div>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono">{habit.time}</span>
                    )}
                </div>
            </div>

            <div className="flex-1 mb-2">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block ${CATEGORY_COLORS[habit.category]}`}>
                    {habit.category.split(' ')[0]}
                </span>
                <h3 className={`font-semibold text-sm leading-tight ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                    {habit.title}
                </h3>
            </div>

            <div className="mt-auto">
                {showInput ? (
                    <div className="animate-in slide-in-from-bottom-2 fade-in">
                        {isSleep ? (
                            <div className="flex gap-1 mb-2">
                                <input 
                                    type="number" value={sleepHrs} onChange={(e) => setSleepHrs(e.target.value)}
                                    placeholder="Hr" className="w-1/2 p-2 text-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                                />
                                <input 
                                    type="number" value={sleepMins} onChange={(e) => setSleepMins(e.target.value)}
                                    placeholder="Min" className="w-1/2 p-2 text-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        ) : (
                            <input 
                                type="number" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Mins (Max 60)"
                                autoFocus
                                className="w-full p-2 mb-2 text-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                            />
                        )}
                        <div className="flex gap-1">
                            <button onClick={handleCancelInput} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-500 p-2 rounded-lg"><X size={14} className="mx-auto"/></button>
                            <button onClick={handleComplete} className="flex-1 bg-primary text-white p-2 rounded-lg"><Check size={14} className="mx-auto"/></button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {(!isCompleted || requiresValue) && !isSkipped && (
                            <button 
                                onClick={handleComplete}
                                className={`flex-1 text-white py-2 rounded-lg font-bold flex items-center justify-center transition-all shadow-sm text-xs active:scale-95
                                    ${requiresValue && isCompleted
                                        ? 'bg-indigo-500 hover:bg-indigo-600' 
                                        : 'bg-primary hover:bg-sky-600'
                                    }`}
                            >
                                {requiresValue && isCompleted ? (
                                    <><Plus size={12} className="mr-1"/> Add</>
                                ) : requiresValue ? (
                                    isSleep ? 'Log Sleep' : 'Log Time'
                                ) : (
                                    'Done'
                                )}
                            </button>
                        )}
                        
                        {(isCompleted || isSkipped) && !requiresValue && (
                            <button 
                                onClick={() => onAction(habit.id, HabitStatus.PENDING)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1 font-semibold"
                            >
                                <RotateCcw size={12} /> Undo
                            </button>
                        )}

                        {!isCompleted && !isSkipped && !showInput && (
                            <button 
                                onClick={() => onAction(habit.id, HabitStatus.SKIPPED)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-2.5 rounded-lg transition-colors"
                            >
                                <SkipForward size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>
          </>
      )}

      {/* Session Manager (Overlay) */}
      {showLogList && (
          <div className="absolute inset-0 bg-white dark:bg-slate-800 z-10 p-3 flex flex-col animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Today's Sessions</h4>
                  <button onClick={() => { setShowLogList(false); setEditingLogId(null); }} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                  {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg">
                          {editingLogId === log.id ? (
                              <div className="flex items-center gap-1 w-full">
                                  {isSleep ? (
                                     <div className="flex gap-1 flex-1">
                                        <input type="number" value={sleepHrs} onChange={e => setSleepHrs(e.target.value)} className="w-1/2 p-1 text-xs rounded bg-white dark:bg-slate-800 border" placeholder="H" />
                                        <input type="number" value={sleepMins} onChange={e => setSleepMins(e.target.value)} className="w-1/2 p-1 text-xs rounded bg-white dark:bg-slate-800 border" placeholder="M" />
                                     </div>
                                  ) : (
                                     <input 
                                        type="number" 
                                        value={inputValue} 
                                        onChange={e => setInputValue(e.target.value)}
                                        className="flex-1 p-1 text-xs rounded bg-white dark:bg-slate-800 border border-primary outline-none"
                                        autoFocus
                                     />
                                  )}
                                  <button onClick={() => handleSaveEdit(log.id!)} className="text-green-500 p-1"><Check size={14}/></button>
                                  <button onClick={() => setEditingLogId(null)} className="text-gray-400 p-1"><X size={14}/></button>
                              </div>
                          ) : (
                              <>
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                      {formatDuration(log.value || 0)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                      <button onClick={() => startEditingLog(log)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded"><Edit2 size={12}/></button>
                                      <button onClick={() => handleDeleteSession(log.id!)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={12}/></button>
                                  </div>
                              </>
                          )}
                      </div>
                  ))}
                  {logs.length === 0 && <p className="text-xs text-center text-gray-400 mt-4">No sessions yet.</p>}
              </div>
          </div>
      )}
    </div>
  );
};

export default HabitCard;
