import { create } from 'zustand';
import type { VaccineItem } from '../types';
import type { NpayCodeItem } from '../api/hiraDto';

// HIRA API 자체 코드 기준 (표준 행정코드와 다름)
export const SEONGNAM_DISTRICTS = [
  { sidoCode: '31', sggCode: '310401', name: '수정구' },
  { sidoCode: '31', sggCode: '310402', name: '중원구' },
  { sidoCode: '31', sggCode: '310403', name: '분당구' },
] as const;

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
