import { useNavigate } from 'react-router-dom';
import { useRootStore } from '../data/store';
import { useAuthStore } from '../lib/auth';
import { ArrowRight } from 'lucide-react';

export const Home = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const switchProfile = useRootStore(state => state.switchProfile);

  const handleSelectProfile = (id: string) => {
    switchProfile(id);
    navigate(`/profile/${id}/today`);
  };

  // Demo profiles don't show full stats on home anymore to save space
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-textMain mb-3">WINTER ARC</h1>
        <p className="text-sm md:text-base font-medium tracking-widest text-textMuted uppercase">100 DAYS. TWO JOURNEYS. ONE GOAL.</p>
        <p className="text-xs md:text-sm font-semibold tracking-widest text-primary mt-6">CHOOSE YOUR ARC.</p>
      </div>

        {/* Personal Arc Card */}
        {isAuthenticated && user ? (
          <button 
            onClick={() => navigate(`/profile/${user.id}/today`)}
            className="flex-[1_1_300px] group relative bg-primary/10 border border-primary hover:border-primary/80 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight text-white mb-1 uppercase">My Profile</h2>
              <p className="text-sm font-bold tracking-widest text-primary mb-8">MY FITNESS IDENTITY</p>
              
              <div className="flex items-center text-sm font-bold tracking-wider text-white group-hover:text-primary transition-colors">
                ENTER MY ARC <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        ) : (
          <button 
            onClick={() => navigate(`/auth`)}
            className="flex-[1_1_300px] group relative bg-surface border border-border hover:border-primary/50 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight text-textMain mb-1 uppercase">Join Platform</h2>
              <p className="text-sm font-bold tracking-widest text-primary mb-8">CREATE YOUR IDENTITY</p>
              
              <div className="flex items-center text-sm font-bold tracking-wider text-textMain group-hover:text-primary transition-colors mt-auto pt-16">
                LOGIN / REGISTER <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        )}

        <div className="w-full text-center mt-8 mb-4 border-t border-border pt-8">
          <p className="text-xs md:text-sm font-semibold tracking-widest text-textMuted uppercase">OR VIEW DEMO ARCS</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-6xl flex-wrap justify-center">
          {/* Musaveer Card */}
          <button 
            onClick={() => handleSelectProfile('musaveer')}
            className="flex-[1_1_300px] group relative bg-surface border border-border hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden opacity-75 hover:opacity-100"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight text-textMain mb-1 uppercase">Musaveer</h2>
              <div className="flex items-center text-sm font-bold tracking-wider text-textMain group-hover:text-primary transition-colors mt-4">
                VIEW DEMO <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>

          {/* Dhavanesh Card */}
          <button 
            onClick={() => handleSelectProfile('dhavanesh')}
            className="flex-[1_1_300px] group relative bg-surface border border-border hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden opacity-75 hover:opacity-100"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight text-textMain mb-1 uppercase">Dhavanesh</h2>
              <div className="flex items-center text-sm font-bold tracking-wider text-textMain group-hover:text-blue-500 transition-colors mt-4">
                VIEW DEMO <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>

          {/* Sumith Card */}
          <button 
            onClick={() => handleSelectProfile('sumith')}
            className="flex-[1_1_300px] group relative bg-surface border border-border hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left overflow-hidden opacity-75 hover:opacity-100"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight text-textMain mb-1 uppercase">Sumith</h2>
              <div className="flex items-center text-sm font-bold tracking-wider text-textMain group-hover:text-purple-500 transition-colors mt-4">
                VIEW DEMO <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>
    </div>
  );
};
