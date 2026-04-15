import { create } from 'zustand';
import type { VaccineItem } from '../types';
import type { NpayCodeItem } from '../api/hiraDto';

export const SEONGNAM_REGION = {
  sidoCode: '41',
  sidoName: '경기도',
  sggCode: '41130',
  sggName: '성남시',
} as const;

interface PriceStore {
  selectedVaccine: VaccineItem | null;
  setSelectedVaccine: (vaccine: VaccineItem | null) => void;

  selectedSubVaccine: NpayCodeItem | null;
  setSelectedSubVaccine: (subVaccine: NpayCodeItem | null) => void;

  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

export const usePriceStore = create<PriceStore>((set) => ({
  selectedVaccine: null,
  setSelectedVaccine: (vaccine) => set({ selectedVaccine: vaccine }),

  selectedSubVaccine: null,
  setSelectedSubVaccine: (subVaccine) => set({ selectedSubVaccine: subVaccine }),

  isSearching: false,
  setIsSearching: (searching: boolean) => set({ isSearching: searching }),
}));
