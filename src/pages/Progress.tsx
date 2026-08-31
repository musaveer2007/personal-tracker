import React from 'react';
import { useAppStore } from '../data/store';
import { getChallengeStats } from '../lib/dateUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Progress = () => {
  const { settings, measurements, taskCompletions, workouts, runs } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);

  const weightData = measurements.map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weight
  }));

  const currentWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : settings.startingWeight;
  const weightChange = currentWeight - settings.startingWeight;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">TRANSFORMATION</h1>
        <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">THE DATA</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-xs font-bold tracking-widest text-textMuted uppercase mb-1">Days</div>
          <div className="text-2xl font-black text-white">{stats.daysCompleted} <span className="text-sm text-textMuted">/ 100</span></div>
        </div>
        <div className="card">
          <div className="text-xs font-bold tracking-widest text-textMuted uppercase mb-1">Workouts</div>
          <div className="text-2xl font-black text-white">{workouts.filter(w => w.completed).length}</div>
        </div>
        <div className="card">
          <div className="text-xs font-bold tracking-widest text-textMuted uppercase mb-1">Runs</div>
          <div className="text-2xl font-black text-white">{runs.length}</div>
        </div>
        <div className="card">
          <div className="text-xs font-bold tracking-widest text-textMuted uppercase mb-1">Weight</div>
          <div className="text-2xl font-black text-white">
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} <span className="text-sm text-textMuted">kg</span>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-6">WEIGHT PROGRESSION</h2>
        <div className="h-64">
          {weightData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#a3a3a3" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#171717', stroke: '#f59e0b', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#f59e0b' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-border rounded-lg">
              <p className="text-sm font-bold text-textMuted uppercase mb-2">NOT ENOUGH DATA</p>
              <p className="text-xs text-textMuted/50">Log your weight for multiple days to see the chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
