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

  const currentProfileId = useAppStore(state => state.currentProfileId);
  const profileName = currentProfileId === 'dhavanesh' ? 'DHAVANESH' : currentProfileId === 'sumith' ? 'SUMITH' : 'MUSAVEER';

  return (
    <div className="mb-8 animate-slide-up">
      <h2 className="text-3xl font-black tracking-tight text-white uppercase mb-1">
        {greeting()}, {profileName}
      </h2>
      <h3 className="text-lg font-bold text-primary tracking-widest mb-8 uppercase">DAY {stats.currentDay} / 100</h3>
      
      <div className="card bg-surface/50 border-border/50">
        <h2 className="text-xl font-black tracking-widest mb-6 uppercase">YOUR ARC</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Progress Ring visual */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surfaceHighlight" />
              <circle 
                cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={2 * Math.PI * 84}
                strokeDashoffset={2 * Math.PI * 84 * (1 - stats.completionPercentage / 100)}
                className="text-primary transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{Math.round(stats.completionPercentage)}%</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 w-full text-center md:text-left">
            <div>
              <p className="text-sm font-bold text-textMuted uppercase tracking-widest mb-1">COMPLETED</p>
              <p className="text-3xl font-black text-white">{stats.currentDay > 0 ? stats.currentDay - 1 : 0} DAYS</p>
            </div>
            <div>
              <p className="text-sm font-bold text-textMuted uppercase tracking-widest mb-1">REMAINING</p>
              <p className="text-3xl font-black text-white">{stats.daysRemaining} DAYS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
