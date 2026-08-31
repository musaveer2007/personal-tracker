import { getChallengeStats } from '../../lib/dateUtils';
import { useAppStore } from '../../data/store';

export const DashboardHero = () => {
  const { settings } = useAppStore();
  const stats = getChallengeStats(settings.startDate, settings.endDate);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div className="mb-8 animate-slide-up">
      <p className="text-textMuted text-xs font-bold tracking-widest mb-2">{greeting()}</p>
      
      {stats.status === 'upcoming' ? (
        <>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase">
            THE ARC BEGINS IN {stats.daysUntilStart} DAYS
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-textMuted tracking-tight">PREPARE YOUR MIND.</h2>
        </>
      ) : stats.status === 'completed' ? (
        <>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase">
            100 DAYS COMPLETE
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-textMuted tracking-tight">YOU DID IT.</h2>
        </>
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase">
            DAY {stats.currentDay} / 100
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-textMuted tracking-tight mb-1">BUILDING THE BODY.</h2>
          <h2 className="text-xl md:text-2xl font-bold text-textMuted tracking-tight mb-8">BUILDING THE MIND.</h2>

          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs font-bold tracking-widest">
                <span className="text-primary">{stats.completionPercentage}% OF THE ARC COMPLETE</span>
                <span className="text-textMuted">{stats.daysRemaining} DAYS REMAINING</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
