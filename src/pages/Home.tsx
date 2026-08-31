import { useNavigate } from 'react-router-dom';
import { useRootStore } from '../data/store';
import { getChallengeStats, calculateStreak } from '../lib/dateUtils';
import { ArrowRight } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const profiles = useRootStore(state => state.profiles);
  const switchProfile = useRootStore(state => state.switchProfile);

  const handleSelectProfile = (id: string) => {
    switchProfile(id);
    navigate(`/profile/${id}/today`);
  };

  const getProfileStats = (profileId: string) => {
    const profile = profiles[profileId];
    if (!profile) return { currentDay: 0, percentComplete: 0, streak: 0 };
    const stats = getChallengeStats(profile.settings.startDate, profile.settings.endDate);
    const streak = calculateStreak(profile.manualDayCompletions);
    return {
      currentDay: stats.currentDay,
      percentComplete: stats.completionPercentage,
      streak
    };
  };

  const musaveerStats = getProfileStats('musaveer');
  const dhavaneshStats = getProfileStats('dhavanesh');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-textMain mb-3">WINTER ARC</h1>
        <p className="text-sm md:text-base font-medium tracking-widest text-textMuted uppercase">100 DAYS. TWO JOURNEYS. ONE GOAL.</p>
        <p className="text-xs md:text-sm font-semibold tracking-widest text-primary mt-6">CHOOSE YOUR ARC.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-4xl px-4">
        
        {/* Musaveer Card */}
        <button 
          onClick={() => handleSelectProfile('musaveer')}
          className="flex-1 group relative bg-surface border border-border hover:border-primary/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-textMain mb-1 uppercase">Musaveer</h2>
            <p className="text-sm font-bold tracking-widest text-primary mb-8">MY WINTER ARC</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-xs text-textMuted font-medium uppercase tracking-wider mb-1">Progress</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold">Day {musaveerStats.currentDay}/100</span>
                  <span className="text-sm text-textMuted mb-1">({Math.round(musaveerStats.percentComplete)}%)</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-textMuted font-medium uppercase tracking-wider mb-1">Current Streak</p>
                <div className="flex items-center space-x-2 text-orange-500 font-bold">
                  <span>🔥</span>
                  <span>{musaveerStats.streak} DAYS</span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm font-bold tracking-wider text-textMain group-hover:text-primary transition-colors">
              ENTER MY ARC <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        {/* Dhavanesh Card */}
        <button 
          onClick={() => handleSelectProfile('dhavanesh')}
          className="flex-1 group relative bg-surface border border-border hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-textMain mb-1 uppercase">Dhavanesh</h2>
            <p className="text-sm font-bold tracking-widest text-blue-500 mb-8">HIS WINTER ARC</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-xs text-textMuted font-medium uppercase tracking-wider mb-1">Progress</p>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold">Day {dhavaneshStats.currentDay}/100</span>
                  <span className="text-sm text-textMuted mb-1">({Math.round(dhavaneshStats.percentComplete)}%)</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-textMuted font-medium uppercase tracking-wider mb-1">Current Streak</p>
                <div className="flex items-center space-x-2 text-orange-500 font-bold">
                  <span>🔥</span>
                  <span>{dhavaneshStats.streak} DAYS</span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm font-bold tracking-wider text-textMain group-hover:text-blue-500 transition-colors">
              ENTER DHAVANESH'S ARC <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

      </div>
    </div>
  );
};
