import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Plus, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Water = () => {
  const { settings, nutrition, updateNutrition } = useAppStore();
  const today = getTodayStr();

  const currentNutrition = nutrition[today] || {
    date: today,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0
  };

  const [localWater, setLocalWater] = useState(currentNutrition.water);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    setLocalWater(currentNutrition.water);
  }, [today, nutrition]);

  const addWater = (amount: number) => {
    const newWater = localWater + amount;
    setLocalWater(newWater);
    setHistory([...history, localWater]);
    updateNutrition(today, { ...currentNutrition, water: newWater });
  };

  const undo = () => {
    if (history.length > 0) {
      const prevWater = history[history.length - 1];
      setLocalWater(prevWater);
      setHistory(history.slice(0, -1));
      updateNutrition(today, { ...currentNutrition, water: prevWater });
    }
  };

  const percentage = Math.min(100, Math.round((localWater / settings.targetWater) * 100)) || 0;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">HYDRATION</h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">TRACK YOUR WATER INTAKE</p>
      </div>
      
      <div className="card flex flex-col items-center justify-center p-12 mb-8">
        <div className="relative w-64 h-64 mb-12">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="128" cy="128" r="116" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surfaceHighlight" />
            <circle 
              cx="128" cy="128" r="116" stroke="currentColor" strokeWidth="12" fill="transparent" 
              strokeDasharray={2 * Math.PI * 116}
              strokeDashoffset={2 * Math.PI * 116 * (1 - percentage / 100)}
              className="text-blue-500 transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white">{localWater}</span>
            <span className="text-lg font-bold text-textMuted tracking-widest uppercase">/ {settings.targetWater} ML</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button onClick={() => addWater(250)} className="btn-secondary rounded-full flex items-center space-x-2 px-6 py-3">
            <Plus className="w-5 h-5 text-blue-500" />
            <span className="text-lg">+250 ml</span>
          </button>
          <button onClick={() => addWater(500)} className="btn-secondary rounded-full flex items-center space-x-2 px-6 py-3">
            <Plus className="w-5 h-5 text-blue-500" />
            <span className="text-lg">+500 ml</span>
          </button>
          <button onClick={() => addWater(750)} className="btn-secondary rounded-full flex items-center space-x-2 px-6 py-3">
            <Plus className="w-5 h-5 text-blue-500" />
            <span className="text-lg">+750 ml</span>
          </button>
        </div>
        
        {history.length > 0 && (
          <button onClick={undo} className="text-textMuted hover:text-white transition-colors flex items-center text-sm font-bold uppercase tracking-widest">
            <RotateCcw className="w-4 h-4 mr-2" /> UNDO LAST ENTRY
          </button>
        )}
      </div>
    </div>
  );
};
