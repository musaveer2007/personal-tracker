import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { leaderboardService } from '../lib/leaderboard';
import type { LeaderboardEntry, LeaderboardScope, LeaderboardPeriod } from '../lib/leaderboard';
import { Trophy, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const LEAGUE_COLORS: Record<string, string> = {
  BRONZE: 'text-orange-700',
  SILVER: 'text-slate-400',
  GOLD: 'text-yellow-400',
  PLATINUM: 'text-teal-400',
  DIAMOND: 'text-blue-400',
  ELITE: 'text-purple-500'
};

export const Leaderboards = () => {
  const { user } = useAuthStore();
  const [scope, setScope] = useState<LeaderboardScope>('FRIENDS');
  const [period, setPeriod] = useState<LeaderboardPeriod>('THIS_WEEK');
  
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [scope, period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getLeaderboard(scope, period);
      setEntries(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load leaderboard');
    }
    setLoading(false);
  };

  const currentUserEntry = entries.find(e => e.profile_id === user?.id);

  // Top 3 Podium
  const top3 = entries.slice(0, 3);
  const others = entries.slice(3);

  const getPodiumOrder = (entries: LeaderboardEntry[]) => {
    // 2nd, 1st, 3rd visually
    const order = [];
    if (entries[1]) order.push({ ...entries[1], position: 2 });
    if (entries[0]) order.push({ ...entries[0], position: 1 });
    if (entries[2]) order.push({ ...entries[2], position: 3 });
    return order;
  };

  return (
    <div className="pb-32 animate-fade-in relative min-h-screen">
      <div className="mb-6 px-4 pt-4">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" /> LEADERBOARD
        </h1>
        <p className="text-textMuted font-medium tracking-wider text-sm mt-1 uppercase">COMPETE WITH CONSISTENCY</p>
      </div>

      {/* Scope Toggles */}
      <div className="px-4 mb-6">
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          <button
            onClick={() => setScope('FRIENDS')}
            className={cn(
              "flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-lg transition-colors",
              scope === 'FRIENDS' ? "bg-primary text-black" : "text-textMuted hover:text-white"
            )}
          >
            FRIENDS
          </button>
          <button
            onClick={() => setScope('GLOBAL')}
            className={cn(
              "flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-lg transition-colors",
              scope === 'GLOBAL' ? "bg-primary text-black" : "text-textMuted hover:text-white"
            )}
          >
            GLOBAL
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="px-4 mb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['THIS_WEEK', 'THIS_MONTH', 'ALL_TIME'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as LeaderboardPeriod)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase whitespace-nowrap border transition-all",
                period === p ? "border-primary text-primary bg-primary/10" : "border-border text-textMuted bg-surface hover:border-textMuted"
              )}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="px-4 text-center py-12 text-red-500 font-bold uppercase tracking-widest text-sm border border-red-500/20 rounded-xl bg-red-500/5 mx-4">
          {error}
        </div>
      ) : loading ? (
        <div className="px-4 flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="h-20 bg-surface animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="px-4 text-center py-16">
          <Shield className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase mb-2">No Competitors Yet</h3>
          {scope === 'FRIENDS' ? (
             <p className="text-textMuted text-sm mb-6">Add friends to start competing.</p>
          ) : (
             <p className="text-textMuted text-sm mb-6">No activity recorded for this period.</p>
          )}
          {scope === 'FRIENDS' && (
             <Link to="/friends" className="bg-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg hover:bg-primary/90">
               Find Friends
             </Link>
          )}
        </div>
      ) : (
        <>
          {/* PODIUM */}
          {top3.length >= 3 && (
            <div className="px-4 mb-10 flex items-end justify-center gap-2 mt-12">
              {getPodiumOrder(top3).map((entry) => (
                <div key={entry.profile_id} className={cn("flex flex-col items-center", 
                   entry.position === 1 ? "w-1/3 z-10" : "w-1/4 opacity-90"
                )}>
                  <Link to={`/u/${entry.username}`} className="flex flex-col items-center">
                    <div className="relative mb-3">
                       <div className={cn("rounded-full bg-surfaceHighlight flex items-center justify-center border-4 border-background overflow-hidden",
                         entry.position === 1 ? "w-20 h-20" : "w-16 h-16"
                       )}>
                          {entry.avatar_url ? (
                             <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <span className="font-black text-textMuted uppercase text-xl">{entry.display_name?.charAt(0) || 'U'}</span>
                          )}
                       </div>
                       <div className={cn("absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center font-black text-xs",
                         entry.position === 1 ? "bg-yellow-400 text-yellow-900" : entry.position === 2 ? "bg-slate-300 text-slate-700" : "bg-orange-400 text-orange-900"
                       )}>
                         #{entry.position}
                       </div>
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-white uppercase truncate max-w-[80px] text-xs mb-1">{entry.display_name}</span>
                      <span className="block font-bold text-primary text-[10px] tracking-widest">{entry.score}</span>
                    </div>
                  </Link>
                  <div className={cn("w-full bg-surface border border-border rounded-t-lg mt-4",
                     entry.position === 1 ? "h-32 bg-primary/10 border-primary/20" : entry.position === 2 ? "h-24" : "h-16"
                  )}>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST */}
          <div className="px-4 space-y-3 pb-24">
            {(top3.length < 3 ? entries : others).map((entry) => (
              <Link key={entry.profile_id} to={`/u/${entry.username}`} className={cn("block bg-surface border rounded-2xl p-4 transition-all hover:bg-surfaceHighlight",
                 entry.profile_id === user?.id ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5" : "border-border"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-black text-2xl text-textMuted w-8 text-center opacity-50">
                      {entry.rank}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center border border-border overflow-hidden">
                       {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                          <span className="font-black text-textMuted uppercase text-lg">{entry.display_name?.charAt(0) || 'U'}</span>
                       )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white uppercase">{entry.display_name}</span>
                        {entry.profile_id === user?.id && <span className="bg-primary text-black text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest">You</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-textMuted text-[10px] font-bold tracking-widest uppercase">@{entry.username}</span>
                        <span className="text-textMuted text-[10px]">•</span>
                        <span className={cn("text-[10px] font-black tracking-widest uppercase", LEAGUE_COLORS[entry.league] || 'text-textMuted')}>
                          {entry.league}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-primary font-black text-lg">{entry.score}</span>
                    <span className="block text-textMuted text-[10px] font-bold tracking-widest uppercase">GRIT</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ANCHOR CURRENT USER IF NOT VISIBLE */}
      {!loading && currentUserEntry && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <Link to={`/u/${currentUserEntry.username}`} className="flex items-center justify-between bg-background/80 backdrop-blur-xl border border-primary p-4 rounded-2xl shadow-2xl shadow-primary/20">
              <div className="flex items-center gap-4">
                <div className="font-black text-2xl text-primary w-8 text-center">
                  #{currentUserEntry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white uppercase">YOU</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-black tracking-widest uppercase", LEAGUE_COLORS[currentUserEntry.league] || 'text-textMuted')}>
                      {currentUserEntry.league}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-primary font-black text-lg">{currentUserEntry.score}</span>
                <span className="block text-textMuted text-[10px] font-bold tracking-widest uppercase">GRIT</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
