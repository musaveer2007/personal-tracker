import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar as CalendarIcon, ArrowRight, Activity, Shield, Swords } from 'lucide-react';
import { challengeService } from '../lib/challenges';
import type { Challenge } from '../lib/challenges';
import { useAuthStore } from '../lib/auth';
import { Link } from 'react-router-dom';

export const Challenges = () => {
  const { user } = useAuthStore();
  const [publicChallenges, setPublicChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'squads' | 'battles'>('challenges');

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [pub, mine] = await Promise.all([
          challengeService.getPublicChallenges(),
          challengeService.getMyChallenges(user.id)
        ]);
        setPublicChallenges(pub);
        setMyChallenges(mine);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="pb-32 px-4 pt-4 animate-pulse space-y-6">
        <div className="h-10 w-48 bg-surface rounded-xl"></div>
        <div className="h-40 w-full bg-surface rounded-xl"></div>
        <div className="h-40 w-full bg-surface rounded-xl"></div>
      </div>
    );
  }

  // Filter out challenges I've already joined from the public list for discovery
  const joinedIds = new Set(myChallenges.map(c => c.id));
  const discoverable = publicChallenges.filter(c => !joinedIds.has(c.id));

  return (
    <div className="pb-32 animate-fade-in relative min-h-screen">
      <div className="mb-8 px-4 pt-4">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" /> CHALLENGES
        </h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">COMPETE AND CONQUER</p>
      </div>

      <div className="px-4 mb-6">
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-lg transition-colors ${activeTab === 'challenges' ? "bg-primary text-black" : "text-textMuted hover:text-white"}`}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-lg transition-colors ${activeTab === 'squads' ? "bg-primary text-black" : "text-textMuted hover:text-white"}`}
          >
            Squads
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-lg transition-colors ${activeTab === 'battles' ? "bg-primary text-black" : "text-textMuted hover:text-white"}`}
          >
            Battles
          </button>
        </div>
      </div>

      {activeTab === 'challenges' && (
        <>
          {myChallenges.length > 0 && (
            <div className="px-4 mb-10">
              <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">MY CHALLENGES</h2>
              <div className="space-y-4">
                {myChallenges.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} isJoined={true} />
                ))}
              </div>
            </div>
          )}

          <div className="px-4 mb-10">
            <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> DISCOVER
            </h2>
            {discoverable.length === 0 ? (
               <div className="bg-surface border border-border rounded-xl p-8 text-center">
                 <Shield className="w-10 h-10 text-textMuted mx-auto mb-3" />
                 <p className="text-white font-black uppercase text-lg">ALL CAUGHT UP</p>
                 <p className="text-textMuted text-xs font-bold uppercase tracking-widest mt-1">NO NEW CHALLENGES TO JOIN.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {discoverable.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} isJoined={false} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'squads' && (
        <div className="px-4 text-center py-16">
          <Users className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase mb-2">Build Your Squad</h3>
          <p className="text-textMuted text-sm mb-6">Train together. Compete together. Finish together.</p>
          <button className="bg-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg hover:bg-primary/90">
            Create Squad
          </button>
        </div>
      )}

      {activeTab === 'battles' && (
        <div className="px-4 text-center py-16">
          <Swords className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase mb-2">No Active Battles</h3>
          <p className="text-textMuted text-sm mb-6">Challenge a friend to a 1v1 consistency duel.</p>
          <button className="bg-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg hover:bg-primary/90">
            Challenge Friend
          </button>
        </div>
      )}
    </div>
  );
};

const ChallengeCard = ({ challenge, isJoined }: { challenge: Challenge, isJoined: boolean }) => {
  const isWinterArc = challenge.slug === 'winter-arc-100';

  return (
    <Link to={`/challenges/${challenge.slug}`} className="block bg-surface border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
      <div className={`p-6 ${isWinterArc ? 'bg-gradient-to-br from-blue-900/40 to-background border-b border-blue-500/20' : 'bg-surfaceHighlight/50 border-b border-border'}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">{challenge.name}</h3>
          {isJoined && (
            <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              JOINED
            </span>
          )}
        </div>
        <p className="text-sm text-textMuted font-medium mb-4">{challenge.description}</p>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-lg border border-border">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold tracking-widest text-white uppercase">{challenge.rules?.duration || 0} DAYS</span>
          </div>
          <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-lg border border-border">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold tracking-widest text-white uppercase">{challenge.participants_count?.toLocaleString() || 0} PARTICIPANTS</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 flex items-center justify-between bg-surface">
        <span className="text-xs font-bold tracking-widest text-textMuted uppercase">Starts: {new Date(challenge.start_date).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 text-xs font-black tracking-widest text-primary uppercase group-hover:translate-x-1 transition-transform">
          VIEW <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};
