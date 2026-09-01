import { create } from 'zustand';

interface UnsavedState {
  isDirty: boolean;
  markDirty: () => void;
  markSaved: () => void;
}

export const useUnsavedStore = create<UnsavedState>((set) => ({
  isDirty: false,
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false })
}));
