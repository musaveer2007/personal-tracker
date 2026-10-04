import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { ProgressAnalyticsService } from '../lib/analytics/ProgressAnalyticsService';
import { calculateStreak } from '../lib/dateUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sparkles, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { aiService } from '../lib/ai/aiService';

export const Progress = () => {
  const store = useAppStore();
  const streak = calculateStreak(store.tasks, store.taskCompletions);
  
  const stats = ProgressAnalyticsService.getAdherenceStats(store.currentProfileId);
  const trends = ProgressAnalyticsService.getTrends(store.currentProfileId);
  const timeline = ProgressAnalyticsService.getTimelineEvents(store.currentProfileId);

  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const response = await aiService.askCoach(store.currentProfileId, "Summarize my transformation and recent progress.");
        setAiInsight(response.content);
      } catch (e) {
        setAiInsight("Keep training consistently. Your data is looking good.");
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [store.currentProfileId]);

  const weightData = store.measurements.map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weight
  }));

  const goalProgress = 78; // Mocked goal progress for the UI as per prompt design

  return (
    <div className="pb-32 animate-fade-in max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">PROGRESS</h1>
        <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">YOUR JOURNEY</p>
      </div>

      {/* Header Stats */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <div className="bg-surface border border-border px-6 py-3 rounded-xl whitespace-nowrap">
          <span className="text-xs font-bold text-textMuted uppercase tracking-widest block mb-1">Level</span>
          <span className="text-xl font-black text-white">{store.grit.currentLevel}</span>
        </div>
        <div className="bg-surface border border-border px-6 py-3 rounded-xl whitespace-nowrap">
          <span className="text-xs font-bold text-textMuted uppercase tracking-widest block mb-1">GRIT</span>
          <span className="text-xl font-black text-white">{store.grit.totalXP.toLocaleString()}</span>
        </div>
        <div className="bg-surface border border-border px-6 py-3 rounded-xl whitespace-nowrap">
          <span className="text-xs font-bold text-textMuted uppercase tracking-widest block mb-1">Streak</span>
          <span className="text-xl font-black text-white flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" />{streak} Days</span>
        </div>
      </div>

      <div className="w-full h-px bg-border my-8" />

      {/* Goal Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-1">YOUR GOAL</h2>
            <p className="text-xl font-black text-white uppercase">{store.fitnessGoal || 'General Fitness'}</p>
          </div>
          <div className="text-primary font-black text-2xl">{goalProgress}%</div>
        </div>
        <div className="h-4 bg-surfaceHighlight rounded-full overflow-hidden border border-border/50">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${goalProgress}%` }} />
        </div>
      </div>

      <div className="w-full h-px bg-border my-8" />

      {/* 30 Day Overview */}
      <div className="mb-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">30 DAY OVERVIEW</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface p-4 rounded-xl border border-border">
            <span className="text-xs font-bold text-textMuted uppercase block mb-1">Workout</span>
            <span className="text-lg font-black text-white">{stats.workoutAdherence}%</span>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border">
            <span className="text-xs font-bold text-textMuted uppercase block mb-1">Protein</span>
            <span className="text-lg font-black text-white">{stats.proteinAdherence}%</span>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border">
            <span className="text-xs font-bold text-textMuted uppercase block mb-1">Water</span>
            <span className="text-lg font-black text-white">{stats.waterAdherence}%</span>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border">
            <span className="text-xs font-bold text-textMuted uppercase block mb-1">Sleep</span>
            <span className="text-lg font-black text-white">{stats.sleepAdherence}%</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border my-8" />

      {/* Body */}
      <div className="mb-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">BODY</h2>
        <div className="bg-surface border border-border rounded-xl p-4 h-64">
          {weightData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#171717', stroke: '#f59e0b', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center">
               <p className="text-sm font-bold text-textMuted uppercase">Log more weight data</p>
             </div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-border my-8" />

      {/* What Changed */}
      <div className="mb-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">WHAT CHANGED?</h2>
        <div className="space-y-3">
          {trends.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-3">
                {t.trend === 'UP' && t.positive && <TrendingUp className="w-5 h-5 text-success" />}
                {t.trend === 'UP' && !t.positive && <TrendingUp className="w-5 h-5 text-error" />}
                {t.trend === 'DOWN' && t.positive && <TrendingDown className="w-5 h-5 text-success" />}
                {t.trend === 'DOWN' && !t.positive && <TrendingDown className="w-5 h-5 text-error" />}
                {t.trend === 'FLAT' && <Minus className="w-5 h-5 text-textMuted" />}
                <span className="font-bold text-sm text-white uppercase tracking-widest">{t.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-black ${t.positive ? 'text-success' : 'text-error'}`}>{t.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border my-8" />

      {/* Transformation Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">TRANSFORMATION TIMELINE</h2>
        </div>
        <div className="space-y-6 pl-4 border-l-2 border-border ml-2">
          {timeline.map((event, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[23px] top-1 bg-background p-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <div className="bg-surface border border-border rounded-xl p-4 ml-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-primary tracking-widest uppercase bg-primary/10 px-2 py-1 rounded">
                    {event.type}
                  </span>
                  <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-black text-white uppercase tracking-wider mb-1">{event.title}</h3>
                <p className="text-sm font-medium text-textMuted">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border my-8" />

      {/* ARC Insight */}
      <div className="mb-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> ARC INSIGHT
        </h2>
        <div className="bg-gradient-to-br from-surface to-background border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Sparkles className="w-24 h-24 text-purple-400" />
           </div>
           {loadingInsight ? (
             <div className="animate-pulse space-y-2 relative z-10">
               <div className="h-4 w-3/4 bg-surfaceHighlight rounded"></div>
               <div className="h-4 w-1/2 bg-surfaceHighlight rounded"></div>
             </div>
           ) : (
             <p className="relative z-10 text-sm font-medium text-textMuted whitespace-pre-wrap">{aiInsight}</p>
           )}
        </div>
      </div>

    </div>
  );
};
