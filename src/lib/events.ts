import { getIsoTimestamp } from './dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { awardGrit, GRIT_REWARDS } from './grit';
import type { GritEventType } from './grit';
import { evaluateAchievements } from './achievements';
import { processStreakMilestones } from './streaks';

export type EventType = 
  | 'WORKOUT_COMPLETED'
  | 'RUN_COMPLETED'
  | 'MEAL_LOGGED'
  | 'PROTEIN_TARGET_REACHED'
  | 'CALORIE_TARGET_REACHED'
  | 'WATER_TARGET_REACHED'
  | 'SLEEP_TARGET_REACHED'
  | 'JOURNAL_COMPLETED'
  | 'BODY_MEASUREMENT'
  | 'HAIRCARE'
  | 'SKINCARE'
  | 'DAY_COMPLETE'
  | 'STREAK_7_DAYS'
  | 'STREAK_30_DAYS'
  | 'STREAK_100_DAYS'
  | 'CHALLENGE_COMPLETED'
  | 'TASK_COMPLETED';

export interface ActivityEvent {
  id: string;              // Unique event ID for idempotency
  userId: string;          // Maps to User Identity (Auth)
  profileId: string;       // Maps to Fitness Profile
  eventType: EventType;
  sourceId: string;        // E.g., Workout ID, Task ID, or Date string
  date: string;            // User's local date (YYYY-MM-DD)
  timestamp: string;       // ISO UTC Timestamp
  metadata: Record<string, any>; // Extra details (e.g. calories, distance)
  createdAt: string;       // ISO UTC Timestamp
}

class EventDispatcher {
  private events: ActivityEvent[] = [];

  async dispatch(event: Omit<ActivityEvent, 'id' | 'createdAt' | 'timestamp'>) {
    const fullEvent: ActivityEvent = {
      ...event,
      id: uuidv4(),
      timestamp: getIsoTimestamp(),
      createdAt: getIsoTimestamp(),
    };

    // 1. Idempotency Check (Local simulation for now)
    const isDuplicate = this.events.some(
      (e) => e.eventType === fullEvent.eventType && 
             e.sourceId === fullEvent.sourceId && 
             e.date === fullEvent.date
    );

    if (isDuplicate) {
      console.warn(`[EventDispatcher] Duplicate event suppressed: ${fullEvent.eventType} for ${fullEvent.sourceId}`);
      return;
    }

    // 2. Store event locally
    this.events.push(fullEvent);
    console.log(`[EventDispatcher] Event logged: ${fullEvent.eventType}`, fullEvent);

    // 3. Persist activity event to Supabase (assuming a future activity_events table, skipping for now as per instructions to reuse DB or create min structures)
    
    // 4. Trigger Reward Engine if applicable
    if (fullEvent.eventType in GRIT_REWARDS) {
      const rewardResult = await awardGrit({
        profileId: fullEvent.profileId,
        eventType: fullEvent.eventType as GritEventType,
        sourceType: 'activity_event',
        sourceId: `${fullEvent.sourceId}_${fullEvent.date}`,
        localDate: fullEvent.date,
        metadata: fullEvent.metadata
      });
      
      if (rewardResult.success) {
        console.log(`[GRIT] Awarded +${rewardResult.pointsAwarded} GRIT for ${fullEvent.eventType}`);
        window.dispatchEvent(new CustomEvent('grit-awarded', { 
          detail: { 
            points: rewardResult.pointsAwarded, 
            eventType: fullEvent.eventType 
          } 
        }));
      }
    }

    // 5. Trigger Achievements
    await evaluateAchievements(fullEvent.profileId, fullEvent.eventType);

    // 6. Trigger Streak Processing if Day Complete
    if (fullEvent.eventType === 'DAY_COMPLETE') {
      await processStreakMilestones(fullEvent.profileId, fullEvent.date);
    }
  }

  getEvents() {
    return this.events;
  }
}

export const events = new EventDispatcher();

