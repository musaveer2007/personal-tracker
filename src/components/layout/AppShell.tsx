import { type ReactNode } from 'react';
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Dumbbell, Activity, Apple, ActivitySquare, Settings, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRootStore } from '../../data/store';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { path: 'overview', label: 'Overview', icon: LayoutDashboard },
  { path: 'today', label: 'Today', icon: CheckSquare },
  { path: 'workout', label: 'Workout', icon: Dumbbell },
  { path: 'running', label: 'Running', icon: Activity },
  { path: 'nutrition', label: 'Nutrition', icon: Apple },
  { path: 'progress', label: 'Progress', icon: ActivitySquare },
  { path: 'calendar', label: 'Calendar', icon: Calendar },
  { path: 'journal', label: 'Journal', icon: BookOpen },
  { path: 'settings', label: 'Settings', icon: Settings },
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

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-textMain">
      
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
            const isActive = location.pathname === fullPath || (item.path === 'overview' && location.pathname === `/profile/${profileId}`);
            
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
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const fullPath = getFullPath(item.path);
            const isActive = location.pathname === fullPath || (item.path === 'overview' && location.pathname === `/profile/${profileId}`);
            
            return (
              <NavLink
                key={item.path}
                to={fullPath}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-textMuted"
                )}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
