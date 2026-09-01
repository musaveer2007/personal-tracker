import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Check, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

export const Skincare = () => {
  const { tasks, taskCompletions, toggleTaskCompletion } = useAppStore();
  const today = getTodayStr();
  const dayOfWeek = new Date().getDay();

  const skincareTasks = tasks.filter(t => 
    t.name.toLowerCase().includes('skincare') &&
    (t.frequency === 'daily' || (t.frequency === 'specific_days' && t.daysOfWeek?.includes(dayOfWeek)))
  );

  const isTaskCompleted = (taskId: string) => {
    return taskCompletions.some(tc => tc.taskId === taskId && tc.date === today && tc.completed);
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">SKINCARE</h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">MORNING AND NIGHT ROUTINE</p>
      </div>
      
      <div className="card space-y-6">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">TODAY'S ROUTINE</h2>
        <div className="space-y-4">
          {skincareTasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-sm text-textMuted font-bold uppercase tracking-widest">NO SKINCARE ROUTINE SCHEDULED TODAY</p>
            </div>
          ) : (
            skincareTasks.map(task => {
              const completed = isTaskCompleted(task.id);
              return (
                <div 
                  key={task.id}
                  onClick={() => toggleTaskCompletion(task.id, today)}
                  className={cn(
                    "flex items-center p-4 rounded-xl border transition-all cursor-pointer group",
                    completed 
                      ? "bg-surfaceHighlight/50 border-transparent" 
                      : "bg-surface border-border hover:border-primary/50"
                  )}
                >
                  <button className="mr-4 flex-shrink-0 focus:outline-none">
                    {completed ? (
                      <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center checkbox-animate">
                        <Check className="w-5 h-5" strokeWidth={3} />
                      </div>
                    ) : (
                      <Circle className="w-8 h-8 text-textMuted group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1">
                    <span className={cn(
                      "font-bold transition-colors text-lg",
                      completed ? "text-textMuted line-through" : "text-white"
                    )}>
                      {task.name}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
