import { TodayScore, TodayChecklist } from '../components/dashboard/TodayComponents';
import { useAppStore } from '../data/store';
import { getTodayStr, getChallengeStats, calculateDayStatus } from '../lib/dateUtils';
import { CheckCircle2 } from 'lucide-react';

export const Today = () => {
  const { tasks, taskCompletions, settings } = useAppStore();
  const today = getTodayStr();
  const stats = getChallengeStats(settings.startDate, settings.endDate);

  const { status, completedCount, totalCount } = calculateDayStatus(today, tasks, taskCompletions);
  const isAllCompleted = status === 'completed';

  return (
    <div className="pb-24">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">DAY {stats.currentDay > 100 ? 100 : stats.currentDay} / 100</h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <TodayScore />
      
      <div className="mb-8">
        <TodayChecklist />
      </div>

      <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-bold tracking-widest mb-4">RECOVERY</h2>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <p className="text-xs font-bold text-textMuted tracking-widest uppercase mb-1">Sleep by</p>
          <p className="text-3xl font-black text-white tracking-tight mb-2">10:00 – 10:30 PM</p>
          <p className="text-sm font-medium text-textMuted">Prepare for tomorrow.</p>
        </div>
      </div>
      
      <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
        {isAllCompleted ? (
          <div className="py-8 bg-success/10 rounded-xl border border-success/20">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-black text-success uppercase mb-2">DAY COMPLETE</h2>
            <h3 className="text-lg font-bold text-textMain uppercase">ANOTHER DAY WON.</h3>
          </div>
        ) : (
          <div className="py-6 border border-border rounded-xl bg-surface">
            <h2 className="text-lg font-bold text-textMain uppercase mb-2">KEEP PUSHING</h2>
            <p className="text-sm text-textMuted font-medium">You still have {totalCount - completedCount} tasks remaining.</p>
          </div>
        )}
      </div>
    </div>
  );
};
