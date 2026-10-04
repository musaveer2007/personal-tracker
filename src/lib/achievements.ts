import { supabase } from './supabase';
import { useRootStore } from '../data/store';

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type Category = 'Getting Started' | 'Consistency' | 'Strength' | 'Running' | 'Nutrition' | 'Recovery' | 'Discipline' | 'Challenges' | 'Milestones';

export interface AchievementDef {
  code: string;
  name: string;
  description: string;
  category: Category;
  rarity: Rarity;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // Getting Started
  FIRST_WORKOUT: { code: 'FIRST_WORKOUT', name: 'First Iron', description: 'Complete your first workout.', category: 'Getting Started', rarity: 'COMMON' },
  FIRST_RUN: { code: 'FIRST_RUN', name: 'First Steps', description: 'Complete your first run.', category: 'Getting Started', rarity: 'COMMON' },
  FIRST_JOURNAL: { code: 'FIRST_JOURNAL', name: 'First Thoughts', description: 'Complete your first journal entry.', category: 'Getting Started', rarity: 'COMMON' },
  
  // Consistency
  THREE_DAY_GRIT: { code: 'THREE_DAY_GRIT', name: 'Starter', description: 'Maintain a 3-day streak.', category: 'Consistency', rarity: 'COMMON' },
  SEVEN_DAY_GRIT: { code: 'SEVEN_DAY_GRIT', name: 'Consistent', description: 'Maintain a 7-day streak.', category: 'Consistency', rarity: 'UNCOMMON' },
  FOURTEEN_DAY_GRIT: { code: 'FOURTEEN_DAY_GRIT', name: 'Disciplined', description: 'Maintain a 14-day streak.', category: 'Consistency', rarity: 'UNCOMMON' },
  THIRTY_DAY_GRIT: { code: 'THIRTY_DAY_GRIT', name: 'Relentless', description: 'Maintain a 30-day streak.', category: 'Consistency', rarity: 'RARE' },
  FIFTY_DAY_GRIT: { code: 'FIFTY_DAY_GRIT', name: 'Elite', description: 'Maintain a 50-day streak.', category: 'Consistency', rarity: 'EPIC' },
  HUNDRED_DAY_GRIT: { code: 'HUNDRED_DAY_GRIT', name: 'Legendary', description: 'Maintain a 100-day streak.', category: 'Consistency', rarity: 'LEGENDARY' },
  
  // Milestones (GRIT)
  GRIT_500: { code: 'GRIT_500', name: 'Spark', description: 'Earn 500 lifetime GRIT.', category: 'Milestones', rarity: 'COMMON' },
  GRIT_1000: { code: 'GRIT_1000', name: 'Flame', description: 'Earn 1,000 lifetime GRIT.', category: 'Milestones', rarity: 'UNCOMMON' },
  GRIT_2500: { code: 'GRIT_2500', name: 'Fire', description: 'Earn 2,500 lifetime GRIT.', category: 'Milestones', rarity: 'RARE' },
  GRIT_5000: { code: 'GRIT_5000', name: 'Inferno', description: 'Earn 5,000 lifetime GRIT.', category: 'Milestones', rarity: 'EPIC' },
  GRIT_10000: { code: 'GRIT_10000', name: 'Supernova', description: 'Earn 10,000 lifetime GRIT.', category: 'Milestones', rarity: 'LEGENDARY' },

  // Workouts
  WORKOUT_10: { code: 'WORKOUT_10', name: 'Iron Forged', description: 'Complete 10 workouts.', category: 'Strength', rarity: 'UNCOMMON' },
  WORKOUT_25: { code: 'WORKOUT_25', name: 'Iron Master', description: 'Complete 25 workouts.', category: 'Strength', rarity: 'RARE' },
  WORKOUT_50: { code: 'WORKOUT_50', name: 'Iron Lord', description: 'Complete 50 workouts.', category: 'Strength', rarity: 'EPIC' },
  WORKOUT_100: { code: 'WORKOUT_100', name: 'Iron God', description: 'Complete 100 workouts.', category: 'Strength', rarity: 'LEGENDARY' },

  // Nutrition
  PROTEIN_FIRST: { code: 'PROTEIN_FIRST', name: 'Fuel', description: 'Hit your protein target for the first time.', category: 'Nutrition', rarity: 'COMMON' },
  PROTEIN_7: { code: 'PROTEIN_7', name: 'Nourished', description: 'Hit your protein target 7 times.', category: 'Nutrition', rarity: 'UNCOMMON' },
  PROTEIN_30: { code: 'PROTEIN_30', name: 'Anabolic', description: 'Hit your protein target 30 times.', category: 'Nutrition', rarity: 'RARE' },
  
  // Water
  WATER_FIRST: { code: 'WATER_FIRST', name: 'Hydrated', description: 'Hit your water target for the first time.', category: 'Recovery', rarity: 'COMMON' },
  WATER_7: { code: 'WATER_7', name: 'Flowing', description: 'Hit your water target 7 times.', category: 'Recovery', rarity: 'UNCOMMON' },
  
  // Sleep
  SLEEP_FIRST: { code: 'SLEEP_FIRST', name: 'Restored', description: 'Hit your sleep target for the first time.', category: 'Recovery', rarity: 'COMMON' },
  SLEEP_7: { code: 'SLEEP_7', name: 'Deep Sleep', description: 'Hit your sleep target 7 times.', category: 'Recovery', rarity: 'UNCOMMON' },
  
  // Challenges
  WINTER_ARC_COMPLETE: { code: 'WINTER_ARC_COMPLETE', name: 'WINTER ARC COMPLETE', description: 'Complete the 100-day Winter Arc.', category: 'Challenges', rarity: 'LEGENDARY' },
};

/**
 * Attempts to safely unlock an achievement for a user.
 * Relies on the database UNIQUE constraint for idempotency.
 */
export const unlockAchievement = async (profileId: string, code: keyof typeof ACHIEVEMENTS) => {
  if (profileId === 'demo' || profileId === 'dhavanesh' || profileId === 'sumith') return { success: false, reason: 'demo' };
  
  const def = ACHIEVEMENTS[code];
  if (!def) return { success: false, reason: 'invalid_code' };

  try {
    const { error } = await supabase.from('user_achievements').insert({
      profile_id: profileId,
      achievement_code: code,
    });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - already unlocked
        return { success: false, reason: 'already_unlocked' };
      }
      console.error('Achievement insert error:', error);
      return { success: false, reason: 'db_error' };
    }

    // Emit event for UI
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: { achievement: def } }));
    return { success: true, achievement: def };
  } catch (err) {
    return { success: false, reason: 'error' };
  }
};

/**
 * The Evaluator checks local state when events occur and decides if an achievement is met.
 * It's called asynchronously after an action.
 */
export const evaluateAchievements = async (profileId: string, eventType: string) => {
  // We can pull the full profile from Zustand to check conditions
  const state = useRootStore.getState();
  const profile = state.profiles[profileId];
  if (!profile) return;
  
  const grit = state.gritBalances[profileId] || { totalXP: 0 };
  
  // Evaluate based on event type
  
  // 1. Getting Started & Milestones based on simple counts
  if (eventType === 'WORKOUT_COMPLETED') {
    const count = profile.workouts.filter(w => w.completed).length;
    if (count >= 1) await unlockAchievement(profileId, 'FIRST_WORKOUT');
    if (count >= 10) await unlockAchievement(profileId, 'WORKOUT_10');
    if (count >= 25) await unlockAchievement(profileId, 'WORKOUT_25');
    if (count >= 50) await unlockAchievement(profileId, 'WORKOUT_50');
    if (count >= 100) await unlockAchievement(profileId, 'WORKOUT_100');
  }

  if (eventType === 'RUN_COMPLETED') {
    const count = profile.runs.length;
    if (count >= 1) await unlockAchievement(profileId, 'FIRST_RUN');
  }

  if (eventType === 'JOURNAL_COMPLETED') {
    const count = Object.keys(profile.journal).length;
    if (count >= 1) await unlockAchievement(profileId, 'FIRST_JOURNAL');
  }

  if (eventType === 'PROTEIN_TARGET_REACHED') {
    // We count how many days hit the target
    const target = profile.settings.targetProtein;
    const count = Object.values(profile.nutrition).filter(n => n.protein >= target).length;
    if (count >= 1) await unlockAchievement(profileId, 'PROTEIN_FIRST');
    if (count >= 7) await unlockAchievement(profileId, 'PROTEIN_7');
    if (count >= 30) await unlockAchievement(profileId, 'PROTEIN_30');
  }

  if (eventType === 'WATER_TARGET_REACHED') {
    const target = profile.settings.targetWater;
    const count = Object.values(profile.nutrition).filter(n => n.water >= target).length;
    if (count >= 1) await unlockAchievement(profileId, 'WATER_FIRST');
    if (count >= 7) await unlockAchievement(profileId, 'WATER_7');
  }

  if (eventType === 'SLEEP_TARGET_REACHED') {
    const target = profile.settings.targetSleepMin;
    const count = Object.values(profile.sleep).filter(s => s.hours >= target).length;
    if (count >= 1) await unlockAchievement(profileId, 'SLEEP_FIRST');
    if (count >= 7) await unlockAchievement(profileId, 'SLEEP_7');
  }

  // Evaluate GRIT
  if (grit.totalXP >= 500) await unlockAchievement(profileId, 'GRIT_500');
  if (grit.totalXP >= 1000) await unlockAchievement(profileId, 'GRIT_1000');
  if (grit.totalXP >= 2500) await unlockAchievement(profileId, 'GRIT_2500');
  if (grit.totalXP >= 5000) await unlockAchievement(profileId, 'GRIT_5000');
  if (grit.totalXP >= 10000) await unlockAchievement(profileId, 'GRIT_10000');
};
