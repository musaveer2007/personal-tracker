import { useState } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Body = () => {
  const { measurements, settings, addMeasurement } = useAppStore();
  const today = getTodayStr();
  
  const currentMeasurement = measurements.find(m => m.date === today) || {
    date: today,
    weight: settings.startingWeight || 0,
    chest: 0,
    waist: 0,
    leftArm: 0,
    rightArm: 0,
    thigh: 0,
    shoulders: 0
  };

  const [localM, setLocalM] = useState(currentMeasurement);

  const handleSave = () => {
    addMeasurement(localM);
  };

  const sortedMeasurements = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1].weight : settings.startingWeight;
  const change = currentWeight - settings.startingWeight;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">BODY</h1>
          <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">TRACK YOUR PHYSIQUE</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
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
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                <p className="text-sm text-textMuted uppercase font-bold tracking-widest">MORE DATA NEEDED FOR CHART</p>
              </div>
            )}
          </div>
          
          {change > -0.5 && change < 0.5 && sortedMeasurements.length > 7 && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-1">SMART INSIGHT</h3>
              <p className="text-sm text-textMain font-medium">Your average weight has remained stable recently. Consider reviewing your calorie intake if you are trying to change weight.</p>
            </div>
          )}
        </div>

        {/* Measurements Entry */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">TODAY'S MEASUREMENTS (cm)</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Weight (kg)</label>
              <input 
                type="number" step="0.1"
                value={localM.weight || ''}
                onChange={e => setLocalM({...localM, weight: Number(e.target.value)})}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Chest</label>
              <input 
                type="number" step="0.1"
                value={localM.chest || ''}
                onChange={e => setLocalM({...localM, chest: Number(e.target.value)})}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Waist</label>
              <input 
                type="number" step="0.1"
                value={localM.waist || ''}
                onChange={e => setLocalM({...localM, waist: Number(e.target.value)})}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Shoulders</label>
              <input 
                type="number" step="0.1"
                value={localM.shoulders || ''}
                onChange={e => setLocalM({...localM, shoulders: Number(e.target.value)})}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Arms</label>
              <div className="flex space-x-2">
                <input 
                  type="number" step="0.1" placeholder="L"
                  value={localM.leftArm || ''}
                  onChange={e => setLocalM({...localM, leftArm: Number(e.target.value)})}
                  className="w-16 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
                />
                <input 
                  type="number" step="0.1" placeholder="R"
                  value={localM.rightArm || ''}
                  onChange={e => setLocalM({...localM, rightArm: Number(e.target.value)})}
                  className="w-16 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Thighs</label>
              <input 
                type="number" step="0.1"
                value={localM.thigh || ''}
                onChange={e => setLocalM({...localM, thigh: Number(e.target.value)})}
                className="w-24 bg-surfaceHighlight border border-border rounded-md p-2 text-right focus:outline-none focus:border-primary font-bold text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
