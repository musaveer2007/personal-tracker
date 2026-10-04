import { calculateStreak } from './dateUtils';
import { useRootStore } from '../data/store';
import { unlockAchievement } from './achievements';
import { awardGrit } from './grit';
import { supabase } from './supabase';

/**
 * Validates the current streak and handles milestones
 * Called asynchronously when a day is marked as completed
 */
export const processStreakMilestones = async (profileId: string, localDate: string) => {
  const state = useRootStore.getState();
  const profile = state.profiles[profileId];
  if (!profile) return;

  const currentStreak = calculateStreak(profile.tasks, profile.taskCompletions);
  
  // Persist to streak history in background
  if (profileId !== 'demo' && profileId !== 'dhavanesh' && profileId !== 'sumith') {
    supabase.from('streak_history').upsert({
      profile_id: profileId,
      current_streak: currentStreak,
      last_qualifying_date: localDate
    }).then(({ error }) => {
      if (error) console.error('Error updating streak history:', error);
    });
  }

  // 1. Achievements
  if (currentStreak >= 3) await unlockAchievement(profileId, 'THREE_DAY_GRIT');
  if (currentStreak >= 7) await unlockAchievement(profileId, 'SEVEN_DAY_GRIT');
  if (currentStreak >= 14) await unlockAchievement(profileId, 'FOURTEEN_DAY_GRIT');
  if (currentStreak >= 30) await unlockAchievement(profileId, 'THIRTY_DAY_GRIT');
  if (currentStreak >= 50) await unlockAchievement(profileId, 'FIFTY_DAY_GRIT');
  if (currentStreak >= 100) await unlockAchievement(profileId, 'HUNDRED_DAY_GRIT');

  // 2. GRIT Milestone Rewards
  // Since awardGrit is idempotent, it is safe to attempt these here.
  if (currentStreak === 7) {
    await awardGrit({
      profileId,
      eventType: 'STREAK_7_DAYS',
      sourceType: 'streak',
      sourceId: `streak_7_${localDate}`,
      localDate,
      metadata: { streak: 7 }
    });
  }
  
  if (currentStreak === 30) {
    await awardGrit({
      profileId,
      eventType: 'STREAK_30_DAYS',
      sourceType: 'streak',
      sourceId: `streak_30_${localDate}`,
      localDate,
      metadata: { streak: 30 }
    });
  }

  if (currentStreak === 100) {
    await awardGrit({
      profileId,
      eventType: 'STREAK_100_DAYS',
      sourceType: 'streak',
      sourceId: `streak_100_${localDate}`,
      localDate,
      metadata: { streak: 100 }
    });
  }
};
