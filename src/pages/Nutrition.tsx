import React, { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Save, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export const Nutrition = () => {
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

  const [localNut, setLocalNut] = useState(currentNutrition);

  useEffect(() => {
    setLocalNut(currentNutrition);
  }, [today, nutrition]); // Note: keeping dependencies minimal to avoid constant re-renders during typing

  const handleSave = () => {
    updateNutrition(today, localNut);
  };

  const addWater = (amount: number) => {
    const updated = { ...localNut, water: localNut.water + amount };
    setLocalNut(updated);
    updateNutrition(today, updated); // Auto save water since it's a quick action
  };

  const macros = [
    { label: 'Calories', current: localNut.calories, target: settings.targetCalories, unit: 'kcal', color: 'bg-primary' },
    { label: 'Protein', current: localNut.protein, target: settings.targetProtein, unit: 'g', color: 'bg-blue-500' },
    { label: 'Carbs', current: localNut.carbs, target: settings.targetCarbs, unit: 'g', color: 'bg-green-500' },
    { label: 'Fat', current: localNut.fat, target: settings.targetFat, unit: 'g', color: 'bg-red-500' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">NUTRITION</h1>
          <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">FUEL THE MACHINE</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Macros */}
        <div className="card space-y-6">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">MACROS</h2>
          
          <div className="space-y-4">
            {macros.map(m => {
              const percentage = Math.min(100, Math.round((m.current / m.target) * 100)) || 0;
              const field = m.label.toLowerCase() as keyof typeof localNut;
              
              return (
                <div key={m.label}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold tracking-widest text-textMain uppercase">{m.label}</span>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number"
                        value={localNut[field] || ''}
                        onChange={(e) => setLocalNut({ ...localNut, [field]: Number(e.target.value) })}
                        className="w-16 bg-transparent border-b border-border text-right font-bold text-white focus:outline-none focus:border-primary"
                        placeholder="0"
                      />
                      <span className="text-xs font-bold text-textMuted uppercase w-16">/ {m.target} {m.unit}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500", m.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Water */}
        <div className="card space-y-6 flex flex-col">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">WATER TRACKER</h2>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surfaceHighlight" />
                <circle 
                  cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - Math.min(1, localNut.water / settings.targetWater))}
                  className="text-blue-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{localNut.water}</span>
                <span className="text-sm font-bold text-textMuted tracking-widest uppercase">/ {settings.targetWater} ml</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={() => addWater(250)} className="btn-secondary rounded-full flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>250 ml</span>
              </button>
              <button onClick={() => addWater(500)} className="btn-secondary rounded-full flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>500 ml</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
