import { supabase } from './supabase';

export interface Challenge {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  visibility: string;
  start_date: string;
  end_date: string;
  rules: any;
  max_participants?: number;
  participants_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  profile_id: string;
  status: string;
  joined_at: string;
}

export const challengeService = {
  async getPublicChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*, participants_count:challenge_participants(count)')
      .eq('visibility', 'PUBLIC')
      .neq('status', 'DRAFT')
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    // Transform count array into number
    return data.map(c => ({
      ...c,
      participants_count: c.participants_count?.[0]?.count || 0
    })) as Challenge[];
  },

  async getMyChallenges(profileId: string): Promise<Challenge[]> {
    const { data: participants, error: pError } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('profile_id', profileId)
      .eq('status', 'ACTIVE');
      
    if (pError) throw pError;
    if (!participants.length) return [];
    
    const challengeIds = participants.map(p => p.challenge_id);
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*, participants_count:challenge_participants(count)')
      .in('id', challengeIds);
      
    if (error) throw error;
    
    return data.map(c => ({
      ...c,
      participants_count: c.participants_count?.[0]?.count || 0
    })) as Challenge[];
  },

  async getChallenge(slug: string): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*, participants_count:challenge_participants(count)')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }
    
    return {
      ...data,
      participants_count: data.participants_count?.[0]?.count || 0
    } as Challenge;
  },

  async joinChallenge(challengeId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        profile_id: profileId,
        status: 'ACTIVE'
      });
      
    if (error) throw error;
  },

  async leaveChallenge(challengeId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('challenge_participants')
      .update({ status: 'LEFT', left_at: new Date().toISOString() })
      .eq('challenge_id', challengeId)
      .eq('profile_id', profileId);
      
    if (error) throw error;
  }
};
