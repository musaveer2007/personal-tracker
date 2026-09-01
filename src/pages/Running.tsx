import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import type { Run } from '../data/types';
import { v4 as uuidv4 } from 'uuid';
import { Activity, Save, Clock, Flame, Navigation, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const Running = () => {
  const { runs, saveRun } = useAppStore();
  const today = getTodayStr();

  const [currentRun, setCurrentRun] = useState<Run>({
    id: uuidv4(),
    date: today,
    distance: 0,
    time: 0,
    pace: '',
    calories: 0,
    type: 'Base Run'
  });

  useEffect(() => {
    const existing = runs.find(r => r.date === today);
    if (existing) {
      setCurrentRun(existing);
    }
  }, [runs, today]);

  const handleSave = () => {
    saveRun(currentRun);
  };

  const calculatePace = (dist: number, time: number) => {
    if (!dist || !time) return '';
    const paceMin = time / dist;
    const mins = Math.floor(paceMin);
    const secs = Math.round((paceMin - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const handleChange = (field: keyof Run, value: any) => {
    const updated = { ...currentRun, [field]: value };
    if (field === 'distance' || field === 'time') {
      updated.pace = calculatePace(Number(updated.distance), Number(updated.time));
    }
    setCurrentRun(updated);
  };

  const historyRuns = [...runs].sort((a, b) => b.date.localeCompare(a.date)).filter(r => r.date !== today);

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">RUNNING</h1>
          <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">CONDITIONING</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="card bg-surface/50 mb-8 border-primary/20">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-6">TODAY'S SESSION</h2>
        
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center space-x-2 mb-2 text-textMuted">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Distance</span>
            </div>
            <div className="flex items-end space-x-2">
              <input 
                type="number" 
                step="0.01"
                value={currentRun.distance || ''}
                onChange={(e) => handleChange('distance', Number(e.target.value))}
                className="bg-transparent text-3xl font-black text-white w-24 focus:outline-none focus:border-b focus:border-primary"
                placeholder="0.00"
              />
              <span className="text-sm font-bold text-textMuted pb-1">km</span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center space-x-2 mb-2 text-textMuted">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Time</span>
            </div>
            <div className="flex items-end space-x-2">
              <input 
                type="number" 
                value={currentRun.time || ''}
                onChange={(e) => handleChange('time', Number(e.target.value))}
                className="bg-transparent text-3xl font-black text-white w-24 focus:outline-none focus:border-b focus:border-primary"
                placeholder="0"
              />
              <span className="text-sm font-bold text-textMuted pb-1">min</span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center space-x-2 mb-2 text-textMuted">
              <Navigation className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Pace</span>
            </div>
            <div className="text-2xl font-bold text-white h-9 flex items-center">
              {currentRun.pace || '--:--/km'}
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center space-x-2 mb-2 text-textMuted">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Calories</span>
            </div>
            <div className="flex items-end space-x-2">
              <input 
                type="number" 
                value={currentRun.calories || ''}
                onChange={(e) => handleChange('calories', Number(e.target.value))}
                className="bg-transparent text-2xl font-bold text-white w-20 focus:outline-none focus:border-b focus:border-primary"
                placeholder="0"
              />
              <span className="text-sm font-bold text-textMuted pb-1">kcal</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold tracking-widest text-textMuted uppercase block mb-2">Run Type</label>
          <select 
            value={currentRun.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg p-3 text-white focus:outline-none focus:border-primary font-medium"
          >
            <option>Base Run</option>
            <option>Intervals</option>
            <option>Long Run</option>
            <option>Recovery Run</option>
          </select>
        </div>
      </div>
      
      {runs.length > 1 && (
        <div className="card space-y-6 mb-8">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> PERFORMANCE TRENDS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 w-full bg-surface/30 p-4 rounded-xl border border-border">
              <h3 className="text-xs font-bold text-textMuted tracking-widest uppercase mb-4">Distance (km)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...runs].sort((a,b) => a.date.localeCompare(b.date))}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '0.5rem' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <Bar dataKey="distance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-48 w-full bg-surface/30 p-4 rounded-xl border border-border">
              <h3 className="text-xs font-bold text-textMuted tracking-widest uppercase mb-4">Pace (min/km)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...runs].sort((a,b) => a.date.localeCompare(b.date)).map(r => ({ ...r, numPace: (r.time / r.distance) || 0 }))}>
                  <XAxis dataKey="date" hide />
                  <YAxis reversed hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '0.5rem' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <Line type="monotone" dataKey="numPace" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">HISTORY</h2>
        <div className="space-y-3">
          {historyRuns.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-xl">
              <p className="text-sm font-bold text-textMuted uppercase">NO RUNS YET.</p>
            </div>
          ) : (
            historyRuns.map(run => (
              <div key={run.id} className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-textMuted uppercase mb-1">{new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {run.type}</div>
                  <div className="text-lg font-bold text-white">{run.distance} km in {run.time} min</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{run.pace}</div>
                  <div className="text-xs text-textMuted">{run.calories} kcal</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
