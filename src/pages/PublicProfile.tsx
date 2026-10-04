import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth';
import { Activity, Flame, UserPlus, ShieldBan, ShieldAlert, Crown, Medal } from 'lucide-react';
import { socialService } from '../lib/social';
import { getLevelTitle } from '../lib/grit';

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  fitnessGoal?: string;
  isFriend: boolean;
  totalXP?: number;
  currentLevel?: number;
  league?: string;
  globalRank?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_user_profile', {
          target_username: username
        });

        if (error) throw error;
        if (!data) throw new Error('Profile not found or private');

        setProfile(data as ProfileData);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleAddFriend = async () => {
    if (!profile) return;
    try {
      await socialService.sendFriendRequest(profile.id);
      alert('Friend request sent!');
    } catch (e: any) {
      alert(e.message || 'Error sending request');
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    if (confirm('Are you sure you want to block this user?')) {
      try {
        await socialService.blockUser(profile.id);
        setError('Profile blocked');
        setProfile(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-textMuted p-8 font-bold uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Activity className="w-12 h-12 text-textMuted mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white uppercase mb-2">Profile Unavailable</h1>
        <p className="text-textMuted mb-6 text-sm">{error || 'This user does not exist or has set their profile to private.'}</p>
        <Link to="/friends" className="bg-surfaceHighlight text-white font-bold tracking-widest uppercase text-xs px-6 py-3 rounded-lg hover:bg-surface/80">
          Go Back
        </Link>
      </div>
    );
  }

  const isSelf = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-12 max-w-2xl mx-auto animate-fade-in">
      <Link to="/friends" className="text-xs font-bold text-textMuted tracking-widest uppercase hover:text-white mb-8 inline-block">
        ← Back
      </Link>

      <div className="bg-surface border border-border rounded-3xl p-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center text-center relative z-10 mb-10">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background mb-4 shadow-xl shadow-primary/10">
            <span className="font-black text-primary uppercase text-4xl">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : (profile.displayName?.charAt(0) || profile.username.charAt(0))}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">{profile.displayName}</h1>
          <p className="text-primary text-sm font-bold tracking-widest uppercase">@{profile.username}</p>
          
          {profile.fitnessGoal && (
            <div className="mt-3 bg-background/50 backdrop-blur px-4 py-1.5 rounded-full border border-border">
              <span className="text-[10px] font-black tracking-widest text-textMuted uppercase">{profile.fitnessGoal}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          {profile.currentLevel !== undefined ? (
            <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1">Level {profile.currentLevel}</span>
              <span className="text-xl font-black text-primary uppercase">{getLevelTitle(profile.currentLevel)}</span>
              <span className="text-xs font-medium text-textMuted mt-1">{profile.totalXP?.toLocaleString()} GRIT</span>
            </div>
          ) : (
             <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center justify-center">
               <ShieldAlert className="w-5 h-5 text-textMuted mb-2" />
               <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Grit Hidden</span>
             </div>
          )}

          {profile.league ? (
            <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center">
              <Crown className="w-6 h-6 text-blue-400 mb-1" />
              <span className="text-xl font-black text-blue-400 uppercase">{profile.league}</span>
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase mt-1">League</span>
            </div>
          ) : (
             <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center justify-center">
               <ShieldAlert className="w-5 h-5 text-textMuted mb-2" />
               <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">League Hidden</span>
             </div>
          )}

          {profile.currentStreak !== undefined ? (
            <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center">
              <Flame className="w-6 h-6 text-orange-500 mb-1" />
              <span className="text-xl font-black text-white uppercase">{profile.currentStreak} Day</span>
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase mt-1">Streak</span>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center justify-center">
              <ShieldAlert className="w-5 h-5 text-textMuted mb-2" />
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Streak Hidden</span>
            </div>
          )}

          {profile.globalRank ? (
            <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center">
              <Medal className="w-6 h-6 text-primary mb-1" />
              <span className="text-xl font-black text-white uppercase">#{profile.globalRank}</span>
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase mt-1">Global</span>
            </div>
          ) : (
             <div className="bg-background border border-border rounded-2xl p-5 flex flex-col items-center text-center justify-center">
               <ShieldAlert className="w-5 h-5 text-textMuted mb-2" />
               <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Rank Hidden</span>
             </div>
          )}
        </div>

        {/* Actions */}
        {!isSelf && (
          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            {profile.isFriend ? (
              <button disabled className="flex-1 bg-surfaceHighlight border border-border text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 opacity-50">
                <Activity className="w-4 h-4" /> Friends
              </button>
            ) : (
              <button onClick={handleAddFriend} className="flex-1 bg-primary text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" /> Add Friend
              </button>
            )}
            
            <button onClick={handleBlock} className="px-6 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
              <ShieldBan className="w-4 h-4" /> Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
