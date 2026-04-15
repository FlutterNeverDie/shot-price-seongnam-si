import { useState, useEffect } from 'react';
import { usePriceStore, SEONGNAM_DISTRICTS } from '../../../store/usePriceStore';
import type { HospitalPriceInfo } from '../../../types';
import { hiraApi } from '../../../api/hiraApi';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

export function usePriceList() {
  const { selectedVaccine } = usePriceStore();
  const [hospitals, setHospitals] = useState<HospitalPriceInfo[]>([]);
  const [originalHospitals, setOriginalHospitals] = useState<HospitalPriceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!selectedVaccine) {
        setHospitals([]);
        setOriginalHospitals([]);
        return;
      }

      setIsLoading(true);
      setIsComplete(false);
      setError(null);
      setHospitals([]);
      setOriginalHospitals([]);
      setSortOrder(null);

      try {
        const searchKeyword = selectedVaccine.searchKeyword || selectedVaccine.name;
        const uniqueItems = new Map<string, HospitalPriceInfo>();
        const targetCodes = await hiraApi.fetchCodesForKeyword(searchKeyword, selectedVaccine.name);

        if (targetCodes.length === 0) {
          if (isMounted) setIsLoading(false);
          return;
        }

        for (const code of targetCodes) {
          if (!isMounted) break;

          // 성남시 3개 구(수정구, 중원구, 분당구) 병렬 조회
          const batches = await Promise.all(
            SEONGNAM_DISTRICTS.map(district =>
              hiraApi.fetchHospitalPricesByCode(
                SERVICE_KEY,
                code,
                district.sidoCode,
                district.sggCode,
                selectedVaccine.name
              )
            )
          );

          const combined = batches.flat();
          if (combined.length > 0 && isMounted) {
            combined.forEach(item => {
              const key = `${item.ykiho}-${item.category}`;
              if (!uniqueItems.has(key)) {
                uniqueItems.set(key, item);
              }
            });
            const currentList = Array.from(uniqueItems.values());
            setHospitals(currentList);
            setOriginalHospitals(currentList);
          }
        }

        if (isMounted) setIsComplete(true);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : '데이터를 가져오는데 실패했습니다.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [selectedVaccine]);

  const sortHospitalsByPrice = () => {
    if (sortOrder === null) {
      const sorted = [...hospitals].sort((a, b) => a.price - b.price);
      setHospitals(sorted);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      const sorted = [...hospitals].sort((a, b) => b.price - a.price);
      setHospitals(sorted);
      setSortOrder('desc');
    } else {
      setHospitals(originalHospitals);
      setSortOrder(null);
    }
  };

  return { hospitals, isLoading, isComplete, error, sortHospitalsByPrice, sortOrder };
}
