import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import { Save, Plus, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { UnsavedDialog } from '../components/layout/UnsavedDialog';

const FOOD_DATABASE = [
  { name: 'Egg (1 large)', calories: 72, protein: 6, carbs: 0.6, fat: 4.8 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'White Rice (100g cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Whole Milk (100ml)', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Curd/Yogurt (100g)', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 1.2, fat: 20 },
  { name: 'Oats (100g)', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Peanuts (100g)', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2 },
  { name: 'Chana (100g boiled)', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  { name: '2 Chapathis', calories: 200, protein: 6, carbs: 40, fat: 2 },
  { name: '100g Masoor Dal', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: '100g Oats + 50g Muesli + 150ml Milk', calories: 660, protein: 26, carbs: 103, fat: 15 },
  { name: '20 Soya Chunks', calories: 70, protein: 10, carbs: 7, fat: 0.1 },
  { name: '1 Dosa', calories: 170, protein: 4, carbs: 29, fat: 4 },
  { name: '1 Idly', calories: 60, protein: 2, carbs: 12, fat: 0.5 },
  { name: 'Egg Whites (100g)', calories: 52, protein: 11, carbs: 1, fat: 0 },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = () => {
    updateNutrition(today, localNut);
    setIsDirty(false);
    return true;
  };

  const handleDiscard = () => {
    setLocalNut(currentNutrition);
    setIsDirty(false);
  };

  const { blocker } = useUnsavedChanges(isDirty, handleSave, handleDiscard);

  useEffect(() => {
    setLocalNut(currentNutrition);
    setIsDirty(false);
  }, [today, nutrition]);

  const addFood = (food: typeof FOOD_DATABASE[0]) => {
    const updated = {
      ...localNut,
      calories: localNut.calories + food.calories,
      protein: localNut.protein + food.protein,
      carbs: localNut.carbs + food.carbs,
      fat: localNut.fat + food.fat
    };
    setLocalNut(updated);
    setIsDirty(true);
  };

  const macros = [
    { label: 'Calories', current: localNut.calories, target: settings.targetCalories, unit: 'kcal', color: 'bg-primary' },
    { label: 'Protein', current: localNut.protein, target: settings.targetProtein, unit: 'g', color: 'bg-blue-500' },
    { label: 'Carbs', current: localNut.carbs, target: settings.targetCarbs, unit: 'g', color: 'bg-green-500' },
    { label: 'Fat', current: localNut.fat, target: settings.targetFat, unit: 'g', color: 'bg-red-500' },
  ];

  return (
    <div className="pb-24 animate-fade-in relative">
      <UnsavedDialog blocker={blocker} onSave={handleSave} onDiscard={handleDiscard} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">NUTRITION</h1>
          <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">FUEL THE MACHINE</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={!isDirty}
          className={`flex items-center space-x-2 ${isDirty ? 'btn-primary' : 'bg-surfaceHighlight text-textMuted px-6 py-3 rounded-xl font-bold opacity-50 cursor-not-allowed'}`}
        >
          <Save className="w-4 h-4" />
          <span>{isDirty ? 'Save' : 'Saved'}</span>
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
                        onChange={(e) => {
                          setLocalNut({ ...localNut, [field]: Number(e.target.value) });
                          setIsDirty(true);
                        }}
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

        {/* Food Library */}
        <div className="card space-y-4 md:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase">FOOD LIBRARY</h2>
            <div className="relative w-48">
              <input 
                type="text" 
                placeholder="Search food..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg p-2 pl-8 text-sm focus:outline-none focus:border-primary text-white placeholder-textMuted"
              />
              <Search className="w-4 h-4 text-textMuted absolute left-2 top-2.5" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
            {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(food => (
              <button 
                key={food.name}
                onClick={() => addFood(food)}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:border-primary/50 transition-colors group text-left"
              >
                <div>
                  <p className="font-bold text-white text-sm">{food.name}</p>
                  <p className="text-xs text-textMuted mt-0.5">
                    {food.calories}kcal • P:{food.protein}g • C:{food.carbs}g • F:{food.fat}g
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
