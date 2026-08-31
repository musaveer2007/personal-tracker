import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, RootState, ProfileData } from './types';
import { defaultSettings, defaultTasks, dhavaneshSettings, dhavaneshTasks } from './seed';

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
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1 || !persistedState.profiles) {
          const old = persistedState;
          return {
            currentProfileId: 'musaveer',
            profiles: {
              musaveer: {
                settings: old.settings || defaultSettings,
                tasks: old.tasks || defaultTasks,
                taskCompletions: old.taskCompletions || [],
                workouts: old.workouts || [],
                runs: old.runs || [],
                nutrition: old.nutrition || {},
                measurements: old.measurements || [],
                sleep: old.sleep || {},
                journal: old.journal || {},
                manualDayCompletions: old.manualDayCompletions || {},
              },
              dhavanesh: initialProfileData(dhavaneshSettings, dhavaneshTasks),
            }
          };
        }
        return persistedState;
      }
    }
  )
);

export function useAppStore(): AppState;
export function useAppStore<T>(selector: (state: AppState) => T): T;
export function useAppStore<T>(selector?: (state: AppState) => T) {
  return useRootStore((root) => {
    const id = root.currentProfileId || 'musaveer';
    const profile = root.profiles[id] || root.profiles['musaveer'];
    
    const appState: AppState = {
      ...profile,
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
  });
}
