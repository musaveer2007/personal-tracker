import { useRootStore } from '../../data/store';
import { calculateStreak } from '../dateUtils';
import { supabase } from '../supabase';

export type AIContextCategory = 'TRAINING' | 'NUTRITION' | 'RECOVERY' | 'PROGRESS' | 'GAMIFICATION' | 'SOCIAL';

export interface AIFitnessContext {
  identity: {
    username: string;
    goal: string;
  };
  training?: any;
  nutrition?: any;
  recovery?: any;
  gamification?: any;
  social?: any;
}

/**
 * contextBuilder gathers only the required fitness data.
 * It strictly filters out contexts not requested by the specific AI feature.
 */
export const buildFitnessContext = async (
  profileId: string, 
  categories: AIContextCategory[]
): Promise<AIFitnessContext> => {
  const root = useRootStore.getState();
  const profile = root.profiles[profileId];
  if (!profile) throw new Error("Profile not found");
  
  const context: AIFitnessContext = {
    identity: {
      username: profileId,
      goal: profile.fitnessGoal || 'General Fitness'
    }
  };

  if (categories.includes('GAMIFICATION')) {
    const grit = root.gritBalances[profileId] || { totalXP: 0, currentLevel: 1 };
    context.gamification = {
      level: grit.currentLevel,
      totalGrit: grit.totalXP,
      streak: calculateStreak(profile.tasks, profile.taskCompletions)
    };
  }

  if (categories.includes('TRAINING')) {
    const recentWorkouts = profile.taskCompletions
      .filter((tc: any) => tc.completed)
      .slice(0, 7)
      .map((tc: any) => {
         const t = profile.tasks.find((x: any) => x.id === tc.taskId);
         return { date: tc.date, title: t?.name, category: t?.category };
      });
    context.training = { recentWorkouts };
  }

  if (categories.includes('NUTRITION')) {
    const nutritionTasks = profile.tasks.filter((t: any) => t.category === 'nutrition');
    context.nutrition = {
      targets: nutritionTasks.map((t: any) => t.name),
    };
  }

  if (categories.includes('RECOVERY')) {
    const recoveryTasks = profile.tasks.filter((t: any) => t.category === 'recovery');
    context.recovery = {
      targets: recoveryTasks.map((t: any) => t.name),
    };
  }

  if (categories.includes('SOCIAL')) {
    // Basic social standings
    const { data } = await supabase
      .from('grit_balances')
      .select('total_xp')
      .eq('profile_id', profileId)
      .single();
    context.social = {
      currentGritBalance: data?.total_xp || 0
    };
  }

  return context;
};
