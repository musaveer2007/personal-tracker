import { supabase } from './supabase';
import { useAuthStore } from './auth';

export interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  fitness_goal?: string;
  activity_level?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  created_at: string;
  sender_profile?: PublicProfile;
  receiver_profile?: PublicProfile;
}

export interface Friendship {
  id: string;
  friend_id: string;
  created_at: string;
  friend_profile?: PublicProfile;
}

export const socialService = {
  /**
   * Search for users by username or display name
   */
  async searchUsers(query: string): Promise<PublicProfile[]> {
    const { user } = useAuthStore.getState();
    if (!user) return [];

    const searchQuery = query.trim().toLowerCase().replace('@', '');
    if (!searchQuery) return [];

    // Search public profiles (ignoring self)
    const { data, error } = await supabase
      .from('public_profiles')
      .select('*')
      .neq('id', user.id)
      .eq('discoverable', true)
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data as PublicProfile[];
  },

  /**
   * Send a friend request
   */
  async sendFriendRequest(targetId: string) {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');
    if (user.id === targetId) throw new Error('Cannot add yourself');

    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: targetId,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending request:', error);
      throw error;
    }
    return data;
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, senderId: string) {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    // Due to RLS and constraints, we do this in two steps or ideally an RPC.
    // For now, we update the request status, then insert the friendship.
    // Order matters for profileA and profileB constraints (profileA < profileB)
    const profileA = user.id < senderId ? user.id : senderId;
    const profileB = user.id < senderId ? senderId : user.id;

    // 1. Insert friendship
    const { error: friendshipError } = await supabase
      .from('friendships')
      .insert({
        profile_a_id: profileA,
        profile_b_id: profileB
      });

    if (friendshipError && friendshipError.code !== '23505') { // Ignore unique violation if already friends
      throw friendshipError;
    }

    // 2. Mark request as accepted
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) throw updateError;
    return true;
  },

  /**
   * Decline a friend request
   */
  async declineFriendRequest(requestId: string) {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'DECLINED', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  },

  /**
   * Cancel a sent request
   */
  async cancelFriendRequest(requestId: string) {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  },

  /**
   * Remove a friend
   */
  async removeFriend(friendId: string) {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    const profileA = user.id < friendId ? user.id : friendId;
    const profileB = user.id < friendId ? friendId : user.id;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('profile_a_id', profileA)
      .eq('profile_b_id', profileB);

    if (error) throw error;
    return true;
  },

  /**
   * Block a user
   */
  async blockUser(targetId: string) {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: targetId
      });

    if (error) throw error;

    // Optionally cleanup friendship if it existed
    try {
      await this.removeFriend(targetId);
    } catch (e) {
      // ignore
    }
    
    return true;
  },

  /**
   * Fetch user's friends
   */
  async fetchFriends(): Promise<PublicProfile[]> {
    const { user } = useAuthStore.getState();
    if (!user) return [];

    // Query friendships where user is profile_a or profile_b
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('profile_a_id, profile_b_id')
      .or(`profile_a_id.eq.${user.id},profile_b_id.eq.${user.id}`);

    if (error || !friendships) return [];

    const friendIds = friendships.map(f => 
      f.profile_a_id === user.id ? f.profile_b_id : f.profile_a_id
    );

    if (friendIds.length === 0) return [];

    const { data: profiles, error: profileError } = await supabase
      .from('public_profiles')
      .select('*')
      .in('id', friendIds);

    if (profileError) return [];
    return profiles as PublicProfile[];
  },

  /**
   * Fetch pending incoming requests
   */
  async fetchIncomingRequests(): Promise<FriendRequest[]> {
    const { user } = useAuthStore.getState();
    if (!user) return [];

    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'PENDING');

    if (error || !requests || requests.length === 0) return [];

    const senderIds = requests.map(r => r.sender_id);
    const { data: profiles, error: profileError } = await supabase
      .from('public_profiles')
      .select('*')
      .in('id', senderIds);

    if (profileError) return [];

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return requests.map(req => ({
      id: req.id,
      sender_id: req.sender_id,
      receiver_id: req.receiver_id,
      status: req.status as any,
      created_at: req.created_at,
      sender_profile: profileMap.get(req.sender_id) as PublicProfile
    }));
  }
};
