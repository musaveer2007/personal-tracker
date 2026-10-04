import { supabase } from '../supabase';

export type UserRole = 'INDIVIDUAL' | 'TRAINER' | 'GYM_ADMIN';

export const AuthorizationService = {
  async getUserRoles(profileId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('profile_id', profileId);
      
    if (error || !data) return ['INDIVIDUAL']; // Fallback
    return data.map(r => r.role as UserRole);
  },

  async hasRole(profileId: string, requiredRole: UserRole): Promise<boolean> {
    const roles = await this.getUserRoles(profileId);
    return roles.includes(requiredRole);
  },

  async canAccessClient(coachId: string, clientId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('coach_clients')
      .select('status')
      .eq('coach_id', coachId)
      .eq('client_id', clientId)
      .single();
      
    if (error || !data) return false;
    return data.status === 'ACTIVE';
  },

  async getClientPermissions(coachId: string, clientId: string): Promise<Record<string, boolean>> {
    const { data, error } = await supabase
      .from('coach_clients')
      .select('permissions')
      .eq('coach_id', coachId)
      .eq('client_id', clientId)
      .single();
      
    if (error || !data) return {};
    return data.permissions || {};
  }
};
