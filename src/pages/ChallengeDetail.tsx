import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowLeft, CheckCircle2, Shield, Activity } from 'lucide-react';
import { challengeService } from '../lib/challenges';
import type { Challenge } from '../lib/challenges';
import { useAuthStore } from '../lib/auth';
import { getChallengeStats } from '../lib/dateUtils';

export const ChallengeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!slug || !user) return;
    const loadData = async () => {
      try {
        const c = await challengeService.getChallenge(slug);
        setChallenge(c);
        if (c) {
          const mine = await challengeService.getMyChallenges(user.id);
          setIsJoined(mine.some(m => m.id === c.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug, user]);

  const handleJoin = async () => {
    if (!challenge || !user || processing) return;
    setProcessing(true);
    try {
      await challengeService.joinChallenge(challenge.id, user.id);
      setIsJoined(true);
      if (challenge.participants_count !== undefined) challenge.participants_count++;
    } catch (e) {
      console.error(e);
      alert('Failed to join challenge');
    }
    setProcessing(false);
  };

  const handleLeave = async () => {
    if (!challenge || !user || processing) return;
    if (!confirm('Are you sure you want to leave this challenge? Your progress will be retained if you rejoin.')) return;
    setProcessing(true);
    try {
      await challengeService.leaveChallenge(challenge.id, user.id);
      setIsJoined(false);
      if (challenge.participants_count !== undefined) challenge.participants_count--;
    } catch (e) {
      console.error(e);
      alert('Failed to leave challenge');
    }
    setProcessing(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-textMuted font-bold uppercase tracking-widest">Loading...</div>;
  }

  if (!challenge) {
    return (
      <div className="p-8 text-center text-white">
        <h2 className="text-2xl font-black uppercase mb-4">Challenge Not Found</h2>
        <button onClick={() => navigate('/challenges')} className="text-primary font-bold tracking-widest uppercase">Go Back</button>
      </div>
    );
  }

  const isWinterArc = challenge.slug === 'winter-arc-100';
  const stats = getChallengeStats(challenge.start_date, challenge.end_date);

  return (
    <div className="pb-32 animate-fade-in relative min-h-screen">
      <div className={`pt-12 pb-8 px-4 ${isWinterArc ? 'bg-gradient-to-br from-blue-900/60 to-background border-b border-blue-500/20' : 'bg-surface border-b border-border'}`}>
        <Link to="/challenges" className="text-xs font-bold text-textMuted tracking-widest uppercase hover:text-white mb-8 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </Link>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase mb-4">{challenge.name}</h1>
        <p className="text-textMuted font-medium text-lg mb-6">{challenge.description}</p>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-xl border border-border shadow-sm">
            <Calendar className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Duration</span>
              <span className="text-sm font-black text-white tracking-widest uppercase">{challenge.rules?.duration || 0} DAYS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-xl border border-border shadow-sm">
            <Users className="w-5 h-5 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Competitors</span>
              <span className="text-sm font-black text-white tracking-widest uppercase">{challenge.participants_count?.toLocaleString() || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-xl border border-border shadow-sm">
            <Shield className="w-5 h-5 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Status</span>
              <span className="text-sm font-black text-white tracking-widest uppercase">{stats.status}</span>
            </div>
          </div>
        </div>

        {isJoined ? (
          <div className="flex flex-col gap-3">
             <div className="bg-success/10 border border-success/30 px-6 py-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-6 h-6 text-success" />
                   <div>
                     <p className="text-success font-black tracking-widest uppercase text-sm">YOU ARE IN.</p>
                     <p className="text-success/70 text-xs font-bold tracking-widest uppercase">STAY CONSISTENT.</p>
                   </div>
                </div>
                <Link to="/leaderboards" className="bg-success text-success-900 px-4 py-2 rounded-lg font-black tracking-widest uppercase text-xs hover:bg-success/90">
                  Leaderboard
                </Link>
             </div>
             <button onClick={handleLeave} disabled={processing} className="text-red-500/70 hover:text-red-500 font-bold uppercase tracking-widest text-[10px] text-center w-full mt-2">
               Leave Challenge
             </button>
          </div>
        ) : (
          <button 
            onClick={handleJoin} 
            disabled={processing}
            className="w-full bg-primary text-black font-black text-lg py-5 rounded-xl tracking-widest uppercase hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
          >
            {processing ? 'JOINING...' : 'JOIN CHALLENGE'}
          </button>
        )}
      </div>

      <div className="px-4 py-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4 flex items-center gap-2">
           <Activity className="w-4 h-4 text-primary" /> TIMELINE
        </h2>
        <div className="bg-surface border border-border p-6 rounded-2xl">
           <div className="flex justify-between items-center mb-6">
             <div className="text-center">
                <span className="block text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1">STARTS</span>
                <span className="block text-white font-black uppercase text-sm">{new Date(challenge.start_date).toLocaleDateString()}</span>
             </div>
             <div className="h-px bg-border flex-1 mx-4 relative">
                <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${stats.completionPercentage}%` }}></div>
             </div>
             <div className="text-center">
                <span className="block text-[10px] font-bold text-textMuted tracking-widest uppercase mb-1">ENDS</span>
                <span className="block text-white font-black uppercase text-sm">{new Date(challenge.end_date).toLocaleDateString()}</span>
             </div>
           </div>
           
           <div className="bg-background rounded-xl p-4 text-center">
             <span className="block text-3xl font-black text-primary uppercase">{stats.currentDay} / {stats.totalDays}</span>
             <span className="block text-xs font-bold text-textMuted tracking-widest uppercase mt-1">DAYS COMPLETE</span>
           </div>
        </div>
      </div>
    </div>
  );
};
