import { DashboardHero } from '../components/dashboard/DashboardHero';
import { TodayScore, TodayChecklist } from '../components/dashboard/TodayComponents';
import { useAppStore } from '../data/store';
import { getChallengeStats, calculateStreak } from '../lib/dateUtils';
import { Download } from 'lucide-react';

export const Overview = () => {
  const { settings, workouts, runs, manualDayCompletions, measurements } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);
  
  if (stats.status === 'completed') {
    const totalWorkouts = workouts.filter(w => w.completed || w.exercises.some(e => e.sets.some(s => s.completed))).length;
    const totalRunDist = runs.reduce((acc, run) => acc + (run.distance || 0), 0);
    const sortedMeasurements = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
    const finalWeight = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1].weight : settings.startingWeight;
    const weightChange = finalWeight - settings.startingWeight;
    const longestStreak = calculateStreak(manualDayCompletions);

    return (
      <div className="pb-12 animate-fade-in">
        <DashboardHero />
        
        <div className="card space-y-8 bg-surfaceHighlight/30 border-primary/30 p-8 text-center mt-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-widest">100 DAYS COMPLETE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-textMuted uppercase mb-1">Starting Weight</p>
              <p className="text-xl font-bold text-white">{settings.startingWeight} kg</p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted uppercase mb-1">Final Weight</p>
              <p className="text-xl font-bold text-white">{finalWeight} kg</p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted uppercase mb-1">Weight Change</p>
              <p className={`text-xl font-bold ${weightChange > 0 ? 'text-red-500' : 'text-success'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted uppercase mb-1">Total Workouts</p>
              <p className="text-xl font-bold text-white">{totalWorkouts}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted uppercase mb-1">Total Distance</p>
              <p className="text-xl font-bold text-white">{totalRunDist.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-xs font-bold text-textMuted uppercase mb-1">Best Streak</p>
              <p className="text-xl font-bold text-orange-500">{longestStreak} Days</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50">
            <h2 className="text-2xl font-black text-primary uppercase mb-6">YOU SHOWED UP.</h2>
            <button className="btn-secondary mx-auto flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>EXPORT MY 100-DAY REPORT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-fade-in">
      <DashboardHero />
      <TodayScore />
      <TodayChecklist />
    </div>
  );
};
