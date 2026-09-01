import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getWeekNumber } from '../lib/dateUtils';
import { Save, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { UnsavedDialog } from '../components/layout/UnsavedDialog';
import type { BodyMeasurement } from '../data/types';

export const Body = () => {
  const { measurements, settings, addMeasurement } = useAppStore();
  const currentWeekNum = getWeekNumber(settings.startDate);
  const maxWeek = Math.max(currentWeekNum, 1);
  const [selectedWeekNum, setSelectedWeekNum] = useState(currentWeekNum);
  
  const weekId = `Week ${selectedWeekNum}`;
  
  const currentMeasurement = measurements.find(m => m.date === weekId) || {
    date: weekId,
    weight: settings.startingWeight || 0,
    chest: 0,
    waist: 0,
    leftArm: 0,
    rightArm: 0,
    thigh: 0,
    shoulders: 0
  } as BodyMeasurement;

  const [localM, setLocalM] = useState<BodyMeasurement>(currentMeasurement);
  const [isDirty, setIsDirty] = useState(false);

  // If the week changes while we're on the page (unlikely but possible), reset
  useEffect(() => {
    if (!isDirty && localM.date !== weekId) {
       const m = measurements.find(m => m.date === weekId) || {
         date: weekId,
         weight: settings.startingWeight || 0,
         chest: 0, waist: 0, leftArm: 0, rightArm: 0, thigh: 0, shoulders: 0
       } as BodyMeasurement;
       setLocalM(m);
    }
  }, [weekId, measurements, isDirty, localM.date, settings.startingWeight]);

  const handleSave = () => {
    addMeasurement(localM);
    setIsDirty(false);
    return true;
  };

  const handleDiscard = () => {
    setLocalM(currentMeasurement);
    setIsDirty(false);
  };

  const { blocker } = useUnsavedChanges(isDirty, handleSave, handleDiscard);

  const handleChange = (field: keyof BodyMeasurement, value: number) => {
    setLocalM((prev: BodyMeasurement) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Sort measurements by week number for chart
  const sortedMeasurements = [...measurements]
    .filter(m => m.date.startsWith('Week '))
    .sort((a, b) => {
      const aNum = parseInt(a.date.replace('Week ', '')) || 0;
      const bNum = parseInt(b.date.replace('Week ', '')) || 0;
      return aNum - bNum;
    });

  const currentWeight = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1].weight : settings.startingWeight;
  const change = currentWeight - settings.startingWeight;

  return (
    <div className="pb-24 animate-fade-in relative">
      <UnsavedDialog blocker={blocker} onSave={handleSave} onDiscard={handleDiscard} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">BODY</h1>
          <div className="relative inline-block mt-1">
            <select
              value={selectedWeekNum}
              onChange={(e) => {
                if (isDirty) {
                  if (confirm("You have unsaved changes. Discard?")) {
                    setIsDirty(false);
                    setSelectedWeekNum(Number(e.target.value));
                  }
                } else {
                  setSelectedWeekNum(Number(e.target.value));
                }
              }}
              className="appearance-none bg-transparent text-textMuted font-medium tracking-wider text-sm uppercase outline-none cursor-pointer pr-6"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).filter(w => w <= maxWeek).map(w => (
                <option key={w} value={w} className="bg-surface text-white">WEEK {w}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-textMuted absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        {isDirty && (
          <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Weight Overview & Chart */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">WEIGHT TREND</h2>
          
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-textMuted tracking-widest uppercase mb-1">Current</p>
              <p className="text-3xl font-black text-white">{currentWeight} <span className="text-sm">kg</span></p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted tracking-widest uppercase mb-1">Starting</p>
              <p className="text-xl font-bold text-white">{settings.startingWeight} <span className="text-sm">kg</span></p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted tracking-widest uppercase mb-1">Change</p>
              <p className={`text-xl font-bold ${change > 0 ? 'text-red-500' : change < 0 ? 'text-success' : 'text-white'}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)} <span className="text-sm">kg</span>
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {sortedMeasurements.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedMeasurements}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#a3a3a3" 
                    fontSize={10} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    stroke="#a3a3a3" 
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a3a3a3', marginBottom: '0.25rem' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-border rounded-xl">
                <p className="text-sm text-textMuted uppercase font-bold tracking-widest text-center">MORE DATA NEEDED FOR CHART<br/>(Track 2+ Weeks)</p>
              </div>
            )}
          </div>
          
          {change > -0.5 && change < 0.5 && sortedMeasurements.length > 3 && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-1">SMART INSIGHT</h3>
              <p className="text-sm text-textMain font-medium">Your average weight has remained stable over the last few weeks. Consider reviewing your calorie intake if you are trying to change weight.</p>
            </div>
          )}
        </div>

        {/* Measurements Entry */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">{weekId} MEASUREMENTS (cm)</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Weight (kg)</label>
              <input 
                type="number" step="0.1"
                value={localM.weight || ''}
                onChange={e => handleChange('weight', Number(e.target.value))}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Chest</label>
              <input 
                type="number" step="0.1"
                value={localM.chest || ''}
                onChange={e => handleChange('chest', Number(e.target.value))}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Waist</label>
              <input 
                type="number" step="0.1"
                value={localM.waist || ''}
                onChange={e => handleChange('waist', Number(e.target.value))}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Shoulders</label>
              <input 
                type="number" step="0.1"
                value={localM.shoulders || ''}
                onChange={e => handleChange('shoulders', Number(e.target.value))}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Arms</label>
              <div className="flex space-x-2">
                <input 
                  type="number" step="0.1" placeholder="L"
                  value={localM.leftArm || ''}
                  onChange={e => handleChange('leftArm', Number(e.target.value))}
                  className="w-16 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
                />
                <input 
                  type="number" step="0.1" placeholder="R"
                  value={localM.rightArm || ''}
                  onChange={e => handleChange('rightArm', Number(e.target.value))}
                  className="w-16 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Thighs</label>
              <input 
                type="number" step="0.1"
                value={localM.thigh || ''}
                onChange={e => handleChange('thigh', Number(e.target.value))}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
