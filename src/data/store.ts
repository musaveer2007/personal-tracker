import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { events } from '../lib/events';
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
      gritBalances: {},

      switchProfile: (id) => set({ currentProfileId: id }),

      updateGritBalanceLocally: (profileId, addedXP, newLevel) => set((state) => {
        const current = state.gritBalances[profileId] || { totalXP: 0, currentLevel: 1 };
        return {
          gritBalances: {
            ...state.gritBalances,
            [profileId]: {
              totalXP: current.totalXP + addedXP,
              currentLevel: newLevel
            }
          }
        };
      }),

      updateSettings: (settings) => set((state) => updateProfile(state, (p) => ({ settings: { ...p.settings, ...settings } }))),
      
      updateProfileInfo: (info) => set((state) => updateProfile(state, () => info)),
      
      addTask: (task) => set((state) => updateProfile(state, (p) => ({ tasks: [...p.tasks, task] }))),
      
      updateTask: (task) => set((state) => updateProfile(state, (p) => ({
        tasks: p.tasks.map((t) => (t.id === task.id ? task : t))
      }))),
      
      deleteTask: (taskId) => set((state) => updateProfile(state, (p) => ({
        tasks: p.tasks.filter((t) => t.id !== taskId)
      }))),
      
      toggleTaskCompletion: (taskId, date) => set((state) => {
        const pId = state.currentProfileId;
        const profile = state.profiles[pId];
        if (profile) {
          const task = profile.tasks.find(t => t.id === taskId);
          const existing = profile.taskCompletions.find(t => t.taskId === taskId && t.date === date);
          const willComplete = !existing || !existing.completed;
          
          if (willComplete && task) {
            const name = task.name.toLowerCase();
            if (name.includes('skincare') || name.includes('skin care')) {
              events.dispatch({ userId: pId, profileId: pId, eventType: 'SKINCARE', sourceId: taskId, date, metadata: {} });
            } else if (name.includes('haircare') || name.includes('hair care')) {
              events.dispatch({ userId: pId, profileId: pId, eventType: 'HAIRCARE', sourceId: taskId, date, metadata: {} });
            }
          }
        }
        return updateProfile(state, (p) => {
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
        });
      }),

      toggleManualDayCompletion: (date) => set((state) => {
        const pId = state.currentProfileId;
        const profile = state.profiles[pId];
        if (profile) {
          const willComplete = !profile.manualDayCompletions[date];
          if (willComplete) {
            events.dispatch({ userId: pId, profileId: pId, eventType: 'DAY_COMPLETE', sourceId: date, date, metadata: {} });
          }
        }
        return updateProfile(state, (p) => ({
          manualDayCompletions: {
            ...p.manualDayCompletions,
            [date]: !p.manualDayCompletions[date]
          }
        }));
      }),

      saveWorkout: (workout) => set((state) => {
        const pId = state.currentProfileId;
        const uId = pId; // Assuming profileId == userId for now
        if (workout.completed) {
          events.dispatch({
            userId: uId,
            profileId: pId,
            eventType: 'WORKOUT_COMPLETED',
            sourceId: workout.id,
            date: workout.date,
            metadata: { workoutName: workout.name }
          });
        }
        return updateProfile(state, (p) => {
          const existingIndex = p.workouts.findIndex(w => w.id === workout.id || w.date === workout.date);
          if (existingIndex >= 0) {
            const newWorkouts = [...p.workouts];
            newWorkouts[existingIndex] = workout;
            return { workouts: newWorkouts };
          }
          return { workouts: [...p.workouts, workout] };
        });
      }),

      saveRun: (run) => set((state) => {
        const pId = state.currentProfileId;
        events.dispatch({
          userId: pId,
          profileId: pId,
          eventType: 'RUN_COMPLETED',
          sourceId: run.id,
          date: run.date,
          metadata: { distance: run.distance }
        });
        return updateProfile(state, (p) => {
          const existingIndex = p.runs.findIndex(r => r.id === run.id || r.date === run.date);
          if (existingIndex >= 0) {
            const newRuns = [...p.runs];
            newRuns[existingIndex] = run;
            return { runs: newRuns };
          }
          return { runs: [...p.runs, run] };
        });
      }),

      updateNutrition: (date, n) => set((state) => {
        const pId = state.currentProfileId;
        const profile = state.profiles[pId];
        if (profile) {
          const current = profile.nutrition[date] || { date, calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
          const newNutrition = { ...current, ...n };
          
          if (newNutrition.protein >= profile.settings.targetProtein && current.protein < profile.settings.targetProtein) {
            events.dispatch({ userId: pId, profileId: pId, eventType: 'PROTEIN_TARGET_REACHED', sourceId: date, date, metadata: { protein: newNutrition.protein } });
          }
          if (newNutrition.calories >= profile.settings.targetCalories && current.calories < profile.settings.targetCalories) {
            events.dispatch({ userId: pId, profileId: pId, eventType: 'CALORIE_TARGET_REACHED', sourceId: date, date, metadata: { calories: newNutrition.calories } });
          }
          if (newNutrition.water >= profile.settings.targetWater && current.water < profile.settings.targetWater) {
            events.dispatch({ userId: pId, profileId: pId, eventType: 'WATER_TARGET_REACHED', sourceId: date, date, metadata: { water: newNutrition.water } });
          }
        }
        return updateProfile(state, (p) => {
          const current = p.nutrition[date] || { date, calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
          return {
            nutrition: {
              ...p.nutrition,
              [date]: { ...current, ...n }
            }
          };
        });
      }),

      addMeasurement: (measurement) => set((state) => {
        const pId = state.currentProfileId;
        events.dispatch({
          userId: pId,
          profileId: pId,
          eventType: 'BODY_MEASUREMENT',
          sourceId: measurement.date,
          date: measurement.date,
          metadata: { weight: measurement.weight }
        });
        return updateProfile(state, (p) => {
          const filtered = p.measurements.filter(m => m.date !== measurement.date);
          return { measurements: [...filtered, measurement].sort((a, b) => a.date.localeCompare(b.date)) };
        });
      }),

      updateSleep: (date, sleepEntry) => set((state) => {
        const pId = state.currentProfileId;
        const profile = state.profiles[pId];
        if (profile && sleepEntry.hours >= profile.settings.targetSleepMin) {
           events.dispatch({
            userId: pId,
            profileId: pId,
            eventType: 'SLEEP_TARGET_REACHED',
            sourceId: date,
            date,
            metadata: { hours: sleepEntry.hours }
          });
        }
        return updateProfile(state, (p) => ({
          sleep: { ...p.sleep, [date]: sleepEntry }
        }));
      }),

      updateJournal: (date, journalEntry) => set((state) => {
        const pId = state.currentProfileId;
        if (journalEntry.content.trim().length > 5) {
          events.dispatch({
            userId: pId,
            profileId: pId,
            eventType: 'JOURNAL_COMPLETED',
            sourceId: date,
            date,
            metadata: { mood: journalEntry.mood }
          });
        }
        return updateProfile(state, (p) => ({
          journal: { ...p.journal, [date]: journalEntry }
        }));
      }),

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
      version: 5,
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
        
        if (version < 5) {
          // Mark Sep 1 and Sep 3 as completed for Dhavanesh
          if (state.profiles?.dhavanesh) {
            const dhavaneshTasks = state.profiles.dhavanesh.tasks || [];
            const fixes = [
              { date: '2026-09-01', dayOfWeek: 2 }, // Tuesday
              { date: '2026-09-03', dayOfWeek: 4 }  // Thursday
            ];
            let completions = [...(state.profiles.dhavanesh.taskCompletions || [])];
            
            fixes.forEach(({ date, dayOfWeek }) => {
              dhavaneshTasks.forEach((t: any) => {
                let applies = false;
                if (t.frequency === 'daily') applies = true;
                if (t.frequency === 'specific_days' && t.daysOfWeek?.includes(dayOfWeek)) applies = true;
                
                if (applies) {
                  const existingIndex = completions.findIndex((c: any) => c.taskId === t.id && c.date === date);
                  if (existingIndex >= 0) {
                    completions[existingIndex] = { ...completions[existingIndex], completed: true };
                  } else {
                    completions.push({ taskId: t.id, date, completed: true });
                  }
                }
              });
            });
            
            state.profiles.dhavanesh.taskCompletions = completions;
          }
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
    grit: root.gritBalances[id] || { totalXP: 0, currentLevel: 1 },
    updateSettings: root.updateSettings,
    updateProfileInfo: root.updateProfileInfo,
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
// Supabase Real-time Sync Logic (Protected)
// ----------------------------------------------------------------------

let isSyncingFromServer = false;
let currentSubscription: any = null;

export const initializeProfileSync = (userId: string) => {
  if (currentSubscription) {
    supabase.removeChannel(currentSubscription);
  }

  // 1. Initial Load from Supabase (Only for authenticated user)
  supabase
    .from('winter_arc_profiles')
    .select('*')
    .eq('id', userId)
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching data from Supabase:', error);
        return;
      }
      if (data && data.length > 0) {
        isSyncingFromServer = true;
        const row = data[0];
        useRootStore.setState((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: row.data
          },
          currentProfileId: userId
        }));
        setTimeout(() => { isSyncingFromServer = false; }, 100);
      } else {
        // If profile doesn't exist yet, we initialize it
        useRootStore.setState({ currentProfileId: userId });
      }
    });

  // Load Grit Balance
  supabase
    .from('grit_balances')
    .select('*')
    .eq('profile_id', userId)
    .then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        useRootStore.setState((state) => ({
          gritBalances: {
            ...state.gritBalances,
            [userId]: {
              totalXP: data[0].total_xp,
              currentLevel: data[0].current_level
            }
          }
        }));
      }
    });

  // 2. Listen to Remote Changes
  currentSubscription = supabase
    .channel(`public:winter_arc_profiles:id=eq.${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'winter_arc_profiles',
      filter: `id=eq.${userId}`
    }, (payload) => {
      if (payload.new && (payload.new as any).id === userId) {
        isSyncingFromServer = true;
        const { data } = payload.new as any;
        useRootStore.setState((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: data
          }
        }));
        setTimeout(() => { isSyncingFromServer = false; }, 100);
      }
    })
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'grit_balances',
      filter: `profile_id=eq.${userId}`
    }, (payload) => {
      if (payload.new && (payload.new as any).profile_id === userId) {
        const { total_xp, current_level } = payload.new as any;
        useRootStore.setState((state) => ({
          gritBalances: {
            ...state.gritBalances,
            [userId]: {
              totalXP: total_xp,
              currentLevel: current_level
            }
          }
        }));
      }
    })
    .subscribe();
};

// 3. Push Local Changes
useRootStore.subscribe((state, prevState) => {
  if (isSyncingFromServer) return;
  const id = state.currentProfileId;
  if (!id) return;

  if (state.profiles[id] && state.profiles[id] !== prevState.profiles[id]) {
    // We only push changes for the current profile (which should be the authenticated user)
    supabase.from('winter_arc_profiles').upsert({
      id: id,
      data: state.profiles[id],
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.error("Error syncing to Supabase", error);
    });
  }
});
