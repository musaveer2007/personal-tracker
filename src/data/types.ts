export type Category = 'fitness' | 'nutrition' | 'recovery' | 'grooming' | 'productivity';

export interface Task {
  id: string;
  name: string;
  category: Category;
  target?: string;
  frequency: 'daily' | 'weekly' | 'specific_days';
  daysOfWeek?: number[]; // 0-6, 0 is Sunday
}

export interface TaskCompletion {
  taskId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  sets: WorkoutSet[];
}

export interface BodyweightSet {
  id: string;
  reps: number;
  completed: boolean;
}

export interface BodyweightExercise {
  id: string;
  name: 'Pushups' | 'Pullups' | 'Squats';
  sets: BodyweightSet[];
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
  bodyweightExercises?: BodyweightExercise[];
  completed: boolean;
}

export interface Run {
  id: string;
  date: string;
  distance: number; // km
  time: number; // minutes
  pace: string;
  calories: number;
  type: string;
}

export interface Nutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // ml
}

export interface BodyMeasurement {
  date: string;
  weight: number;
  chest?: number;
  waist?: number;
  leftArm?: number;
  rightArm?: number;
  thigh?: number;
  shoulders?: number;
}

export interface SleepEntry {
  date: string;
  hours: number;
  quality: 'poor' | 'average' | 'good' | 'excellent';
  bedtime?: string;
  wakeTime?: string;
  energy?: number; // 1-5
  mood?: 'excellent' | 'good' | 'average' | 'tired' | 'difficult';
  
  // V3 Upgrades
  status?: 'NOT_STARTED' | 'READY_TO_BED' | 'SLEEPING' | 'AWAKE' | 'COMPLETED';
  bedtimeTimestamp?: string; // ISO string
  wakeTimestamp?: string;    // ISO string
  durationSeconds?: number;
}

export interface JournalEntry {
  date: string;
  mood: 'excellent' | 'good' | 'average' | 'tired' | 'difficult';
  content: string;
  energy: number; // 1-5
  createdAt?: string;
  updatedAt?: string;
}

export interface ChallengeSettings {
  startDate: string;
  endDate: string;
  startingWeight: number;
  goalWeightMin: number;
  goalWeightMax: number;
  height: number;
  goal?: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
  targetSteps: number;
  targetSleepMin: number;
  targetSleepMax: number;
}

export interface ProfileData {
  settings: ChallengeSettings;
  tasks: Task[];
  taskCompletions: TaskCompletion[];
  workouts: Workout[];
  runs: Run[];
  nutrition: Record<string, Nutrition>;
  measurements: BodyMeasurement[];
  sleep: Record<string, SleepEntry>;
  journal: Record<string, JournalEntry>;
  manualDayCompletions: Record<string, boolean>;
}

export interface ProfileMetadata {
  id: string;
  name: string;
  subtitle: string;
}

export interface AppState extends ProfileData {
  currentProfileId: string;
  
  // Actions
  updateSettings: (settings: Partial<ChallengeSettings>) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string, date: string) => void;
  toggleManualDayCompletion: (date: string) => void;
  saveWorkout: (workout: Workout) => void;
  saveRun: (run: Run) => void;
  updateNutrition: (date: string, nutrition: Partial<Nutrition>) => void;
  addMeasurement: (measurement: BodyMeasurement) => void;
  updateSleep: (date: string, sleep: SleepEntry) => void;
  updateJournal: (date: string, journal: JournalEntry) => void;
  resetData: () => void;
  switchProfile: (id: string) => void;
}

export interface RootState {
  profiles: Record<string, ProfileData>;
  currentProfileId: string;
  
  // Actions that operate on `state.profiles[state.currentProfileId]`
  updateSettings: (settings: Partial<ChallengeSettings>) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string, date: string) => void;
  toggleManualDayCompletion: (date: string) => void;
  saveWorkout: (workout: Workout) => void;
  saveRun: (run: Run) => void;
  updateNutrition: (date: string, nutrition: Partial<Nutrition>) => void;
  addMeasurement: (measurement: BodyMeasurement) => void;
  updateSleep: (date: string, sleep: SleepEntry) => void;
  updateJournal: (date: string, journal: JournalEntry) => void;
  resetData: () => void;
  switchProfile: (id: string) => void;
}
