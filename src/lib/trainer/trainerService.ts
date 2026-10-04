import { supabase } from '../supabase';

export interface CoachClient {
  client_id: string;
  status: string;
  relationship_type: string;
  started_at: string;
  permissions: Record<string, boolean>;
}

export const TrainerService = {
  async getClients(coachId: string): Promise<CoachClient[]> {
    const { data, error } = await supabase
      .from('coach_clients')
      .select('*')
      .eq('coach_id', coachId);
      
    if (error) return [];
    return data;
  },

  async inviteClient(coachId: string, clientId: string): Promise<boolean> {
    const { error } = await supabase
      .from('coach_clients')
      .insert({
        coach_id: coachId,
        client_id: clientId,
        status: 'PENDING'
      });
      
    return !error;
  },

  async getClientAdherence(_clientId: string): Promise<number> {
    // In production, this pulls from ProgressAnalyticsService or an aggregated edge function
    // For now, return a mock adherence score
    return Math.floor(Math.random() * 40) + 60; // 60-100% mock adherence
  }
};
