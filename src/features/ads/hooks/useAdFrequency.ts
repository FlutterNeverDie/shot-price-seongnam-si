import { create } from 'zustand';
import { AD_CONFIG } from '../adConfig';

interface AdFrequencyState {
  viewCount: number;
  searchCount: number;
  isRewardAdLoaded: boolean;
  incrementAndCheck: () => boolean;
  incrementSearchAndCheck: () => boolean;
  reset: () => void;
  setRewardAdLoaded: (loaded: boolean) => void;
}

/**
 * 상세 정보 조회 횟수, 검색 횟수 및 광고 로드 상태를 추적하는 스토어입니다.
 */
export const useAdFrequency = create<AdFrequencyState>((set, get) => ({
  viewCount: 0,
  searchCount: 0,
  isRewardAdLoaded: false,
  
  /**
   * 상세 정보 조회 카운트를 1 증가시키고, 광고 노출 시점인지 반환합니다.
   */
  incrementAndCheck: () => {
    const nextCount = get().viewCount + 1;
    set({ viewCount: nextCount });
    return nextCount % AD_CONFIG.POLICY.DETAILS_AD_FREQUENCY === 0;
  },

  /**
   * 검색 카운트를 1 증가시키고, 5회, 12회, 17회, 24회 (5, 7, 5, 7 간격) 주기에 해당하는지 확인합니다.
   */
  incrementSearchAndCheck: () => {
    const nextCount = get().searchCount + 1;
    set({ searchCount: nextCount });
    
    // nextCount가 5, 12, 17, 24... 에 해당하는지 확인
    // 즉, 12로 나눈 나머지가 5 이거나 0일 때 성립
    const isTargetHit = nextCount > 0 && (nextCount % 12 === 5 || nextCount % 12 === 0);
    
    return isTargetHit;
  },
  
  reset: () => set({ 
    viewCount: 0, 
    searchCount: 0,
  }),
  setRewardAdLoaded: (loaded: boolean) => set({ isRewardAdLoaded: loaded }),
}));
