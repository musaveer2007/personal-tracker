import { useState, useEffect } from 'react';
import { useAppStore } from '../data/store';
import { getTodayStr } from '../lib/dateUtils';
import type { Workout as WorkoutType, WorkoutExercise } from '../data/types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Check, Save } from 'lucide-react';
import { cn } from '../lib/utils';

const WORKOUT_SCHEDULE: Record<number, string> = {
  1: 'Chest + Shoulders + Triceps',
  2: 'Back + Biceps',
  3: 'Legs',
  4: 'Run + Mobility',
  5: 'Upper Body Aesthetic',
  6: 'Lower Body + Athletic',
  0: 'Recovery',
};

export const Workout = () => {
  const { workouts, saveWorkout } = useAppStore();
  const today = getTodayStr();
  const dayOfWeek = new Date().getDay();
  const expectedWorkoutName = WORKOUT_SCHEDULE[dayOfWeek];

  const getPreviousPerformance = (exerciseName: string) => {
    if (!exerciseName) return null;
    const pastWorkouts = workouts.filter(w => w.date !== today);
    for (let i = pastWorkouts.length - 1; i >= 0; i--) {
      const ex = pastWorkouts[i].exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (ex && ex.sets.some(s => s.completed)) {
        // Find best set (highest weight)
        const bestSet = ex.sets.reduce((best, current) => {
          if (!current.completed) return best;
          return (current.weight > best.weight) ? current : best;
        }, { weight: 0, reps: 0 });
        if (bestSet.weight > 0) return bestSet;
      }
    }
    return null;
  };

  const calculateExerciseStats = (exercise: WorkoutExercise) => {
    let volume = 0;
    let e1rm = 0;
    exercise.sets.forEach(set => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        volume += set.weight * set.reps;
        const setE1rm = set.weight * (1 + set.reps / 30);
        if (setE1rm > e1rm) e1rm = setE1rm;
      }
    });
    return { volume, e1rm: Math.round(e1rm) };
  };

  const [currentWorkout, setCurrentWorkout] = useState<WorkoutType | null>(null);

  useEffect(() => {
    const existing = workouts.find(w => w.date === today);
    if (existing) {
      setCurrentWorkout(existing);
    } else {
      setCurrentWorkout({
        id: uuidv4(),
        date: today,
        name: expectedWorkoutName,
        exercises: [],
        completed: false,
      });
    }
  }, [workouts, today, expectedWorkoutName]);

  const addExercise = () => {
    if (!currentWorkout) return;
    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      name: '',
      targetSets: 4,
      targetReps: '8-12',
      sets: Array(4).fill(null).map(() => ({ id: uuidv4(), weight: 0, reps: 0, completed: false }))
    };
    const updated = { ...currentWorkout, exercises: [...currentWorkout.exercises, newExercise] };
    setCurrentWorkout(updated);
  };

  const updateExercise = (exerciseId: string, field: string, value: any) => {
    if (!currentWorkout) return;
    const updated = {
      ...currentWorkout,
      exercises: currentWorkout.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    };
    setCurrentWorkout(updated);
  };

  const updateSet = (exerciseId: string, setId: string, field: string, value: any) => {
    if (!currentWorkout) return;
    const updated = {
      ...currentWorkout,
      exercises: currentWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
          };
        }
        return ex;
      })
    };
    setCurrentWorkout(updated);
  };

  const save = () => {
    if (currentWorkout) {
      saveWorkout(currentWorkout);
    }
  };

  if (!currentWorkout) return null;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">WORKOUT</h1>
          <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">{currentWorkout.name}</p>
        </div>
        <button onClick={save} className="btn-primary flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="space-y-8">
        {currentWorkout.exercises.map((exercise) => (
          <div key={exercise.id} className="card bg-surface/50">
            <div className="flex mb-4 gap-4">
              <input 
                type="text" 
                placeholder="Exercise Name (e.g. Bench Press)" 
                value={exercise.name}
                onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                className="bg-transparent border-b border-border p-2 text-xl font-bold flex-1 text-white focus:outline-none focus:border-primary placeholder-textMuted"
              />
              <input 
                type="text" 
                placeholder="Reps (e.g. 6-8)" 
                value={exercise.targetReps}
                onChange={(e) => updateExercise(exercise.id, 'targetReps', e.target.value)}
                className="bg-transparent border-b border-border p-2 w-24 text-center font-bold focus:outline-none focus:border-primary text-textMuted"
              />
            </div>

            {exercise.name && getPreviousPerformance(exercise.name) && (
              <div className="mb-4 px-2 flex items-center justify-between bg-surfaceHighlight/20 p-2 rounded-lg">
                <span className="text-xs font-bold text-textMuted uppercase tracking-widest">Previous Best</span>
                <span className="text-sm font-black text-primary">
                  {getPreviousPerformance(exercise.name)?.weight} kg × {getPreviousPerformance(exercise.name)?.reps}
                </span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex text-xs font-bold tracking-widest text-textMuted uppercase mb-2 px-2">
                <span className="w-12 text-center">Set</span>
                <span className="flex-1 text-center">Weight (kg)</span>
                <span className="flex-1 text-center">Reps</span>
                <span className="w-12 text-center">Done</span>
              </div>
              
              {exercise.sets.map((set, sIdx) => (
                <div key={set.id} className="flex items-center space-x-4 bg-surfaceHighlight/30 p-2 rounded-lg border border-transparent hover:border-border transition-colors">
                  <span className="w-12 text-center font-bold text-textMuted">{sIdx + 1}</span>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={set.weight || ''} 
                      onChange={(e) => updateSet(exercise.id, set.id, 'weight', Number(e.target.value))}
                      className="w-full bg-surface border border-border rounded-md p-2 text-center text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={set.reps || ''} 
                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', Number(e.target.value))}
                      className="w-full bg-surface border border-border rounded-md p-2 text-center text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button 
                    onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                    className="w-12 h-10 flex items-center justify-center rounded-md hover:bg-surface transition-colors"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                      set.completed ? "bg-primary text-black checkbox-animate" : "bg-surfaceHighlight border border-border text-transparent"
                    )}>
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </button>
                </div>
              ))}
            </div>
            
            {exercise.sets.some(s => s.completed) && (
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Volume</p>
                  <p className="text-lg font-black text-white">{calculateExerciseStats(exercise).volume} kg</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Est 1RM</p>
                  <p className="text-lg font-black text-primary">{calculateExerciseStats(exercise).e1rm} kg</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {currentWorkout.exercises.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <h2 className="text-xl font-bold text-textMuted uppercase mb-2">YOUR SESSION STARTS HERE.</h2>
            <p className="text-sm text-textMuted/50 mb-6">Add your first exercise to begin.</p>
          </div>
        )}
        
        <button onClick={addExercise} className="w-full btn-secondary flex items-center justify-center space-x-2 py-4 border-dashed border-2 hover:border-primary/50 transition-colors">
          <Plus className="w-5 h-5" />
          <span>ADD EXERCISE</span>
        </button>
      </div>
    </div>
  );
};
