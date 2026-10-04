import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export const GritToast = () => {
  const [toasts, setToasts] = useState<{ id: string; points: number; eventType: string }[]>([]);

  useEffect(() => {
    const handleGritAwarded = (e: any) => {
      const { points, eventType } = e.detail;
      const id = Math.random().toString(36).substring(7);
      setToasts(t => [...t, { id, points, eventType }]);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, 3000);
    };

    window.addEventListener('grit-awarded', handleGritAwarded);
    return () => window.removeEventListener('grit-awarded', handleGritAwarded);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="animate-in slide-in-from-right-8 fade-in duration-300 flex items-center gap-3 bg-surface border border-primary/30 rounded-xl px-4 py-3 shadow-2xl shadow-primary/20 backdrop-blur-md"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div>
            <p className="text-white font-black tracking-tight text-sm uppercase">+{toast.points} GRIT</p>
            <p className="text-textMuted text-[10px] font-bold tracking-widest uppercase">{toast.eventType.replace(/_/g, ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
