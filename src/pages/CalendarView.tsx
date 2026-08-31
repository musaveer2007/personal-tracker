import { useAppStore } from '../data/store';
import { getChallengeStats } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import { addDays, parseISO, format } from 'date-fns';

export const CalendarView = () => {
  const { settings, taskCompletions, tasks, manualDayCompletions, toggleManualDayCompletion } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);
  const startDate = parseISO(settings.startDate);

  const days = Array.from({ length: 100 }, (_, i) => {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Calculate completion for this specific day
    const dayOfWeek = date.getDay();
    const dayTasks = tasks.filter(t => {
      if (t.frequency === 'daily') return true;
      if (t.frequency === 'specific_days' && t.daysOfWeek?.includes(dayOfWeek)) return true;
      return false;
    });

    const completed = taskCompletions.filter(tc => tc.date === dateStr && tc.completed).length;
    const total = dayTasks.length;
    
    let status = 'future';
    
    // Manual override check
    if (manualDayCompletions && manualDayCompletions[dateStr]) {
      status = 'completed';
    } else {
      if (i < stats.daysCompleted) {
        if (total === 0) status = 'completed';
        else if (completed === total) status = 'completed';
        else if (completed > 0) status = 'partial';
        else status = 'missed';
      } else if (i === stats.daysCompleted && stats.status === 'active') {
        if (total > 0 && completed === total) status = 'completed';
        else status = 'today';
      }
    }

    return {
      day: i + 1,
      date: dateStr,
      status
    };
  });

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">CALENDAR</h1>
        <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">100 DAYS</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {days.map(d => (
            <div 
              key={d.day}
              onClick={() => toggleManualDayCompletion(d.date)}
              title={`Day ${d.day} - ${d.date}`}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all border cursor-pointer hover:scale-105 active:scale-95",
                d.status === 'completed' && "bg-primary text-black border-primary",
                d.status === 'partial' && "bg-primary/20 text-primary border-primary/50",
                d.status === 'missed' && "bg-surfaceHighlight text-textMuted border-border",
                d.status === 'today' && "bg-surface text-white border-primary border-2",
                d.status === 'future' && "bg-surface text-textMuted border-border opacity-50"
              )}
            >
              {d.day}
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs font-bold tracking-widest text-textMuted uppercase">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary"></div>
            <span>Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/50"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-surfaceHighlight border border-border"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-sm bg-surface border-2 border-primary"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
