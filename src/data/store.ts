import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { AppState, RootState, ProfileData } from './types';
import { defaultSettings, defaultTasks, dhavaneshSettings, dhavaneshTasks, sumithSettings, sumithTasks } from './seed';
const initialProfileData = (settings: any, tasks: any): ProfileData => ({
  settings,
  tasks,
  taskCompletions: [],
  workouts: [],
  runs: [],
  nutrition: {},
  measurements: [],
  sleep: {},
  journal: {},
  manualDayCompletions: {},
});

const updateProfile = (state: RootState, updater: (profile: ProfileData) => Partial<ProfileData>) => {
  const id = state.currentProfileId;
  if (!id || !state.profiles[id]) return state;
  const currentProfile = state.profiles[id];
  const updates = updater(currentProfile);
  return {
    profiles: {
      ...state.profiles,
      [id]: {
        ...currentProfile,
        ...updates
      }
    }
  };
};

export const useRootStore = create<RootState>()(
  persist(
    (set) => ({
      profiles: {
        musaveer: initialProfileData(defaultSettings, defaultTasks),
        dhavanesh: initialProfileData(dhavaneshSettings, dhavaneshTasks),
        sumith: initialProfileData(sumithSettings, sumithTasks),
      },
      currentProfileId: 'musaveer',

      switchProfile: (id) => set({ currentProfileId: id }),

      updateSettings: (settings) => set((state) => updateProfile(state, (p) => ({ settings: { ...p.settings, ...settings } }))),
      
      addTask: (task) => set((state) => updateProfile(state, (p) => ({ tasks: [...p.tasks, task] }))),
      
      updateTask: (task) => set((state) => updateProfile(state, (p) => ({
        tasks: p.tasks.map((t) => (t.id === task.id ? task : t))
      }))),
      
      deleteTask: (taskId) => set((state) => updateProfile(state, (p) => ({
        tasks: p.tasks.filter((t) => t.id !== taskId)
      }))),
      
      toggleTaskCompletion: (taskId, date) => set((state) => updateProfile(state, (p) => {
        const existing = p.taskCompletions.find(t => t.taskId === taskId && t.date === date);
        if (existing) {
          return {
            taskCompletions: p.taskCompletions.map(t => 
              t.taskId === taskId && t.date === date ? { ...t, completed: !t.completed } : t
            )
          };
        } else {
          return {
            taskCompletions: [...p.taskCompletions, { taskId, date, completed: true }]
          };
        }
      })),

      toggleManualDayCompletion: (date) => set((state) => updateProfile(state, (p) => ({
        manualDayCompletions: {
          ...p.manualDayCompletions,
          [date]: !p.manualDayCompletions[date]
        }
      }))),

      saveWorkout: (workout) => set((state) => updateProfile(state, (p) => {
        const existingIndex = p.workouts.findIndex(w => w.id === workout.id || w.date === workout.date);
        if (existingIndex >= 0) {
          const newWorkouts = [...p.workouts];
          newWorkouts[existingIndex] = workout;
          return { workouts: newWorkouts };
        }
        return { workouts: [...p.workouts, workout] };
      })),

      saveRun: (run) => set((state) => updateProfile(state, (p) => {
        const existingIndex = p.runs.findIndex(r => r.id === run.id || r.date === run.date);
        if (existingIndex >= 0) {
          const newRuns = [...p.runs];
          newRuns[existingIndex] = run;
          return { runs: newRuns };
        }
        return { runs: [...p.runs, run] };
      })),

      updateNutrition: (date, n) => set((state) => updateProfile(state, (p) => {
        const current = p.nutrition[date] || { date, calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
        return {
          nutrition: {
            ...p.nutrition,
            [date]: { ...current, ...n }
          }
        };
      })),

      addMeasurement: (measurement) => set((state) => updateProfile(state, (p) => {
        const filtered = p.measurements.filter(m => m.date !== measurement.date);
        return { measurements: [...filtered, measurement].sort((a, b) => a.date.localeCompare(b.date)) };
      })),

      updateSleep: (date, sleepEntry) => set((state) => updateProfile(state, (p) => ({
        sleep: { ...p.sleep, [date]: sleepEntry }
      }))),

      updateJournal: (date, journalEntry) => set((state) => updateProfile(state, (p) => ({
        journal: { ...p.journal, [date]: journalEntry }
      }))),

      resetData: () => set((state) => updateProfile(state, () => ({
        taskCompletions: [],
        workouts: [],
        runs: [],
        nutrition: {},
        measurements: [],
        sleep: {},
        journal: {},
        manualDayCompletions: {}
      })))
    }),
    {
      name: 'winter-arc-storage',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        
        if (version < 3 || !state.profiles) {
          state = {
            currentProfileId: state.currentProfileId || 'musaveer',
            profiles: {
              musaveer: state.profiles?.musaveer || {
                settings: state.settings || defaultSettings,
                tasks: state.tasks || defaultTasks,
                taskCompletions: state.taskCompletions || [],
                workouts: state.workouts || [],
                runs: state.runs || [],
                nutrition: state.nutrition || {},
                measurements: state.measurements || [],
                sleep: state.sleep || {},
                journal: state.journal || {},
                manualDayCompletions: state.manualDayCompletions || {},
              },
              dhavanesh: state.profiles?.dhavanesh || initialProfileData(dhavaneshSettings, dhavaneshTasks),
              sumith: state.profiles?.sumith || initialProfileData(sumithSettings, sumithTasks),
            }
          };
        }

        if (version < 4) {
          // Rename the sleep task
          ['musaveer', 'dhavanesh', 'sumith'].forEach(profileId => {
            if (state.profiles?.[profileId]?.tasks) {
              state.profiles[profileId].tasks = state.profiles[profileId].tasks.map((t: any) => {
                if (t.name.startsWith('Sleep ')) {
                  return { ...t, name: 'Sleep by 10 - 10:30 PM' };
                }
                return t;
              });
            }
          });
        }
        
        return state;
      }
    }
  )
);

export function useAppStore(): AppState;
export function useAppStore<T>(selector: (state: AppState) => T): T;
export function useAppStore<T>(selector?: (state: AppState) => T) {
  const root = useRootStore();
  const id = root.currentProfileId || 'musaveer';
  const profile = root.profiles[id] || root.profiles['musaveer'];
  
  // Initialize default profile if it doesn't exist yet to prevent crashes
  const safeProfile = profile || {
    settings: {
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().getTime() + 100 * 24 * 60 * 60 * 1000).toISOString(),
      targetProtein: 0,
      targetCalories: 0,
      targetFat: 0,
      targetWater: 0,
      targetSteps: 0,
      targetSleepMin: 0,
      targetSleepMax: 0,
    },
    tasks: [],
    taskCompletions: [],
    workouts: [],
    runs: [],
    nutrition: {},
    measurements: [],
    sleep: {},
    journal: {},
    manualDayCompletions: {}
  };
  
  const appState: AppState = {
    ...safeProfile,
    currentProfileId: root.currentProfileId,
    updateSettings: root.updateSettings,
    addTask: root.addTask,
    updateTask: root.updateTask,
    deleteTask: root.deleteTask,
    toggleTaskCompletion: root.toggleTaskCompletion,
    toggleManualDayCompletion: root.toggleManualDayCompletion,
    saveWorkout: root.saveWorkout,
    saveRun: root.saveRun,
    updateNutrition: root.updateNutrition,
    addMeasurement: root.addMeasurement,
    updateSleep: root.updateSleep,
    updateJournal: root.updateJournal,
    resetData: root.resetData,
    switchProfile: root.switchProfile,
  };
  return selector ? selector(appState) : appState;
}

// ----------------------------------------------------------------------
// Supabase Real-time Sync Logic
// ----------------------------------------------------------------------

let isSyncingFromServer = false;

// 1. Initial Load from Supabase
supabase.from('winter_arc_profiles').select('*').then(({ data, error }) => {
  if (error) {
    console.error('Error fetching initial data from Supabase:', error);
    return;
  }
  if (data && data.length > 0) {
    isSyncingFromServer = true;
    const profilesUpdate: Record<string, any> = {};
    data.forEach(row => {
      profilesUpdate[row.id] = row.data;
    });
    
    useRootStore.setState((state) => ({
      profiles: {
        ...state.profiles,
        ...profilesUpdate
      }
    }));
    setTimeout(() => { isSyncingFromServer = false; }, 100);
  }
});

// 2. Listen to Remote Changes
supabase
  .channel('winter_arc_profiles_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'winter_arc_profiles' }, (payload) => {
    if (payload.new && (payload.new as any).id) {
      isSyncingFromServer = true;
      const { id, data } = payload.new as any;
      useRootStore.setState((state) => ({
        profiles: {
          ...state.profiles,
          [id]: data
        }
      }));
      setTimeout(() => { isSyncingFromServer = false; }, 100);
    }
  })
  .subscribe();

// 3. Push Local Changes
useRootStore.subscribe((state, prevState) => {
  if (isSyncingFromServer) return;
  
  // Find which profile changed
  Object.keys(state.profiles).forEach((id) => {
    if (state.profiles[id] !== prevState.profiles[id]) {
      // Profile data changed, push to supabase
      supabase.from('winter_arc_profiles').upsert({
        id: id,
        data: state.profiles[id],
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error("Error syncing to Supabase", error);
      });
    }
  });
});
