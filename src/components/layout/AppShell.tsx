import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Dumbbell, Activity, Apple, ActivitySquare, Settings, Calendar, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/today', label: 'Today', icon: CheckSquare },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/running', label: 'Running', icon: Activity },
  { path: '/nutrition', label: 'Nutrition', icon: Apple },
  { path: '/progress', label: 'Progress', icon: ActivitySquare },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-textMain">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-wider text-textMain">WINTER ARC</h1>
          <p className="text-xs text-textMuted font-medium tracking-widest mt-1">100 DAYS. NO EXCUSES.</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden min-h-screen">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-border z-50">
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
