import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Save, Battery, Smile, Moon, Clock, BedDouble, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import type { SleepEntry } from '../data/types';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { UnsavedDialog } from '../components/layout/UnsavedDialog';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
};

export const Recovery = () => {
  const { sleep, settings, updateSleep } = useAppStore();
  const today = getTodayStr();

  // Find active sleep session first
  const sleepEntries = Object.values(sleep);
  const activeSession = sleepEntries.find(s => s.status === 'SLEEPING' || s.status === 'READY_TO_BED');

  const currentSleep = activeSession || sleep[today] || {
    date: today,
    hours: 0,
    quality: 'average',
    energy: 3,
    mood: 'average',
    status: 'NOT_STARTED'
  } as SleepEntry;

  const [localSleep, setLocalSleep] = useState<SleepEntry>(currentSleep);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSave = () => {
    updateSleep(localSleep.date, localSleep);
    setIsDirty(false);
    return true;
  };

  const handleDiscard = () => {
    setLocalSleep(currentSleep);
    setIsDirty(false);
  };

  const { blocker } = useUnsavedChanges(isDirty, handleSave, handleDiscard);

  const startSleepSession = () => {
    const timestamp = new Date().toISOString();
    const newSleep: SleepEntry = {
      ...localSleep,
      status: 'SLEEPING',
      bedtimeTimestamp: timestamp
    };
    setLocalSleep(newSleep);
    // Auto-save immediately to persist session
    updateSleep(newSleep.date, newSleep);
    setIsDirty(false);
  };

  const wakeUp = () => {
    if (!localSleep.bedtimeTimestamp) {
      alert("Start a sleep session first.");
      return;
    }
    const wakeTimestamp = new Date().toISOString();
    const bedTime = new Date(localSleep.bedtimeTimestamp).getTime();
    const wakeTime = new Date(wakeTimestamp).getTime();
    
    // In milliseconds, then to seconds
    let durationSeconds = (wakeTime - bedTime) / 1000;
    if (durationSeconds < 0) durationSeconds = 0; // fallback if somehow negative
    const durationHours = durationSeconds / 3600;

    const newSleep: SleepEntry = {
      ...localSleep,
      status: 'COMPLETED',
      wakeTimestamp,
      durationSeconds,
      hours: durationHours
    };
    setLocalSleep(newSleep);
    updateSleep(newSleep.date, newSleep);
    setIsDirty(false); // Saved
  };

  const handleChange = (field: keyof SleepEntry, value: any) => {
    setLocalSleep(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Calculate stats
  const completedEntries = sleepEntries.filter(s => s.status === 'COMPLETED' || (!s.status && s.hours > 0));
  const avgSleep = completedEntries.length > 0 
    ? completedEntries.reduce((acc, curr) => acc + curr.hours, 0) / completedEntries.length 
    : 0;
  
  const bestSleep = completedEntries.length > 0 ? Math.max(...completedEntries.map(s => s.hours)) : 0;
  const shortestSleep = completedEntries.length > 0 ? Math.min(...completedEntries.map(s => s.hours)) : 0;

  // Real-time elapsed calculation
  let elapsedSeconds = 0;
  if (localSleep.status === 'SLEEPING' && localSleep.bedtimeTimestamp) {
    elapsedSeconds = Math.max(0, (currentTime.getTime() - new Date(localSleep.bedtimeTimestamp).getTime()) / 1000);
  }

  return (
    <div className="pb-24 animate-fade-in relative">
      <UnsavedDialog blocker={blocker} onSave={handleSave} onDiscard={handleDiscard} />

      {/* Removed the confirm dialog for ready to bed */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">RECOVERY</h1>
          <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">REST AND REBUILD</p>
        </div>
        {isDirty && (
          <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Entry Form / Session Tracker */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">TODAY'S RECOVERY</h2>
          
          {localSleep.status === 'NOT_STARTED' || !localSleep.status ? (
            <div className="space-y-4 text-center py-6">
               <div className="w-20 h-20 bg-surfaceHighlight/50 border border-border rounded-full flex items-center justify-center mx-auto mb-4 text-textMuted">
                 <Moon className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black text-white">READY TO BED</h3>
               <p className="text-textMuted font-medium text-sm mb-6">Record your exact sleep duration.</p>
               <div className="flex items-center justify-between bg-surfaceHighlight border border-border rounded-xl p-4">
                 <span className="text-lg font-black tracking-widest uppercase text-white">READY TO BED</span>
                 <div 
                   onClick={startSleepSession}
                   className="w-16 h-8 bg-surface rounded-full p-1 cursor-pointer transition-colors border border-border"
                 >
                   <div className="w-6 h-6 bg-textMuted rounded-full transition-transform"></div>
                 </div>
               </div>
            </div>
          ) : localSleep.status === 'SLEEPING' ? (
            <div className="space-y-6 text-center py-6">
               <div className="w-20 h-20 bg-primary/20 border border-primary/50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
                 <BedDouble className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black text-primary uppercase">SLEEP SESSION ACTIVE</h3>
               
               <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Bedtime</p>
                    <p className="text-lg font-bold text-white">
                      {localSleep.bedtimeTimestamp ? new Date(localSleep.bedtimeTimestamp).toLocaleTimeString() : '--'}
                    </p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Current time</p>
                    <p className="text-lg font-bold text-white">
                      {currentTime.toLocaleTimeString()}
                    </p>
                  </div>
               </div>

               <div className="mb-6">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-2">LIVE ELAPSED TIME</p>
                  <p className="text-4xl font-black text-white">{formatDuration(elapsedSeconds)}</p>
               </div>

               <div className="flex items-center justify-between bg-primary/20 border border-primary/50 rounded-xl p-4">
                 <span className="text-lg font-black tracking-widest uppercase text-primary">I'M AWAKE</span>
                 <div 
                   onClick={wakeUp}
                   className="w-16 h-8 bg-primary rounded-full p-1 cursor-pointer transition-colors border border-primary"
                 >
                   <div className="w-6 h-6 bg-black rounded-full transition-transform translate-x-8"></div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-6 py-2">
               <h3 className="text-xl font-black text-white uppercase text-center mb-6">SLEEP COMPLETED</h3>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-surface border border-border rounded-xl p-4 text-center">
                    <Moon className="w-4 h-4 mx-auto text-textMuted mb-2" />
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Bedtime</p>
                    <p className="text-md font-bold text-white">
                      {localSleep.bedtimeTimestamp ? new Date(localSleep.bedtimeTimestamp).toLocaleTimeString() : '--'}
                    </p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-4 text-center">
                    <Sun className="w-4 h-4 mx-auto text-textMuted mb-2" />
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Wake time</p>
                    <p className="text-md font-bold text-white">
                      {localSleep.wakeTimestamp ? new Date(localSleep.wakeTimestamp).toLocaleTimeString() : '--'}
                    </p>
                  </div>
               </div>
               
               <div className="bg-surfaceHighlight border border-border rounded-xl p-4 text-center mb-6">
                 <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Total Sleep</p>
                 <p className="text-3xl font-black text-primary">
                    {localSleep.durationSeconds ? formatDuration(localSleep.durationSeconds) : '--'}
                 </p>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Battery className="w-5 h-5 text-textMuted" />
                      <label className="text-xs font-bold text-white uppercase tracking-widest">Energy (1-5)</label>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button 
                          key={val}
                          onClick={() => handleChange('energy', val)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                            localSleep.energy === val ? "bg-primary text-black" : "bg-surfaceHighlight text-textMuted hover:bg-border"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Smile className="w-5 h-5 text-textMuted" />
                      <label className="text-xs font-bold text-white uppercase tracking-widest">Mood</label>
                    </div>
                    <select 
                      value={localSleep.mood || 'average'}
                      onChange={(e) => handleChange('mood', e.target.value as any)}
                      className="bg-surfaceHighlight border border-border rounded-md p-2 focus:outline-none focus:border-primary font-bold text-white capitalize text-sm"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="tired">Tired</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Statistics & History */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-2">RECOVERY STATISTICS</h2>
            {completedEntries.length === 0 ? (
              <p className="text-sm text-textMuted italic py-4">No sleep data available yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Average Sleep</p>
                  <p className="text-xl font-bold text-white">{avgSleep.toFixed(1)}h</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Best Sleep</p>
                  <p className="text-xl font-bold text-success">{bestSleep.toFixed(1)}h</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Shortest Sleep</p>
                  <p className="text-xl font-bold text-red-400">{shortestSleep.toFixed(1)}h</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Target</p>
                  <p className="text-xl font-bold text-white">{settings.targetSleepMin}-{settings.targetSleepMax}h</p>
                </div>
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-2">SLEEP HISTORY</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {completedEntries.length === 0 ? (
                <p className="text-sm text-textMuted italic py-4">No sleep history yet.</p>
              ) : (
                completedEntries.slice().reverse().map(entry => (
                  <div key={entry.date} className="bg-surface border border-border p-3 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm font-medium text-white flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-textMuted" />
                        {entry.bedtimeTimestamp ? new Date(entry.bedtimeTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : entry.bedtime || '--'} 
                        <span className="mx-2 text-textMuted">→</span> 
                        {entry.wakeTimestamp ? new Date(entry.wakeTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : entry.wakeTime || '--'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">
                        {entry.durationSeconds ? formatDuration(entry.durationSeconds) : `${entry.hours}h`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
