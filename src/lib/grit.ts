import { supabase } from './supabase';
import { useRootStore } from '../data/store';

export const GRIT_REWARDS = {
  WORKOUT_COMPLETED: 100,
  RUN_COMPLETED: 80,
  PROTEIN_TARGET_REACHED: 50,
  CALORIE_TARGET_REACHED: 40,
  WATER_TARGET_REACHED: 30,
  SLEEP_TARGET_REACHED: 40,
  JOURNAL_COMPLETED: 10,
  BODY_MEASUREMENT: 20,
  HAIRCARE: 10,
  SKINCARE: 10,
  DAY_COMPLETE: 100,
  STREAK_7_DAYS: 150,
  STREAK_30_DAYS: 500,
  STREAK_100_DAYS: 1500,
} as const;

export type GritEventType = keyof typeof GRIT_REWARDS;

export interface AwardGritParams {
  profileId: string;
  eventType: GritEventType;
  sourceType: string;
  sourceId: string;
  localDate: string;
  metadata?: Record<string, any>;
}

export const DAILY_GRIT_CAP = 500;

export function calculateLevel(totalXP: number): number {
  if (totalXP < 500) return 1;
  if (totalXP < 1200) return 2;
  if (totalXP < 2100) return 3;
  if (totalXP < 3200) return 4;
  if (totalXP < 4500) return 5;
  if (totalXP < 6000) return 6;
  if (totalXP < 7700) return 7;
  if (totalXP < 9600) return 8;
  if (totalXP < 11700) return 9;
  
  // Algorithm for Level 10+
  // L(x) = L(9) + extra
  let level = 9;
  let currentThreshold = 11700;
  let increment = 2300;
  
  while (totalXP >= currentThreshold) {
    level++;
    currentThreshold += increment;
    increment += 200;
  }
  
  return level;
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel === 1) return 500;
  if (currentLevel === 2) return 1200;
  if (currentLevel === 3) return 2100;
  if (currentLevel === 4) return 3200;
  if (currentLevel === 5) return 4500;
  if (currentLevel === 6) return 6000;
  if (currentLevel === 7) return 7700;
  if (currentLevel === 8) return 9600;
  if (currentLevel === 9) return 11700;
  
  let level = 9;
  let currentThreshold = 11700;
  let increment = 2300;
  
  while (level <= currentLevel) {
    level++;
    currentThreshold += increment;
    increment += 200;
  }
  
  return currentThreshold;
}

export function getLevelTitle(level: number): string {
  if (level < 5) return 'Starter';
  if (level < 10) return 'Disciplined';
  if (level < 20) return 'Consistent';
  if (level < 30) return 'Relentless';
  if (level < 50) return 'Elite';
  if (level < 100) return 'Iron';
  return 'Legendary';
}

export async function awardGrit(params: AwardGritParams): Promise<{ success: boolean; pointsAwarded: number; reason?: string }> {
  try {
    // Determine exact points
    const points = GRIT_REWARDS[params.eventType];
    if (!points) return { success: false, pointsAwarded: 0, reason: 'Invalid event type' };

    // Ideally, this should call a secure Supabase RPC to handle transactions and idempotency.
    // For now, we interact with the grit_events table.
    
    // 1. Check idempotency (duplicate prevention)
    const { data: existing } = await supabase
      .from('grit_events')
      .select('id')
      .eq('profile_id', params.profileId)
      .eq('event_type', params.eventType)
      .eq('source_type', params.sourceType)
      .eq('source_id', params.sourceId)
      .single();

    if (existing) {
      return { success: false, pointsAwarded: 0, reason: 'Idempotency key already exists' };
    }

    // 2. Check Daily Cap
    const { data: todayEvents } = await supabase
      .from('grit_events')
      .select('points')
      .eq('profile_id', params.profileId)
      .eq('local_date', params.localDate);

    const todayTotal = todayEvents?.reduce((sum, e) => sum + e.points, 0) || 0;
    
    if (todayTotal >= DAILY_GRIT_CAP) {
      return { success: false, pointsAwarded: 0, reason: 'Daily cap reached' };
    }

    let awardedPoints = points;
    if (todayTotal + points > DAILY_GRIT_CAP) {
      // Partial award to hit exactly the cap
      awardedPoints = DAILY_GRIT_CAP - todayTotal;
    }

    // 3. Create Event
    const { error: insertError } = await supabase.from('grit_events').insert({
      profile_id: params.profileId,
      event_type: params.eventType,
      source_type: params.sourceType,
      source_id: params.sourceId,
      points: awardedPoints,
      local_date: params.localDate,
      metadata: params.metadata || {}
    });

    if (insertError) {
      // Usually fails here if unique constraint is violated concurrently
      console.warn('Grit Event Insert Failed (likely duplicate):', insertError.message);
      return { success: false, pointsAwarded: 0, reason: insertError.message };
    }

    // 4. Update Balance (upsert)
    const { data: currentBalance } = await supabase
      .from('grit_balances')
      .select('total_xp, current_level')
      .eq('profile_id', params.profileId)
      .single();

    const newTotalXP = (currentBalance?.total_xp || 0) + awardedPoints;
    const newLevel = calculateLevel(newTotalXP);

    await supabase.from('grit_balances').upsert({
      profile_id: params.profileId,
      total_xp: newTotalXP,
      current_level: newLevel,
      updated_at: new Date().toISOString()
    });

    const oldLevel = currentBalance?.current_level || 1;
    if (newLevel > oldLevel) {
       window.dispatchEvent(new CustomEvent('level-up', { detail: { oldLevel, newLevel } }));
    }

    // 5. Also update local state for immediate UI feedback without waiting for realtime
    // (Realtime sync will eventually confirm this)
    useRootStore.getState().updateGritBalanceLocally(params.profileId, awardedPoints, newLevel);

    return { success: true, pointsAwarded: awardedPoints };
  } catch (err: any) {
    console.error('awardGrit error:', err);
    return { success: false, pointsAwarded: 0, reason: err.message };
  }
}
