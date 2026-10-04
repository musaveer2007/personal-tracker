import { getChallengeStats, calculateStreak } from '../../lib/dateUtils';
import { useAppStore } from '../../data/store';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Flame, Trophy, Medal, Crown } from 'lucide-react';
import { getLevelTitle } from '../../lib/grit';
import { leaderboardService } from '../../lib/leaderboard';

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
  const { displayName, username, grit, tasks, taskCompletions } = useAppStore();
  const profileName = displayName || username || (currentProfileId === 'dhavanesh' ? 'DHAVANESH' : currentProfileId === 'sumith' ? 'SUMITH' : 'MUSAVEER');
  
  const currentStreak = calculateStreak(tasks, taskCompletions);
  const [achievementCount, setAchievementCount] = useState(0);
  const [league, setLeague] = useState<string>('BRONZE');
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!currentProfileId) return;
    supabase
      .from('user_achievements')
      .select('id', { count: 'exact' })
      .eq('profile_id', currentProfileId)
      .then(({ count }) => {
        if (count !== null) setAchievementCount(count);
      });
      
    leaderboardService.getLeaderboard('GLOBAL', 'THIS_WEEK').then(entries => {
      const me = entries.find(e => e.profile_id === currentProfileId);
      if (me) {
        setLeague(me.league);
        setRank(me.rank);
      }
    }).catch(console.error);
  }, [currentProfileId]);

  return (
    <div className="mb-8 animate-slide-up flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-1 w-full">
        <h2 className="text-3xl font-black tracking-tight text-white uppercase mb-1">
          {greeting()}, {profileName}
        </h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 mb-8">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-textMuted tracking-widest uppercase">Level {grit.currentLevel}</span>
            <span className="text-lg font-black text-primary uppercase">{getLevelTitle(grit.currentLevel)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-bold text-textMuted tracking-widest uppercase">Lifetime Grit</span>
            <span className="text-lg font-black text-white uppercase">{grit.totalXP.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-bold text-textMuted tracking-widest uppercase">Momentum</span>
            <span className="text-lg font-black text-orange-500 uppercase flex items-center gap-1">
              <Flame className="w-4 h-4" /> {currentStreak} Day Streak
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-bold text-textMuted tracking-widest uppercase">Legacy</span>
            <span className="text-lg font-black text-yellow-500 uppercase flex items-center gap-1">
              <Trophy className="w-4 h-4" /> {achievementCount} Unlocked
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-textMuted tracking-widest uppercase">League</span>
            <span className="text-lg font-black text-blue-400 uppercase flex items-center gap-1">
              <Crown className="w-4 h-4" /> {league}
            </span>
          </div>

          {rank !== null && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-textMuted tracking-widest uppercase">Global Rank</span>
              <span className="text-lg font-black text-white uppercase flex items-center gap-1">
                <Medal className="w-4 h-4 text-primary" /> #{rank}
              </span>
            </div>
          )}
        </div>
      <h3 className="text-lg font-bold text-primary tracking-widest mb-8 uppercase">DAY {stats.currentDay} / {stats.totalDays}</h3>
      
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
    </div>
  );
};
