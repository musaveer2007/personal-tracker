import { supabase } from './supabase';

export interface Squad {
  id: string;
  name: string;
  slug: string;
  description?: string;
  privacy: string;
  member_count?: number;
}

export const squadService = {
  async getMySquads(profileId: string): Promise<Squad[]> {
    const { data: members, error: mError } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('profile_id', profileId)
      .eq('status', 'ACTIVE');
      
    if (mError) throw mError;
    if (!members.length) return [];
    
    const { data, error } = await supabase
      .from('squads')
      .select('*, member_count:squad_members(count)')
      .in('id', members.map(m => m.squad_id));
      
    if (error) throw error;
    return data.map(s => ({
      ...s,
      member_count: s.member_count?.[0]?.count || 0
    })) as Squad[];
  },

  async createSquad(name: string, description: string, profileId: string): Promise<Squad> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
    
    const { data, error } = await supabase
      .from('squads')
      .insert({ name, slug, description, created_by_profile_id: profileId, privacy: 'PUBLIC' })
      .select()
      .single();
      
    if (error) throw error;
    
    await supabase.from('squad_members').insert({
      squad_id: data.id,
      profile_id: profileId,
      role: 'OWNER',
      status: 'ACTIVE'
    });
    
    return data as Squad;
  }
};
