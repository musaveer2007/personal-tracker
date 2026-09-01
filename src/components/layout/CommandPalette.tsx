import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, LayoutDashboard, CheckSquare, Dumbbell, Activity, Apple, Settings as SettingsIcon } from 'lucide-react';
import { useRootStore } from '../../data/store';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId: string }>();
  const switchProfile = useRootStore(state => state.switchProfile);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const handleSelect = (action: () => void) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  const commands = [
    { name: 'Go to Command Center', icon: LayoutDashboard, action: () => navigate(`/profile/${profileId}/command-center`) },
    { name: 'Go to Today', icon: CheckSquare, action: () => navigate(`/profile/${profileId}/today`) },
    { name: 'Start Workout', icon: Dumbbell, action: () => navigate(`/profile/${profileId}/workout`) },
    { name: 'Log Run', icon: Activity, action: () => navigate(`/profile/${profileId}/running`) },
    { name: 'Add Food', icon: Apple, action: () => navigate(`/profile/${profileId}/nutrition`) },
    { name: 'Open Settings', icon: SettingsIcon, action: () => navigate(`/profile/${profileId}/settings`) },
    { name: 'Switch Person', icon: Search, action: () => { switchProfile(''); navigate('/'); } },
  ];

  const filteredCommands = commands.filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsOpen(false)}
      />
      <div className="relative bg-surface w-full max-w-xl rounded-xl shadow-2xl border border-border overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-textMuted mr-3" />
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-textMain placeholder-textMuted text-lg"
            placeholder="Type a command or search..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-textMuted bg-surfaceHighlight rounded">
            ESC
          </kbd>
        </div>
        
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-textMuted">No results found.</div>
          ) : (
            filteredCommands.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(cmd.action)}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg hover:bg-surfaceHighlight transition-colors group"
                >
                  <Icon className="w-5 h-5 text-textMuted group-hover:text-primary mr-3" />
                  <span className="text-textMain font-medium">{cmd.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
