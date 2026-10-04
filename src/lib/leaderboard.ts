import { supabase } from './supabase';

export type LeaderboardScope = 'GLOBAL' | 'FRIENDS';
export type LeaderboardPeriod = 'THIS_WEEK' | 'THIS_MONTH' | 'ALL_TIME';

export interface LeaderboardEntry {
  profile_id: string;
  score: number;
  rank: number;
  league: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export const leaderboardService = {
  async getLeaderboard(scope: LeaderboardScope, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (period === 'THIS_WEEK') {
      const now = new Date();
      const day = now.getDay() || 7; // Get current day number, converting Sun(0) to 7
      if (day !== 1) { // If not Monday
        now.setHours(-24 * (day - 1)); // Back to Monday
      }
      startDate = now.toISOString().split('T')[0];
    } else if (period === 'THIS_MONTH') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = firstDay.toISOString().split('T')[0];
    }

    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_scope: scope,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) {
      console.error('Leaderboard error:', error);
      throw error;
    }
    
    return data as LeaderboardEntry[];
  }
};
