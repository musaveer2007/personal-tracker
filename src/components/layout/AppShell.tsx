import { type ReactNode } from 'react';
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Dumbbell, Activity, Apple, ActivitySquare, Settings as SettingsIcon, Calendar, BookOpen, ArrowLeft, Droplets, UserCircle, HeartPulse, Sparkles, Scissors, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRootStore } from '../../data/store';
import { CommandPalette } from './CommandPalette';
import { useEffect } from 'react';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { path: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { path: 'today', label: 'Today', icon: CheckSquare },
  { path: 'workout', label: 'Workout', icon: Dumbbell },
  { path: 'running', label: 'Running', icon: Activity },
  { path: 'nutrition', label: 'Nutrition', icon: Apple },
  { path: 'water', label: 'Water', icon: Droplets },
  { path: 'body', label: 'Body', icon: UserCircle },
  { path: 'recovery', label: 'Recovery', icon: HeartPulse },
  { path: 'skincare', label: 'Skincare', icon: Sparkles },
  { path: 'haircare', label: 'Haircare', icon: Scissors },
  { path: 'calendar', label: 'Calendar', icon: Calendar },
  { path: 'progress', label: 'Progress', icon: ActivitySquare },
  { path: 'journal', label: 'Journal', icon: BookOpen },
  { path: 'achievements', label: 'Achievements', icon: Trophy },
];

export const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const switchProfile = useRootStore(state => state.switchProfile);

  const handleSwitchArc = () => {
    switchProfile('');
    navigate('/');
  };

  const getFullPath = (path: string) => `/profile/${profileId}/${path}`;

  const profileName = profileId === 'dhavanesh' ? 'DHAVANESH' : 'MUSAVEER';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (key) {
          case 't': navigate(`/profile/${profileId}/today`); break;
          case 'w': navigate(`/profile/${profileId}/workout`); break;
          case 'r': navigate(`/profile/${profileId}/running`); break;
          case 'n': navigate(`/profile/${profileId}/nutrition`); break;
          case 'p': navigate(`/profile/${profileId}/progress`); break;
          case 'c': navigate(`/profile/${profileId}/calendar`); break;
          case 'j': navigate(`/profile/${profileId}/journal`); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, profileId]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-textMain">
      <CommandPalette />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface h-screen sticky top-0">
        <div className="p-6 pb-2">
          <button 
            onClick={handleSwitchArc}
            className="flex items-center text-xs font-bold text-textMuted hover:text-primary transition-colors mb-4 uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3 mr-1" /> Switch Arc
          </button>
          <h1 className="text-xl font-black tracking-wider text-textMain uppercase">{profileName}'S</h1>
          <h2 className="text-lg font-bold tracking-wider text-primary">WINTER ARC</h2>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto mt-2 border-t border-border/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const fullPath = getFullPath(item.path);
            const isActive = location.pathname === fullPath || (item.path === 'command-center' && location.pathname === `/profile/${profileId}`);
            
            return (
              <NavLink
                key={item.path}
                to={fullPath}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-textMuted hover:bg-surfaceHighlight hover:text-textMain"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-textMuted")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="mt-4 pt-4 border-t border-border/50">
            <NavLink
              to={`/profile/${profileId}/settings`}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                location.pathname === `/profile/${profileId}/settings`
                  ? "bg-primary/10 text-primary" 
                  : "text-textMuted hover:bg-surfaceHighlight hover:text-textMain"
              )}
            >
              <SettingsIcon className={cn("w-5 h-5", location.pathname === `/profile/${profileId}/settings` ? "text-primary" : "text-textMuted")} />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden min-h-screen relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-40">
           <div>
             <h1 className="text-sm font-black tracking-wider text-textMain uppercase">{profileName}'S ARC</h1>
           </div>
           <button 
             onClick={handleSwitchArc}
             className="flex items-center text-xs font-bold text-textMuted hover:text-primary transition-colors uppercase tracking-widest"
           >
             <ArrowLeft className="w-3 h-3 mr-1" /> Switch
           </button>
        </div>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-border z-50">
        <div className="flex items-center overflow-x-auto p-2 space-x-6 pb-2 no-scrollbar px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const fullPath = getFullPath(item.path);
            const isActive = location.pathname === fullPath || (item.path === 'command-center' && location.pathname === `/profile/${profileId}`);
            
            return (
              <NavLink
                key={item.path}
                to={fullPath}
                className={cn(
                  "flex flex-col items-center flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-textMuted"
                )}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          
          <NavLink
            to={`/profile/${profileId}/settings`}
            className={cn(
              "flex flex-col items-center flex-shrink-0 transition-colors",
              location.pathname === `/profile/${profileId}/settings` ? "text-primary" : "text-textMuted"
            )}
          >
            <SettingsIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Settings</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
