import { supabase } from './supabase';

export interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: string;
  start_date: string;
  end_date: string;
  challenger_score: number;
  opponent_score: number;
}

export const battleService = {
  async getMyBattles(profileId: string): Promise<Battle[]> {
    const { data, error } = await supabase
      .from('friend_battles')
      .select('*')
      .or(`challenger_id.eq.${profileId},opponent_id.eq.${profileId}`);
      
    if (error) throw error;
    return data as Battle[];
  },

  async createBattle(challengerId: string, opponentId: string, durationDays: number): Promise<void> {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + durationDays);

    const { error } = await supabase
      .from('friend_battles')
      .insert({
        challenger_id: challengerId,
        opponent_id: opponentId,
        status: 'PENDING',
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0]
      });
      
    if (error) throw error;
  },
  
  async acceptBattle(battleId: string): Promise<void> {
    const { error } = await supabase
      .from('friend_battles')
      .update({ status: 'ACTIVE' })
      .eq('id', battleId);
    if (error) throw error;
  }
};
