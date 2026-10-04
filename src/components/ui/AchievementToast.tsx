import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import type { AchievementDef } from '../../lib/achievements';

export const AchievementToast = () => {
  const [achievements, setAchievements] = useState<AchievementDef[]>([]);

  useEffect(() => {
    const handleAchievementUnlocked = (e: any) => {
      const { achievement } = e.detail;
      setAchievements(current => [...current, achievement]);
      
      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setAchievements(current => current.filter(a => a.code !== achievement.code));
      }, 6000);
    };

    window.addEventListener('achievement-unlocked', handleAchievementUnlocked);
    return () => window.removeEventListener('achievement-unlocked', handleAchievementUnlocked);
  }, []);

  if (achievements.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-4 pointer-events-none w-full max-w-sm px-4">
      {achievements.map((achievement) => (
        <div 
          key={achievement.code}
          className="animate-in slide-in-from-top-10 fade-in duration-500 bg-surfaceHighlight border border-primary/50 rounded-2xl p-4 shadow-2xl shadow-primary/30 backdrop-blur-xl flex flex-col items-center text-center relative pointer-events-auto"
        >
          <button 
            onClick={() => setAchievements(current => current.filter(a => a.code !== achievement.code))}
            className="absolute top-2 right-2 text-textMuted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          
          <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase mb-1">
            Achievement Unlocked
          </p>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            {achievement.name}
          </h3>
          <p className="text-sm font-medium text-textMuted mb-3">
            {achievement.description}
          </p>
          
          <div className="px-3 py-1 bg-background rounded-full border border-border">
            <span className="text-[9px] font-bold tracking-widest text-textMuted uppercase">
              Rarity: <span className={
                achievement.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                achievement.rarity === 'EPIC' ? 'text-purple-400' :
                achievement.rarity === 'RARE' ? 'text-blue-400' :
                achievement.rarity === 'UNCOMMON' ? 'text-green-400' : 'text-gray-400'
              }>{achievement.rarity}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
