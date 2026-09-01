import type { Blocker } from 'react-router-dom';

interface UnsavedDialogProps {
  blocker: Blocker;
  onSave: () => Promise<boolean> | boolean;
  onDiscard: () => void;
}

export function UnsavedDialog({ blocker, onSave, onDiscard }: UnsavedDialogProps) {
  if (blocker.state !== 'blocked') return null;

  const handleSave = async () => {
    try {
      const success = await onSave();
      if (success !== false) {
        blocker.proceed?.();
      }
    } catch (e) {
      console.error('Save failed', e);
      alert('Couldn\'t save your changes. Please try again.');
    }
  };

  const handleDiscard = () => {
    onDiscard();
    blocker.proceed?.();
  };

  const handleCancel = () => {
    blocker.reset?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">UNSAVED CHANGES</h2>
        <p className="text-sm text-textMuted font-medium mb-6">You have unsaved changes. What would you like to do?</p>
        
        <div className="space-y-3">
          <button 
            onClick={handleSave}
            className="w-full btn-primary py-3 flex justify-center items-center font-bold tracking-widest uppercase"
          >
            SAVE & CONTINUE
          </button>
          
          <button 
            onClick={handleDiscard}
            className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold tracking-widest uppercase hover:bg-red-500/20 transition-colors"
          >
            DISCARD
          </button>
          
          <button 
            onClick={handleCancel}
            className="w-full py-3 bg-surfaceHighlight text-white border border-border rounded-lg font-bold tracking-widest uppercase hover:bg-border transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
