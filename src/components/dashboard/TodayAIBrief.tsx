import { useState, useEffect } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { aiService } from '../../lib/ai/aiService';
import type { AIResponse } from '../../lib/ai/aiService';
import { useAuthStore } from '../../lib/auth';

export const TodayAIBrief = () => {
  const { user } = useAuthStore();
  const [briefing, setBriefing] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadBrief = async () => {
      try {
        const response = await aiService.getDailyBriefing(user.id);
        setBriefing(response);
      } catch (err) {
        console.error("Failed to load AI briefing:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBrief();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-surface/30 border border-border/50 rounded-2xl p-6 mb-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div className="h-4 w-32 bg-surfaceHighlight rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-surface rounded"></div>
          <div className="h-3 w-1/2 bg-surface rounded"></div>
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="bg-gradient-to-br from-surface to-background border border-purple-500/20 rounded-2xl p-6 mb-8 shadow-xl shadow-purple-900/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles className="w-32 h-32 text-purple-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase">ARC</h3>
            <p className="text-[10px] font-bold text-textMuted tracking-widest uppercase">Your Personal Intelligence</p>
          </div>
        </div>
        
        <div className="prose prose-invert prose-sm max-w-none text-textMuted font-medium whitespace-pre-wrap">
          {briefing.content}
        </div>
        
        {briefing.confidence === 'INSUFFICIENT_CONTEXT' && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-orange-400 tracking-widest uppercase bg-orange-400/10 px-3 py-1.5 rounded-lg border border-orange-400/20 w-fit">
            <Activity className="w-3 h-3" /> Note: More data needed for accurate insights
          </div>
        )}
      </div>
    </div>
  );
};
