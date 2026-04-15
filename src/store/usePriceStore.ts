import { create } from 'zustand';
import type { VaccineItem, RegionState } from '../types';
import type { NpayCodeItem } from '../api/hiraDto';

interface PriceStore {
  // 백신 설정
  selectedVaccine: VaccineItem | null;
  setSelectedVaccine: (vaccine: VaccineItem | null) => void;

  // 세부 백신 설정
  selectedSubVaccine: NpayCodeItem | null;
  setSelectedSubVaccine: (subVaccine: NpayCodeItem | null) => void;

  // 지역 설정
  selectedRegion: RegionState | null;
  setSelectedRegion: (region: RegionState | null) => void;

  // 검색 상태
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

export const usePriceStore = create<PriceStore>((set) => ({
  selectedVaccine: null,
  setSelectedVaccine: (vaccine) => set({ selectedVaccine: vaccine }),

  selectedSubVaccine: null,
  setSelectedSubVaccine: (subVaccine) => set({ selectedSubVaccine: subVaccine }),

  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  isSearching: false,
  setIsSearching: (searching: boolean) => set({ isSearching: searching }),
}));
