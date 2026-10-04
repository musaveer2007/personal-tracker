import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';
import { getTodayStr } from '../../lib/dateUtils';
import { DAILY_GRIT_CAP } from '../../lib/grit';

export const TodayGrit = () => {
  const { user } = useAuthStore();
  const [todayPoints, setTodayPoints] = useState(0);
  const [events, setEvents] = useState<{ id: string; event_type: string; points: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = getTodayStr();
    
    const fetchTodayGrit = async () => {
      const { data } = await supabase
        .from('grit_events')
        .select('id, event_type, points')
        .eq('profile_id', user.id)
        .eq('local_date', today)
        .order('created_at', { ascending: false });
        
      if (data) {
        setEvents(data);
        setTodayPoints(data.reduce((sum, e) => sum + e.points, 0));
      }
    };

    fetchTodayGrit();

    const channel = supabase
      .channel('public:grit_events:today')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'grit_events',
        filter: `profile_id=eq.${user.id}`
      }, (payload) => {
        const newEvent = payload.new as any;
        if (newEvent.local_date === today) {
          setEvents(prev => [newEvent, ...prev]);
          setTodayPoints(prev => prev + newEvent.points);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-surface border border-border p-5 rounded-xl mb-6">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-xs font-bold text-textMuted tracking-widest uppercase">Today's GRIT</h2>
        <p className="text-sm font-black text-primary uppercase">{todayPoints} / {DAILY_GRIT_CAP}</p>
      </div>
      
      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, (todayPoints / DAILY_GRIT_CAP) * 100)}%` }}
        />
      </div>

      {events.length > 0 ? (
        <div className="space-y-1.5 mt-4">
          {events.slice(0, 4).map(e => (
            <div key={e.id} className="flex justify-between items-center text-xs font-medium">
              <span className="text-textMuted">{e.event_type.replace(/_/g, ' ')}</span>
              <span className="text-primary font-bold">+{e.points}</span>
            </div>
          ))}
          {events.length > 4 && (
            <p className="text-[10px] text-textMuted text-center pt-1 italic">and {events.length - 4} more...</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-textMuted font-medium text-center italic mt-4">Complete habits to earn GRIT.</p>
      )}
    </div>
  );
};
