import { useAppStore } from '../../data/store';
import { getTodayStr, calculateDayStatus } from '../../lib/dateUtils';
import { cn } from '../../lib/utils';
import { Check, Circle, X } from 'lucide-react';

export const TodayScore = () => {
  const { tasks, taskCompletions } = useAppStore();
  const today = getTodayStr();

  const { status, completedCount, totalCount } = calculateDayStatus(today, tasks, taskCompletions);

  return (
    <div className="card mb-6 flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div>
        <h3 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-1">Today's Status</h3>
        <div className="flex items-baseline space-x-4 mb-2">
          <span className={cn(
            "text-4xl font-black uppercase tracking-tight",
            status === 'completed' ? "text-success" : status === 'failed' ? "text-red-500" : "text-white"
          )}>
            {status === 'completed' ? 'COMPLETE' : status === 'failed' ? 'MISSED' : 'ACTIVE'}
          </span>
        </div>
        <div className="text-sm font-medium text-textMuted uppercase tracking-wider">
          Tasks Completed: {completedCount} / {totalCount}
        </div>
      </div>
      
      {/* Visual icon for status */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surfaceHighlight border border-border">
        {status === 'completed' && <Check className="w-8 h-8 text-success" strokeWidth={3} />}
        {status === 'failed' && <X className="w-8 h-8 text-red-500" strokeWidth={3} />}
        {status === 'pending' && <Circle className="w-8 h-8 text-primary animate-pulse" strokeWidth={3} />}
      </div>
    </div>
  );
};

export const TodayChecklist = () => {
  const { tasks, taskCompletions, toggleTaskCompletion } = useAppStore();
  const today = getTodayStr();
  const dayOfWeek = new Date().getDay();

  const todayTasks = tasks.filter(t => {
    if (t.frequency === 'daily') return true;
    if (t.frequency === 'specific_days' && t.daysOfWeek?.includes(dayOfWeek)) return true;
    return false;
  });

  const isTaskCompleted = (taskId: string) => {
    return taskCompletions.some(tc => tc.taskId === taskId && tc.date === today && tc.completed);
  };

  const categories = Array.from(new Set(todayTasks.map(t => t.category)));

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-lg font-bold tracking-widest mb-4">TODAY</h2>
      <div className="space-y-6">
        {categories.map(category => {
          const categoryTasks = todayTasks.filter(t => t.category === category);
          
          return (
            <div key={category}>
              <h3 className="text-xs font-bold tracking-widest text-textMuted mb-3 uppercase">{category}</h3>
              <div className="space-y-2">
                {categoryTasks.map(task => {
                  const completed = isTaskCompleted(task.id);
                  
                  return (
                    <div 
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task.id, today)}
                      className={cn(
                        "flex items-center p-3 rounded-lg border transition-all cursor-pointer group",
                        completed 
                          ? "bg-surfaceHighlight/50 border-transparent" 
                          : "bg-surface border-border hover:border-primary/50"
                      )}
                    >
                      <button className="mr-4 flex-shrink-0 focus:outline-none">
                        {completed ? (
                          <div className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center checkbox-animate">
                            <Check className="w-4 h-4" strokeWidth={3} />
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-textMuted group-hover:text-primary transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <span className={cn(
                          "font-medium transition-colors",
                          completed ? "text-textMuted line-through" : "text-textMain"
                        )}>
                          {task.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
