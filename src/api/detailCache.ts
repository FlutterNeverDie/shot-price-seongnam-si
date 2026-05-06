import type { HospitalPriceInfo } from '../types';

const DETAIL_STORAGE_KEY = 'hira-detail-cache';
const DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000;

const getInitialDetailCache = (): Record<string, any> => {
  try {
    const saved = localStorage.getItem(DETAIL_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    const now = Date.now();
    const filtered: Record<string, any> = {};
    Object.keys(parsed).forEach(key => {
      if (now - parsed[key].timestamp < DETAIL_CACHE_TTL) {
        filtered[key] = parsed[key];
      }
    });
    return filtered;
  } catch {
    return {};
  }
};

let detailCache = getInitialDetailCache();

export const detailCacheUtil = {
  get: (ykiho: string, npayCd: string): HospitalPriceInfo | null => {
    const cacheKey = `${ykiho}-${npayCd}`;
    const cached = detailCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < DETAIL_CACHE_TTL)) {
      return cached.data;
    }
    return null;
  },
  
  set: (ykiho: string, npayCd: string, data: HospitalPriceInfo) => {
    const cacheKey = `${ykiho}-${npayCd}`;
    detailCache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(detailCache));
    } catch (e) {
      console.warn('상세 캐시 저장 실패:', e);
    }
  }
};
