import { differenceInDays, format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';
import type { Task, TaskCompletion } from '../data/types';

// ==========================================
// TIME & DATE STANDARDIZATION
// ==========================================

export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getUserLocalDate = () => {
  return new Date();
};

export const getStartOfUserDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfUserDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getIsoTimestamp = () => new Date().toISOString();

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const getChallengeStats = (startDateStr: string, endDateStr: string) => {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const today = startOfDay(new Date());

  const totalDays = differenceInDays(end, start) + 1; // Dynamic based on dates
  
  if (isBefore(today, start)) {
    const daysUntilStart = differenceInDays(start, today);
    return {
      status: 'upcoming',
      currentDay: 0,
      daysCompleted: 0,
      daysRemaining: totalDays,
      completionPercentage: 0,
      daysUntilStart,
      totalDays,
    };
  }

  if (isAfter(today, end)) {
    return {
      status: 'completed',
      currentDay: totalDays,
      daysCompleted: totalDays,
      daysRemaining: 0,
      completionPercentage: 100,
      daysUntilStart: 0,
      totalDays,
    };
  }

  const daysCompleted = differenceInDays(today, start);
  const currentDay = daysCompleted + 1;
  const daysRemaining = totalDays - daysCompleted;
  const completionPercentage = Math.round((daysCompleted / totalDays) * 100);

  return {
    status: 'active',
    currentDay,
    daysCompleted,
    daysRemaining,
    completionPercentage,
    daysUntilStart: 0,
    totalDays,
  };
};

export const getWeekNumber = (startDateStr: string) => {
  // Wait, I can just calculate it directly.
  const start = parseISO(startDateStr);
  const today = startOfDay(new Date());
  if (isBefore(today, start)) return 1;
  const daysCompleted = differenceInDays(today, start);
  return Math.floor(daysCompleted / 7) + 1;
};

export const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d, yyyy');
};

export const calculateDayStatus = (
  dateStr: string,
  tasks: Task[],
  taskCompletions: TaskCompletion[]
): { status: 'completed' | 'failed' | 'pending' | 'future' | 'partial'; completedCount: number; totalCount: number } => {
  const dateObj = parseISO(dateStr);
  const todayDateStr = getTodayStr();
  const todayObj = startOfDay(new Date());
  
  const dayOfWeek = dateObj.getDay();
  const dayTasks = tasks.filter(t => {
    if (t.frequency === 'daily') return true;
    if (t.frequency === 'specific_days' && t.daysOfWeek?.includes(dayOfWeek)) return true;
    return false;
  });

  const completedCount = dayTasks.filter(t => 
    taskCompletions.some(tc => tc.taskId === t.id && tc.date === dateStr && tc.completed)
  ).length;
  const totalCount = dayTasks.length;

  let status: 'completed' | 'failed' | 'pending' | 'future' | 'partial' = 'future';
  const isPast = isBefore(dateObj, todayObj);
  const isToday = dateStr === todayDateStr;
  const isCompleted = totalCount > 0 && completedCount >= totalCount;
  const isPartial = totalCount > 0 && completedCount > 0 && completedCount < totalCount;

  if (isAfter(dateObj, todayObj)) {
    status = 'future';
  } else if (isToday) {
    status = isCompleted ? 'completed' : 'pending';
  } else if (isPast) {
    status = isCompleted ? 'completed' : isPartial ? 'partial' : 'failed';
  }

  return { status, completedCount, totalCount };
};

export const calculateStreak = (tasks: Task[], taskCompletions: TaskCompletion[]) => {
  let streak = 0;
  const today = new Date();
  
  // Check from today backwards
  for (let i = 0; i < 100; i++) {
    const dateToCheck = new Date(today);
    dateToCheck.setDate(today.getDate() - i);
    const dateStr = format(dateToCheck, 'yyyy-MM-dd');
    
    const { status } = calculateDayStatus(dateStr, tasks, taskCompletions);
    
    if (status === 'completed') {
      streak++;
    } else if (status === 'failed' || status === 'partial') {
      // If we missed yesterday or earlier, streak is broken. 
      break; 
    }
  }
  return streak;
};
