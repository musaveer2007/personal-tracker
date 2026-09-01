import { useState } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Save, Moon, Sun, Battery, Smile } from 'lucide-react';
import { cn } from '../lib/utils';
import type { SleepEntry } from '../data/types';

export const Recovery = () => {
  const { sleep, settings, updateSleep } = useAppStore();
  const today = getTodayStr();

  const currentSleep = sleep[today] || {
    date: today,
    hours: 0,
    quality: 'average',
    bedtime: '',
    wakeTime: '',
    energy: 3,
    mood: 'average'
  } as SleepEntry;

  const [localSleep, setLocalSleep] = useState<SleepEntry>(currentSleep);

  const handleSave = () => {
    updateSleep(today, localSleep);
  };

  // Calculate average
  const sleepEntries = Object.values(sleep);
  const avgSleep = sleepEntries.length > 0 
    ? sleepEntries.reduce((acc, curr) => acc + curr.hours, 0) / sleepEntries.length 
    : 0;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">RECOVERY</h1>
          <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">REST AND REBUILD</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Sleep Summary */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">SLEEP SUMMARY</h2>
          
          <div className="text-center py-6">
            <p className="text-6xl font-black text-white mb-2">
              {Math.floor(localSleep.hours)}<span className="text-2xl text-textMuted">h</span> {Math.round((localSleep.hours % 1) * 60)}<span className="text-2xl text-textMuted">m</span>
            </p>
            <p className="text-sm font-bold text-textMuted tracking-widest uppercase mb-6">
              Target: {settings.targetSleepMin}-{settings.targetSleepMax}h
            </p>

            <div className="flex justify-around items-center border-t border-border/50 pt-6">
              <div>
                <p className="text-xs font-bold text-textMuted tracking-widest uppercase mb-1">Avg</p>
                <p className="text-xl font-bold text-white">{avgSleep.toFixed(1)}h</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div>
                <p className="text-xs font-bold text-textMuted tracking-widest uppercase mb-1">Status</p>
                <p className={cn(
                  "text-xl font-bold uppercase",
                  localSleep.hours >= settings.targetSleepMin ? "text-success" : "text-primary"
                )}>
                  {localSleep.hours >= settings.targetSleepMin ? 'Optimal' : 'Deficit'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Form */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">TODAY'S RECOVERY</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-3 rounded-xl border border-border">
                <div className="flex items-center space-x-2 mb-2 text-textMuted">
                  <Moon className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">Bedtime</span>
                </div>
                <input 
                  type="time" 
                  value={localSleep.bedtime || ''}
                  onChange={(e) => setLocalSleep({...localSleep, bedtime: e.target.value})}
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                />
              </div>
              <div className="bg-surface p-3 rounded-xl border border-border">
                <div className="flex items-center space-x-2 mb-2 text-textMuted">
                  <Sun className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">Wake Time</span>
                </div>
                <input 
                  type="time" 
                  value={localSleep.wakeTime || ''}
                  onChange={(e) => setLocalSleep({...localSleep, wakeTime: e.target.value})}
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Total Hours</label>
              <input 
                type="number" step="0.5"
                value={localSleep.hours || ''}
                onChange={e => setLocalSleep({...localSleep, hours: Number(e.target.value)})}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-textMuted" />
                <label className="text-sm font-bold text-white uppercase tracking-widest">Energy (1-5)</label>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <button 
                    key={val}
                    onClick={() => setLocalSleep({...localSleep, energy: val})}
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

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Smile className="w-4 h-4 text-textMuted" />
                <label className="text-sm font-bold text-white uppercase tracking-widest">Mood</label>
              </div>
              <select 
                value={localSleep.mood || 'average'}
                onChange={(e) => setLocalSleep({...localSleep, mood: e.target.value as any})}
                className="bg-surfaceHighlight border border-border rounded-md p-2 focus:outline-none focus:border-primary font-bold text-white capitalize"
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
      </div>
    </div>
  );
};
