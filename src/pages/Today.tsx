import { TodayScore, TodayChecklist } from '../components/dashboard/TodayComponents';
import { useAppStore } from '../data/store';
import { getTodayStr, getChallengeStats } from '../lib/dateUtils';
import { CheckCircle2 } from 'lucide-react';

export const Today = () => {
  const { tasks, taskCompletions, settings } = useAppStore();
  const today = getTodayStr();
  const dayOfWeek = new Date().getDay();
  const stats = getChallengeStats(settings.startDate, settings.endDate);

  const todayTasks = tasks.filter(t => {
    if (t.frequency === 'daily') return true;
    if (t.frequency === 'specific_days' && t.daysOfWeek?.includes(dayOfWeek)) return true;
    return false;
  });

  const completedToday = taskCompletions.filter(tc => tc.date === today && tc.completed).length;
  const totalToday = todayTasks.length;
  const isAllCompleted = totalToday > 0 && completedToday === totalToday;

  return (
    <div className="pb-24">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">DAY {stats.currentDay} / 100</h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <TodayScore />
      
      <div className="mb-8">
        <TodayChecklist />
      </div>
      
      <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
        {isAllCompleted ? (
          <div className="py-8 bg-primary/10 rounded-xl border border-primary/20">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-black text-primary uppercase mb-2">DAY COMPLETE</h2>
            <h3 className="text-lg font-bold text-textMain uppercase">ANOTHER DAY WON.</h3>
          </div>
        ) : (
          <div className="py-6 border border-border rounded-xl bg-surface">
            <h2 className="text-lg font-bold text-textMain uppercase mb-2">KEEP PUSHING</h2>
            <p className="text-sm text-textMuted font-medium">You still have {totalToday - completedToday} tasks remaining.</p>
          </div>
        )}
      </div>
    </div>
  );
};
