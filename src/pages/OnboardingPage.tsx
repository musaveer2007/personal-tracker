import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { useAppStore } from '../data/store';
import { Activity, User, Target, ChevronRight, Loader2 } from 'lucide-react';
import { getUserTimezone } from '../lib/dateUtils';

export const OnboardingPage = () => {
  const { user } = useAuthStore();
  const { isOnboarded, updateProfileInfo } = useAppStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Build Muscle');
  const [activityLevel, setActivityLevel] = useState('Intermediate');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOnboarded && user) {
      navigate(`/profile/${user.id}/today`);
    }
  }, [isOnboarded, user, navigate]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate a brief save delay for UX
    setTimeout(() => {
      updateProfileInfo({
        isOnboarded: true,
        displayName,
        username,
        fitnessGoal,
        activityLevel,
        timezone: getUserTimezone()
      });
      setLoading(false);
      if (user) {
        navigate(`/profile/${user.id}/today`);
      }
    }, 800);
  };

  if (isOnboarded) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <Activity className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-black tracking-widest text-textMain uppercase">
            Create Your Identity
          </h1>
          <p className="text-xs font-bold tracking-widest text-textMuted uppercase mt-2">
            Step {step} of 2
          </p>
        </div>

        <form onSubmit={step === 2 ? handleComplete : (e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-textMain focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-bold">@</span>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    maxLength={20}
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-textMain focus:outline-none focus:border-primary transition-colors"
                    placeholder="johndoe"
                  />
                </div>
                <p className="text-[10px] text-textMuted mt-1">Letters, numbers, and underscores only.</p>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-black font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                Continue <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                  Primary Goal
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-textMain focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    <option value="Build Muscle">Build Muscle</option>
                    <option value="Lose Fat">Lose Fat</option>
                    <option value="Improve Fitness">Improve Fitness</option>
                    <option value="Improve Strength">Improve Strength</option>
                    <option value="Improve Endurance">Improve Endurance</option>
                    <option value="Maintain Fitness">Maintain Fitness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-3 px-4 text-textMain focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="Beginner">Beginner (Just starting out)</option>
                  <option value="Intermediate">Intermediate (1-2 years training)</option>
                  <option value="Advanced">Advanced (3+ years training)</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-surface border border-border text-textMain font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-surfaceHighlight transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-2/3 bg-primary text-black font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};
