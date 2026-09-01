import type { Task, ChallengeSettings } from './types';
import { v4 as uuidv4 } from 'uuid';

export const defaultSettings: ChallengeSettings = {
  startDate: '2026-09-01',
  endDate: '2026-12-09',
  startingWeight: 67,
  goalWeightMin: 71,
  goalWeightMax: 74,
  height: 185,
  targetCalories: 2700,
  targetProtein: 140,
  targetCarbs: 400,
  targetFat: 80,
  targetWater: 3000,
  targetSteps: 10000,
  targetSleepMin: 7.5,
  targetSleepMax: 9,
};

export const defaultTasks: Task[] = [
  { id: uuidv4(), name: 'Hit calorie target (~2700 kcal)', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'Hit 125-140g protein', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'Drink 2.5-3.5L water', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: '8,000-12,000 steps', category: 'fitness', frequency: 'daily' },
  { id: uuidv4(), name: 'Complete workout', category: 'fitness', frequency: 'specific_days', daysOfWeek: [1, 2, 3, 5, 6] }, // Mon, Tue, Wed, Fri, Sat
  { id: uuidv4(), name: 'Complete running session', category: 'fitness', frequency: 'specific_days', daysOfWeek: [4] }, // Thu
  { id: uuidv4(), name: 'Morning skincare (Cleanser, Moisturizer, SPF)', category: 'grooming', frequency: 'daily' },
  { id: uuidv4(), name: 'Night skincare (Cleanser, Moisturizer)', category: 'grooming', frequency: 'daily' },
  { id: uuidv4(), name: 'Haircare (Shampoo)', category: 'grooming', frequency: 'specific_days', daysOfWeek: [1, 3, 5] }, // Mon, Wed, Fri
  { id: uuidv4(), name: 'Sleep 7.5-9 hours', category: 'recovery', frequency: 'daily' },
];

export const dhavaneshSettings: ChallengeSettings = {
  startDate: '2026-09-01',
  endDate: '2026-12-09',
  startingWeight: 50,
  goalWeightMin: 55,
  goalWeightMax: 60,
  height: 165, // 5'5"
  targetCalories: 2500, // Budget-friendly surplus
  targetProtein: 100, // Specifically requested
  targetCarbs: 350,
  targetFat: 70,
  targetWater: 3000,
  targetSteps: 8000,
  targetSleepMin: 7.5,
  targetSleepMax: 9,
};

export const dhavaneshTasks: Task[] = [
  { id: uuidv4(), name: 'Hit calorie surplus (~2500 kcal)', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'Hit ~100g protein (Eggs, milk, dal, chana)', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'Drink 3L water', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'College 5:00 AM - 5:00 PM', category: 'productivity', frequency: 'specific_days', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: uuidv4(), name: 'Home Workout (Push/Pull/Legs)', category: 'fitness', frequency: 'specific_days', daysOfWeek: [1, 2, 4, 5, 6] }, // Mon, Tue, Thu, Fri, Sat
  { id: uuidv4(), name: 'Project/College Work (8:00 - 9:15 PM)', category: 'productivity', frequency: 'daily' },
  { id: uuidv4(), name: 'Prepare for tomorrow (9:15 PM)', category: 'grooming', frequency: 'daily' },
  { id: uuidv4(), name: 'Sleep by 9:30 PM', category: 'recovery', frequency: 'daily' },
];

export const sumithSettings: ChallengeSettings = {
  startDate: '2026-09-01',
  endDate: '2026-12-09',
  startingWeight: 65,
  goalWeightMin: 68,
  goalWeightMax: 72,
  height: 173, // 5'8"
  goal: 'Build muscle + aesthetic athletic physique',
  targetCalories: 2600,
  targetProtein: 130,
  targetCarbs: 350,
  targetFat: 75,
  targetWater: 3000,
  targetSteps: 8000,
  targetSleepMin: 7.5,
  targetSleepMax: 9,
};

export const sumithTasks: Task[] = [
  { id: uuidv4(), name: 'Hit calorie target (~2600 kcal)', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'Hit ~130g protein', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: 'Drink 3L water', category: 'nutrition', frequency: 'daily' },
  { id: uuidv4(), name: '8,000 steps', category: 'fitness', frequency: 'daily' },
  { id: uuidv4(), name: 'Complete workout', category: 'fitness', frequency: 'specific_days', daysOfWeek: [1, 2, 3, 5, 6] }, // Mon, Tue, Wed, Fri, Sat
  { id: uuidv4(), name: 'Morning skincare (Cleanser, Moisturizer, SPF)', category: 'grooming', frequency: 'daily' },
  { id: uuidv4(), name: 'Night skincare (Cleanser, Moisturizer)', category: 'grooming', frequency: 'daily' },
  { id: uuidv4(), name: 'Haircare (Shampoo)', category: 'grooming', frequency: 'specific_days', daysOfWeek: [1, 3, 5] }, // Mon, Wed, Fri
  { id: uuidv4(), name: 'Sleep 7.5-9 hours', category: 'recovery', frequency: 'daily' },
];
