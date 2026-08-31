import { differenceInDays, format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const getChallengeStats = (startDateStr: string, endDateStr: string) => {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const today = startOfDay(new Date());

  const totalDays = 100; // Hardcoded for 100 days challenge
  
  if (isBefore(today, start)) {
    const daysUntilStart = differenceInDays(start, today);
    return {
      status: 'upcoming',
      currentDay: 0,
      daysCompleted: 0,
      daysRemaining: totalDays,
      completionPercentage: 0,
      daysUntilStart,
    };
  }

  if (isAfter(today, end)) {
    return {
      status: 'completed',
      currentDay: 100,
      daysCompleted: 100,
      daysRemaining: 0,
      completionPercentage: 100,
      daysUntilStart: 0,
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
  };
};

export const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d, yyyy');
};
