import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { TrainerService } from '../lib/trainer/trainerService';
import type { CoachClient } from '../lib/trainer/trainerService';
import { Users, AlertCircle, Activity, MessageSquare, Plus, ArrowRight } from 'lucide-react';

export const TrainerDashboard = () => {
  const { user } = useAuthStore();
  const [_clients, setClients] = useState<CoachClient[]>([]);
  const [_loading, setLoading] = useState(true);

  // Mock data for UI preview since DB might be empty
  const mockClients = [
    { id: '1', name: 'Arun', status: 'ON TRACK', adherence: 87, streak: 14, attention: false },
    { id: '2', name: 'Rahul', status: 'NEEDS ATTENTION', adherence: 61, streak: 3, attention: true },
    { id: '3', name: 'Karthik', status: 'ON TRACK', adherence: 94, streak: 28, attention: false },
  ];

  useEffect(() => {
    if (!user) return;
    const fetchClients = async () => {
      const dbClients = await TrainerService.getClients(user.id);
      setClients(dbClients);
      setLoading(false);
    };
    fetchClients();
  }, [user]);

  return (
    <div className="pb-32 animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">COACH DASHBOARD</h1>
          <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">TRAINER MODE</p>
        </div>
        <button className="bg-primary text-black font-black uppercase tracking-widest text-xs px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Invite Client
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-textMuted uppercase tracking-widest">Active</span>
          </div>
          <p className="text-2xl font-black text-white">24</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Attention</span>
          </div>
          <p className="text-2xl font-black text-orange-500">4</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-xs font-bold text-textMuted uppercase tracking-widest">Adherence</span>
          </div>
          <p className="text-2xl font-black text-white">87%</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-textMuted uppercase tracking-widest">Messages</span>
          </div>
          <p className="text-2xl font-black text-white">6</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">CLIENT OVERVIEW</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockClients.map(client => (
            <div key={client.id} className="bg-surface border border-border p-5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center font-bold text-white uppercase">
                    {client.name[0]}
                  </div>
                  {client.attention && (
                    <span className="bg-error/20 text-error text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                      Needs Attention
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white uppercase">{client.name}</h3>
                <p className="text-sm text-textMuted font-medium mb-1">{client.adherence}% adherence</p>
                <p className="text-sm text-textMuted font-medium">{client.streak} day streak</p>
              </div>
              <button className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-surfaceHighlight hover:bg-border rounded-lg text-xs font-bold text-white uppercase tracking-widest transition-colors">
                View Profile <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
