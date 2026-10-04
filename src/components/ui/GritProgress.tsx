import { useAppStore } from '../../data/store';
import { getXPForNextLevel } from '../../lib/grit';

export const GritProgress = () => {
  const { grit } = useAppStore();
  const currentLevel = grit.currentLevel;
  const totalXP = grit.totalXP;
  
  // Calculate base XP of the current level to find relative progress
  let baseXP = 0;
  if (currentLevel > 1) {
     let temp = 0;
     let tempLevel = 1;
     // simple back calculation
     while (tempLevel < currentLevel) {
        temp = getXPForNextLevel(tempLevel);
        tempLevel++;
     }
     baseXP = temp;
  }
  
  const nextXP = getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = totalXP - baseXP;
  const xpRequiredForNextLevel = nextXP - baseXP;
  const progressPercent = Math.max(0, Math.min(100, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  const remainingXP = nextXP - totalXP;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-textMuted uppercase mb-1">Current Status</p>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Level {currentLevel}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold tracking-widest text-textMuted uppercase mb-1">Total GRIT</p>
          <p className="text-2xl font-black text-primary">{totalXP.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="w-full h-3 bg-background rounded-full overflow-hidden mb-3 border border-border">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs font-bold tracking-wider text-textMuted uppercase">
        <span>{remainingXP.toLocaleString()} GRIT to Level {currentLevel + 1}</span>
        <span>{nextXP.toLocaleString()}</span>
      </div>
    </div>
  );
};
