import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ACHIEVEMENTS } from '../lib/achievements';
import type { Category } from '../lib/achievements';
import { Trophy, CheckCircle, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useRootStore } from '../data/store';

export const Achievements = () => {
  const { user } = useAuthStore();
  const currentProfileId = useRootStore(state => state.currentProfileId);
  const targetId = user?.id || currentProfileId;
  
  const [unlockedCodes, setUnlockedCodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    if (!targetId) return;

    const fetchAchievements = async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_code')
        .eq('profile_id', targetId);
      
      if (data) {
        setUnlockedCodes(new Set(data.map(d => d.achievement_code)));
      }
      setIsLoading(false);
    };

    fetchAchievements();

    const channel = supabase
      .channel('public:user_achievements')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'user_achievements',
        filter: `profile_id=eq.${targetId}`
      }, (payload) => {
        const newCode = (payload.new as any).achievement_code;
        setUnlockedCodes(prev => new Set(prev).add(newCode));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId]);

  const allAchievements = Object.values(ACHIEVEMENTS);
  const categories = ['All', ...Array.from(new Set(allAchievements.map(a => a.category)))];

  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'All') return allAchievements;
    return allAchievements.filter(a => a.category === activeCategory);
  }, [activeCategory, allAchievements]);

  if (isLoading) {
    return <div className="p-8 text-center text-textMuted uppercase tracking-widest font-bold">Loading...</div>;
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">ACHIEVEMENTS</h1>
          <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">EARN YOUR BADGES</p>
        </div>
        <div className="bg-surfaceHighlight/50 border border-border px-4 py-2 rounded-lg text-center">
          <p className="text-xl font-black text-primary">{unlockedCodes.size} <span className="text-sm text-textMuted">/ {allAchievements.length}</span></p>
        </div>
      </div>
      
      <div className="flex overflow-x-auto space-x-2 mb-8 pb-2 no-scrollbar">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as Category | 'All')}
            className={cn(
              "px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-colors",
              activeCategory === category 
                ? "bg-primary text-background" 
                : "bg-surface border border-border text-textMuted hover:text-white"
            )}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map(achievement => {
          const isUnlocked = unlockedCodes.has(achievement.code);
          
          return (
            <div 
              key={achievement.code}
              className={cn(
                "p-6 rounded-xl border flex flex-col gap-4 transition-all duration-300 relative overflow-hidden",
                isUnlocked 
                  ? "bg-surface border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:border-primary/60" 
                  : "bg-surface/30 border-border opacity-60"
              )}
            >
              <div className="flex items-start gap-4 z-10">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border",
                  isUnlocked ? "bg-primary/20 border-primary/30 text-primary shadow-inner shadow-primary/20" : "bg-surfaceHighlight border-border text-textMuted"
                )}>
                  {isUnlocked ? <Trophy className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <h3 className={cn(
                    "font-black tracking-widest uppercase mb-1",
                    isUnlocked ? "text-white" : "text-textMuted"
                  )}>{achievement.name}</h3>
                  <p className="text-sm font-medium text-textMuted">{isUnlocked ? achievement.description : 'Locked'}</p>
                </div>

                {isUnlocked && (
                  <div className="ml-auto">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>

              <div className="mt-auto pt-2 border-t border-border/50 flex justify-between items-center z-10">
                <span className="text-[9px] font-bold tracking-widest text-textMuted uppercase">
                  {achievement.category}
                </span>
                <span className={cn(
                  "text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm bg-background",
                  achievement.rarity === 'LEGENDARY' ? 'text-yellow-400 border border-yellow-400/30' :
                  achievement.rarity === 'EPIC' ? 'text-purple-400 border border-purple-400/30' :
                  achievement.rarity === 'RARE' ? 'text-blue-400 border border-blue-400/30' :
                  achievement.rarity === 'UNCOMMON' ? 'text-green-400 border border-green-400/30' : 'text-gray-400 border border-gray-400/30'
                )}>
                  {achievement.rarity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
