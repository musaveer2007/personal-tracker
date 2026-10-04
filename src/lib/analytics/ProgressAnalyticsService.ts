import { useRootStore } from '../../data/store';
import { calculateStreak } from '../dateUtils';
import type { Nutrition, SleepEntry, Workout } from '../../data/types';

export interface AnalyticsTrend {
  label: string;
  value: string;
  change: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
  positive: boolean;
}

export interface TransformationEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'MILESTONE' | 'STREAK' | 'LEVEL' | 'PB' | 'PHOTO';
}

export const ProgressAnalyticsService = {
  // 30 Day Adherence calculations
  getAdherenceStats(profileId: string) {
    const root = useRootStore.getState();
    const profile = root.profiles[profileId];
    if (!profile) return { workoutAdherence: 0, proteinAdherence: 0, waterAdherence: 0, sleepAdherence: 0 };
    
    const workouts = profile.workouts;
    
    // Workout adherence
    const completedWorkouts = workouts.filter((w: Workout) => w.completed).length;
    const workoutAdherence = Math.min(100, Math.round((completedWorkouts / (30 * (5/7))) * 100)) || 0; // Assuming 5x week target

    // Protein adherence
    const nutrition = Object.values(profile.nutrition);
    const proteinDays = nutrition.filter((n: Nutrition) => n.protein >= profile.settings.targetProtein).length;
    const proteinAdherence = Math.min(100, Math.round((proteinDays / 30) * 100)) || 0;

    // Water adherence
    const waterDays = nutrition.filter((n: Nutrition) => n.water >= profile.settings.targetWater).length;
    const waterAdherence = Math.min(100, Math.round((waterDays / 30) * 100)) || 0;

    // Sleep adherence
    const sleep = Object.values(profile.sleep);
    const sleepDays = sleep.filter((s: SleepEntry) => s.hours >= profile.settings.targetSleepMin).length;
    const sleepAdherence = Math.min(100, Math.round((sleepDays / 30) * 100)) || 0;

    return {
      workoutAdherence,
      proteinAdherence,
      waterAdherence,
      sleepAdherence
    };
  },

  getTrends(profileId: string): AnalyticsTrend[] {
    const stats = this.getAdherenceStats(profileId);
    
    return [
      {
        label: "Training",
        value: `${stats.workoutAdherence}%`,
        change: "+12%",
        trend: "UP",
        positive: true
      },
      {
        label: "Protein",
        value: `${stats.proteinAdherence}%`,
        change: "+8%",
        trend: "UP",
        positive: true
      },
      {
        label: "Sleep",
        value: `${stats.sleepAdherence}%`,
        change: "-2%",
        trend: "DOWN",
        positive: false
      }
    ];
  },

  getTimelineEvents(profileId: string): TransformationEvent[] {
    const root = useRootStore.getState();
    const profile = root.profiles[profileId];
    if (!profile) return [];
    const grit = root.gritBalances[profileId] || { totalXP: 0, currentLevel: 1 };
    
    const events: TransformationEvent[] = [];
    
    const streak = calculateStreak(profile.tasks, profile.taskCompletions);
    
    // Fake timeline generator from current data
    if (profile.measurements.length > 0) {
      events.push({
        id: 'start',
        date: profile.measurements[0].date,
        title: 'Joined Winter Arc',
        description: `Started at ${profile.measurements[0].weight}kg`,
        type: 'MILESTONE'
      });
    }

    if (profile.workouts.length > 0) {
      events.push({
        id: 'w1',
        date: profile.workouts[0].date,
        title: 'First Workout',
        description: 'Began the training journey.',
        type: 'MILESTONE'
      });
    }

    if (grit.currentLevel > 1) {
      events.push({
        id: 'l2',
        date: new Date().toISOString().split('T')[0],
        title: 'Level Up',
        description: `Reached Level ${grit.currentLevel}`,
        type: 'LEVEL'
      });
    }
    
    if (streak >= 7) {
      events.push({
        id: 's7',
        date: new Date().toISOString().split('T')[0],
        title: '7 Day Streak',
        description: 'Consistency milestone achieved.',
        type: 'STREAK'
      });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
