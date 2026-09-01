import { useAppStore } from '../data/store';
import { getChallengeStats, calculateDayStatus } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import { addDays, parseISO, format } from 'date-fns';
import { Check, X, Lock, Circle } from 'lucide-react';

export const CalendarView = () => {
  const { settings, taskCompletions, tasks } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);
  const startDate = parseISO(settings.startDate);

  const days = Array.from({ length: 100 }, (_, i) => {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const { status, completedCount, totalCount } = calculateDayStatus(dateStr, tasks, taskCompletions);

    return {
      day: i + 1,
      date: dateStr,
      dateDisplay: format(date, 'EEE MMM d'),
      status,
      completedCount,
      totalCount
    };
  });

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">CALENDAR</h1>
        <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">DAY {stats.currentDay > 100 ? 100 : stats.currentDay} / 100</p>
      </div>

      <div className="card mb-8">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
          {days.map(d => (
            <div 
              key={d.day}
              title={`${d.dateDisplay} - ${d.completedCount}/${d.totalCount} Tasks`}
              className={cn(
                "aspect-[3/4] rounded-lg flex flex-col items-center justify-between p-2 text-xs font-bold transition-all border group relative overflow-hidden",
                d.status === 'completed' && "bg-success/20 text-success border-success/50",
                d.status === 'failed' && "bg-red-500/10 text-red-500 border-red-500/30",
                d.status === 'pending' && "bg-surfaceHighlight text-white border-border",
                d.status === 'future' && "bg-surface text-textMuted border-transparent opacity-40"
              )}
            >
              <span className="opacity-60 text-[10px] tracking-widest uppercase truncate w-full text-center">{format(parseISO(d.date), 'MMM d')}</span>
              <span className="text-xl font-black">{d.day}</span>
              
              <div className="mt-1">
                {d.status === 'completed' && <Check className="w-5 h-5 text-success drop-shadow-md" strokeWidth={3} />}
                {d.status === 'failed' && <X className="w-5 h-5 text-red-500" strokeWidth={3} />}
                {d.status === 'pending' && <Circle className="w-4 h-4 text-primary animate-pulse" strokeWidth={3} />}
                {d.status === 'future' && <Lock className="w-4 h-4 text-textMuted" />}
              </div>

              {/* Progress bar line for partial / pending */}
              {(d.status === 'pending' || d.status === 'failed') && d.totalCount > 0 && d.completedCount > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${(d.completedCount / d.totalCount) * 100}%` }}></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs font-bold tracking-widest text-textMuted uppercase">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-success" strokeWidth={3} />
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-red-500" strokeWidth={3} />
            <span>Failed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-4 h-4 text-primary" strokeWidth={3} />
            <span>Pending (Today)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-textMuted" />
            <span>Future</span>
          </div>
        </div>
      </div>
    </div>
  );
};
