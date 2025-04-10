// store/searchStore.ts
import { create } from 'zustand';

type SearchStore = {
  selectedPart: string | null;
  selectedProcess: string | null;
  setSelectedPart: (part: string) => void;
  setSelectedProcess: (process: string) => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  selectedPart: null,
  selectedProcess: null,
  setSelectedPart: (part) => set({ selectedPart: part }),
  setSelectedProcess: (process) => set({ selectedProcess: process }),
}));
