import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from './types';
import { defaultSettings, defaultTasks } from './seed';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      tasks: defaultTasks,
      taskCompletions: [],
      workouts: [],
      runs: [],
      nutrition: {},
      measurements: [],
      sleep: {},
      journal: {},
      manualDayCompletions: {},

      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      
      updateTask: (task) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === task.id ? task : t))
      })),
      
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId)
      })),
      
      toggleTaskCompletion: (taskId, date) => set((state) => {
        const existing = state.taskCompletions.find(t => t.taskId === taskId && t.date === date);
        if (existing) {
          return {
            taskCompletions: state.taskCompletions.map(t => 
              t.taskId === taskId && t.date === date ? { ...t, completed: !t.completed } : t
            )
          };
        } else {
          return {
            taskCompletions: [...state.taskCompletions, { taskId, date, completed: true }]
          };
        }
      }),

      toggleManualDayCompletion: (date) => set((state) => {
        const isCompleted = state.manualDayCompletions[date];
        return {
          manualDayCompletions: {
            ...state.manualDayCompletions,
            [date]: !isCompleted
          }
        };
      }),

      saveWorkout: (workout) => set((state) => {
        const existingIndex = state.workouts.findIndex(w => w.id === workout.id || w.date === workout.date);
        if (existingIndex >= 0) {
          const newWorkouts = [...state.workouts];
          newWorkouts[existingIndex] = workout;
          return { workouts: newWorkouts };
        }
        return { workouts: [...state.workouts, workout] };
      }),

      saveRun: (run) => set((state) => {
        const existingIndex = state.runs.findIndex(r => r.id === run.id || r.date === run.date);
        if (existingIndex >= 0) {
          const newRuns = [...state.runs];
          newRuns[existingIndex] = run;
          return { runs: newRuns };
        }
        return { runs: [...state.runs, run] };
      }),

      updateNutrition: (date, n) => set((state) => {
        const current = state.nutrition[date] || { date, calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
        return {
          nutrition: {
            ...state.nutrition,
            [date]: { ...current, ...n }
          }
        };
      }),

      addMeasurement: (measurement) => set((state) => {
        const filtered = state.measurements.filter(m => m.date !== measurement.date);
        return { measurements: [...filtered, measurement].sort((a, b) => a.date.localeCompare(b.date)) };
      }),

      updateSleep: (date, sleepEntry) => set((state) => ({
        sleep: { ...state.sleep, [date]: sleepEntry }
      })),

      updateJournal: (date, journalEntry) => set((state) => ({
        journal: { ...state.journal, [date]: journalEntry }
      })),

      resetData: () => set(() => ({
        taskCompletions: [],
        workouts: [],
        runs: [],
        nutrition: {},
        measurements: [],
        sleep: {},
        journal: {},
        manualDayCompletions: {}
      }))
    }),
    {
      name: 'winter-arc-storage',
    }
  )
);
