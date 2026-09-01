import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useUnsavedChanges(
  isDirty: boolean, 
  onSave: () => Promise<boolean> | boolean,
  onDiscard: () => void
) {
  useEffect(() => {

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  return { blocker, onSave, onDiscard };
}
