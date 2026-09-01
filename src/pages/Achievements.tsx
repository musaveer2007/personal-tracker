import { useAppStore } from '../data/store';
import { getChallengeStats, calculateStreak } from '../lib/dateUtils';
import { Trophy, CheckCircle, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export const Achievements = () => {
  const { settings, workouts, runs, manualDayCompletions, tasks, taskCompletions } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);
  const currentStreak = calculateStreak(tasks, taskCompletions);
  
  // Calculate specific metrics
  const totalWorkouts = workouts.filter(w => w.completed || w.exercises.some(e => e.sets.some(s => s.completed))).length;
  const totalRunningDistance = runs.reduce((acc, run) => acc + (run.distance || 0), 0);
  const first5k = runs.some(run => (run.distance || 0) >= 5);
  
  // Best PR tracking (simplified - assume any workout with a weight over 100kg is a PR for demo, or just has any workout with >0 weight)
  const hasPR = workouts.some(w => w.exercises.some(e => e.sets.some(s => s.weight > 0 && s.completed)));

  const achievements = [
    { id: 'first_day', name: 'FIRST DAY', desc: 'Complete day 1', achieved: stats.currentDay >= 1 && Object.values(manualDayCompletions).some(v => v) },
    { id: 'streak_7', name: '7 DAY STREAK', desc: 'Maintain a 7-day streak', achieved: currentStreak >= 7 },
    { id: 'streak_30', name: '30 DAY STREAK', desc: 'Maintain a 30-day streak', achieved: currentStreak >= 30 },
    { id: 'workouts_10', name: '10 WORKOUTS', desc: 'Complete 10 workouts', achieved: totalWorkouts >= 10 },
    { id: 'first_pr', name: 'FIRST PR', desc: 'Log your first PR', achieved: hasPR },
    { id: 'first_5k', name: 'FIRST 5K', desc: 'Run a 5K', achieved: first5k },
    { id: '100km_run', name: '100 KM CLUB', desc: 'Run 100km total', achieved: totalRunningDistance >= 100 },
    { id: 'day_50', name: 'HALFWAY THERE', desc: 'Reach Day 50', achieved: stats.currentDay >= 50 },
    { id: 'day_75', name: 'THE FINAL STRETCH', desc: 'Reach Day 75', achieved: stats.currentDay >= 75 },
    { id: 'day_100', name: 'WINTER ARC COMPLETE', desc: 'Finish 100 Days', achieved: stats.currentDay >= 100 && stats.status === 'completed' },
  ];

  const earned = achievements.filter(a => a.achieved).length;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">ACHIEVEMENTS</h1>
          <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">EARN YOUR BADGES</p>
        </div>
        <div className="bg-surfaceHighlight/50 border border-border px-4 py-2 rounded-lg text-center">
          <p className="text-xl font-black text-primary">{earned} <span className="text-sm text-textMuted">/ {achievements.length}</span></p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={cn(
              "p-6 rounded-xl border flex items-center gap-6 transition-all duration-300",
              achievement.achieved 
                ? "bg-surface border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:border-primary/60" 
                : "bg-surface/30 border-border opacity-70 grayscale"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0",
              achievement.achieved ? "bg-primary/20 text-primary" : "bg-surfaceHighlight text-textMuted"
            )}>
              {achievement.achieved ? <Trophy className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={cn(
                "font-black tracking-widest uppercase mb-1",
                achievement.achieved ? "text-white" : "text-textMuted"
              )}>{achievement.name}</h3>
              <p className="text-sm font-medium text-textMuted">{achievement.desc}</p>
            </div>
            {achievement.achieved && (
              <div className="ml-auto">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
