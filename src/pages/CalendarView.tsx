import { useState } from 'react';
import { useAppStore } from '../data/store';
import { getChallengeStats, calculateDayStatus } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import { addDays, parseISO, format } from 'date-fns';
import { Check, X, Lock, Circle, Activity, Droplet, Moon, Utensils, Minus } from 'lucide-react';

export const CalendarView = () => {
  const { settings, taskCompletions, tasks, workouts, nutrition, sleep } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);
  const startDate = parseISO(settings.startDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getBodyweightStats = (date: string) => {
    let pushups = 0;
    let pullups = 0;
    let squats = 0;

    const dayWorkouts = workouts.filter(w => w.date === date);
    dayWorkouts.forEach(w => {
      if (w.bodyweightExercises) {
        w.bodyweightExercises.forEach(bwe => {
          const completedReps = bwe.sets.reduce((total, set) => set.completed ? total + set.reps : total, 0);
          if (bwe.name === 'Pushups') pushups += completedReps;
          if (bwe.name === 'Pullups') pullups += completedReps;
          if (bwe.name === 'Squats') squats += completedReps;
        });
      }
    });

    return { pushups, pullups, squats };
  };

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
              onClick={() => setSelectedDate(d.date)}
              className={cn(
                "cursor-pointer aspect-[3/4] rounded-lg flex flex-col items-center justify-center p-2 text-xs font-bold transition-all border group relative overflow-hidden",
                d.status === 'completed' && "bg-success/20 text-success border-success/50 hover:bg-success/30",
                d.status === 'partial' && "bg-orange-500/10 text-orange-500 border-orange-500/50 hover:bg-orange-500/20",
                d.status === 'failed' && "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20",
                d.status === 'pending' && "bg-surfaceHighlight text-white border-border hover:border-primary/50",
                d.status === 'future' && "bg-surface text-textMuted border-transparent opacity-40 hover:opacity-60"
              )}
            >
              <div className="absolute top-1 right-1">
                {d.status === 'completed' && <Check className="w-4 h-4 text-success drop-shadow-md" strokeWidth={3} />}
                {d.status === 'partial' && <Minus className="w-4 h-4 text-orange-500" strokeWidth={3} />}
                {d.status === 'failed' && <X className="w-4 h-4 text-red-500" strokeWidth={3} />}
                {d.status === 'pending' && <Circle className="w-3 h-3 text-primary animate-pulse" strokeWidth={3} />}
                {d.status === 'future' && <Lock className="w-3 h-3 text-textMuted" />}
              </div>

              <span className="opacity-60 text-[10px] tracking-widest uppercase truncate w-full text-center mt-2">{format(parseISO(d.date), 'MMM d')}</span>
              <span className="text-xl font-black mt-1">{d.day}</span>

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
            <Minus className="w-4 h-4 text-orange-500" strokeWidth={3} />
            <span>Partial</span>
          </div>
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-red-500" strokeWidth={3} />
            <span>Missed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-4 h-4 text-primary" strokeWidth={3} />
            <span>Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-textMuted" />
            <span>Future</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedDate(null)}>
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">{format(parseISO(selectedDate), 'dd/MM/yyyy')}</h2>
              <button onClick={() => setSelectedDate(null)} className="text-textMuted hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="font-bold tracking-widest uppercase text-sm">Workouts</span>
                </div>
                <span className="font-black text-white">
                  {workouts.filter(w => w.date === selectedDate).length} session(s)
                </span>
              </div>

              {(() => {
                const bwStats = getBodyweightStats(selectedDate);
                if (bwStats.pushups > 0 || bwStats.pullups > 0 || bwStats.squats > 0) {
                  return (
                    <div className="p-4 bg-surfaceHighlight rounded-xl border border-border space-y-2">
                      <div className="flex items-center space-x-3 mb-3">
                        <Activity className="w-5 h-5 text-primary" />
                        <span className="font-bold tracking-widest uppercase text-sm">Bodyweight Basics</span>
                      </div>
                      {bwStats.pushups > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-textMuted uppercase tracking-wider font-bold">Pushups</span>
                          <span className="text-white font-black">{bwStats.pushups} reps</span>
                        </div>
                      )}
                      {bwStats.pullups > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-textMuted uppercase tracking-wider font-bold">Pullups</span>
                          <span className="text-white font-black">{bwStats.pullups} reps</span>
                        </div>
                      )}
                      {bwStats.squats > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-textMuted uppercase tracking-wider font-bold">Squats</span>
                          <span className="text-white font-black">{bwStats.squats} reps</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <span className="font-bold tracking-widest uppercase text-sm">Calories</span>
                </div>
                <span className="font-black text-white">
                  {nutrition[selectedDate]?.calories || 0} kcal
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <Utensils className="w-5 h-5 text-red-500" />
                  <span className="font-bold tracking-widest uppercase text-sm">Protein</span>
                </div>
                <span className="font-black text-white">
                  {nutrition[selectedDate]?.protein || 0}g
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-blue-400" />
                  <span className="font-bold tracking-widest uppercase text-sm">Sleep</span>
                </div>
                <span className="font-black text-white">
                  {sleep[selectedDate]?.hours || 0} hrs
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <Droplet className="w-5 h-5 text-blue-500" />
                  <span className="font-bold tracking-widest uppercase text-sm">Water</span>
                </div>
                <span className="font-black text-white">
                  {nutrition[selectedDate]?.water || 0} ml
                </span>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
