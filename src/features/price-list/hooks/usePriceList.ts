import { useState, useEffect } from 'react';
import { detailCacheUtil } from '../../../api/detailCache';
import { usePriceStore, SEONGNAM_DISTRICTS } from '../../../store/usePriceStore';
import type { HospitalPriceInfo } from '../../../types';
import { hiraApi } from '../../../api/hiraApi';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

// 로컬 스토리지 캐시 키 및 만료 시간 (24시간)
const STORAGE_KEY = 'hira-price-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheItem {
  data: HospitalPriceInfo[];
  timestamp: number;
}

// 메모리 캐시 초기화 (로컬 스토리지에서 불러오기)
const getInitialCache = (): Record<string, CacheItem> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // 만료된 항목 제거
    const now = Date.now();
    const filtered: Record<string, CacheItem> = {};
    Object.keys(parsed).forEach(key => {
      if (now - parsed[key].timestamp < CACHE_TTL) {
        filtered[key] = parsed[key];
      }
    });
    return filtered;
  } catch {
    return {};
  }
};

let priceDataCache: Record<string, CacheItem> = getInitialCache();

const saveCacheToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priceDataCache));
  } catch (e) {
    console.warn('캐시 저장 실패:', e);
  }
};

export function usePriceList() {
  const { selectedVaccine, selectedDistrict } = usePriceStore();
  const [hospitals, setHospitals] = useState<HospitalPriceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!selectedVaccine) {
        setHospitals([]);
        return;
      }

      const districtKey = selectedDistrict ? selectedDistrict.name : 'all';
      const cacheKey = `${selectedVaccine.id}-${districtKey}`;
      
      const cached = priceDataCache[cacheKey];
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        setHospitals(cached.data);
        setIsLoading(false);
        setIsComplete(true);
        setError(null);
        return;
      }

      setIsLoading(true);
      setIsComplete(false);
      setError(null);
      setHospitals([]);
      setSortOrder(null);

      try {
        const searchKeyword = selectedVaccine.searchKeyword || selectedVaccine.name;
        const targetCodes = await hiraApi.fetchCodesForKeyword(searchKeyword, selectedVaccine.name);

        if (targetCodes.length === 0) {
          if (isMounted) {
            setIsLoading(false);
            setIsComplete(true);
          }
          return;
        }

        const targetDistricts = selectedDistrict ? [selectedDistrict] : SEONGNAM_DISTRICTS;
        const allFetchPromises = targetCodes.flatMap(code =>
          targetDistricts.map(district =>
            hiraApi.fetchHospitalPricesByCode(
              SERVICE_KEY,
              code,
              district.sidoCode,
              district.sggCode,
              selectedVaccine.name
            )
          )
        );

        const results = await Promise.all(allFetchPromises);
        const combined = results.flat();

        const uniqueItems = new Map<string, HospitalPriceInfo>();
        combined.forEach(item => {
          const key = `${item.ykiho}-${item.npayCd || item.category}`;
          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, item);
          }
        });

        const finalList = Array.from(uniqueItems.values());
        
        if (isMounted) {
          priceDataCache[cacheKey] = {
            data: finalList,
            timestamp: Date.now()
          };
          saveCacheToStorage();
          setHospitals(finalList);
          setIsComplete(true);


          // [추가] 상위 5개 병원 데이터 미리 불러오기 (Prefetching)
          const topHospitals = finalList.slice(0, 5);
          topHospitals.forEach(async (h) => {
            try {
              if (detailCacheUtil.get(h.ykiho, h.npayCd || '')) return;
              const fullDetail = await hiraApi.fetchHospitalItemDetail(SERVICE_KEY, h.ykiho, h.npayCd || '', h.hospitalName);
              if (fullDetail) {
                detailCacheUtil.set(h.ykiho, h.npayCd || '', { ...h, ...fullDetail });
              }
            } catch (e) {
              // 백그라운드 무시
            }
          });
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : '데이터를 가져오는데 실패했습니다.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [selectedVaccine, selectedDistrict]);

  const sortHospitalsByPrice = () => {
    const sorted = [...hospitals];
    if (sortOrder === null || sortOrder === 'desc') {
      sorted.sort((a, b) => a.price - b.price);
      setSortOrder('asc');
    } else {
      sorted.sort((a, b) => b.price - a.price);
      setSortOrder('desc');
    }
    setHospitals(sorted);
  };

  return { hospitals, isLoading, isComplete, error, sortHospitalsByPrice, sortOrder };
}
