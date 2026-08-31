import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import type { JournalEntry } from '../data/types';
import { Save } from 'lucide-react';
import { cn } from '../lib/utils';

export const Journal = () => {
  const { journal, updateJournal } = useAppStore();
  const today = getTodayStr();

  const currentJournal = journal[today] || {
    date: today,
    mood: 'average',
    content: '',
    energy: 3
  };

  const [localJournal, setLocalJournal] = useState<JournalEntry>(currentJournal);

  useEffect(() => {
    setLocalJournal(currentJournal);
  }, [today, journal]);

  const handleSave = () => {
    updateJournal(today, localJournal);
  };

  const moods = [
    { value: 'excellent', label: '🔥 Excellent' },
    { value: 'good', label: '🙂 Good' },
    { value: 'average', label: '😐 Average' },
    { value: 'tired', label: '😴 Tired' },
    { value: 'difficult', label: '😓 Difficult' }
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">JOURNAL</h1>
          <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">THE MIND</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="card space-y-6">
        <div>
          <label className="text-xs font-bold tracking-widest text-textMuted uppercase block mb-3">HOW DID TODAY GO?</label>
          <div className="flex flex-wrap gap-2">
            {moods.map(m => (
              <button
                key={m.value}
                onClick={() => setLocalJournal({ ...localJournal, mood: m.value as any })}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors border",
                  localJournal.mood === m.value 
                    ? "bg-primary/20 text-primary border-primary" 
                    : "bg-surfaceHighlight text-textMuted border-border hover:bg-surfaceHighlight/80"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold tracking-widest text-textMuted uppercase block mb-3">ENERGY LEVEL: {localJournal.energy}/5</label>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={localJournal.energy}
            onChange={(e) => setLocalJournal({ ...localJournal, energy: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="text-xs font-bold tracking-widest text-textMuted uppercase block mb-3">NOTES</label>
          <textarea 
            value={localJournal.content}
            onChange={(e) => setLocalJournal({ ...localJournal, content: e.target.value })}
            className="w-full bg-surfaceHighlight border border-border rounded-lg p-4 text-white focus:outline-none focus:border-primary min-h-[200px]"
            placeholder="Record your thoughts, lessons, or struggles today..."
          />
        </div>
      </div>
    </div>
  );
};
