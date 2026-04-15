import { useState, useEffect } from 'react';
import { usePriceStore } from '../../../store/usePriceStore';
import type { HospitalPriceInfo } from '../../../types';
import { hiraApi } from '../../../api/hiraApi';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

// 🧪 더미 데이터 생성기 (필수 필드를 모두 포함하여 타입 에러 방지)
const getDummyData = (sidoCode: string, sggCode: string, vaccineName: string): HospitalPriceInfo[] => {
  if (sidoCode === '11' && sggCode === '110001') {
    const baseInfo = {
      isUnlocked: false,
      urlAddr: 'https://toss.im',
    };

    if (vaccineName.includes('가다실')) {
      return [
        { ...baseInfo, ykiho: 'dummy1', hospitalName: '강남 토스 이비인후과', price: 165000, minPrice: 160000, maxPrice: 170000, category: '가다실9가', updateDate: '20240301', clCdNm: '의원', address: '서울특별시 강남구 테헤란로 123', telno: '02-123-4567' },
        { ...baseInfo, ykiho: 'dummy2', hospitalName: '서울 삼성 토스내과', price: 170000, minPrice: 170000, maxPrice: 170000, category: '가다실9가', updateDate: '20240305', clCdNm: '의원', address: '서울특별시 강남구 영동대로 513', telno: '02-555-0000' },
        { ...baseInfo, ykiho: 'dummy3', hospitalName: '청담 토스 제일병원', price: 185000, minPrice: 180000, maxPrice: 190000, category: '가다실9가', updateDate: '20240228', clCdNm: '병원', address: '서울특별시 강남구 학동로 422', telno: '02-999-8888' },
        { ...baseInfo, ykiho: 'dummy4', hospitalName: '강남 토스 베스트의원', price: 190000, minPrice: 190000, maxPrice: 200000, category: '가다실9가', updateDate: '20240310', clCdNm: '의원', address: '서울특별시 강남구 도산대로 107', telno: '02-777-6666' },
        { ...baseInfo, ykiho: 'dummy5', hospitalName: '압구정 토스 건강센터', price: 210000, minPrice: 205000, maxPrice: 215000, category: '가다실9가', updateDate: '20240308', clCdNm: '종합병원', address: '서울특별시 강남구 압구정로 201', telno: '02-111-2222' },
      ];
    }
    if (vaccineName.includes('독감')) {
      return [
        { ...baseInfo, ykiho: 'dummy6', hospitalName: '강남 토스 내과연합', price: 25000, minPrice: 25000, maxPrice: 25000, category: '독감(4가)', updateDate: '20231015', clCdNm: '의원', address: '서울특별시 강남구 강남대로 364', telno: '02-333-4444' },
        { ...baseInfo, ykiho: 'dummy7', hospitalName: '신사 토스 건강의원', price: 30000, minPrice: 28000, maxPrice: 32000, category: '독감(4가)', updateDate: '20231102', clCdNm: '의원', address: '서울특별시 강남구 나루터로 59', telno: '02-444-5555' },
        { ...baseInfo, ykiho: 'dummy8', hospitalName: '테헤란로 토스의원', price: 35000, minPrice: 35000, maxPrice: 35000, category: '독감(4가)', updateDate: '20231120', clCdNm: '의원', address: '서울특별시 강남구 테헤란로 401', telno: '02-666-7777' },
        { ...baseInfo, ykiho: 'dummy9', hospitalName: '강남 토스 스타일병원', price: 38000, minPrice: 35000, maxPrice: 40000, category: '독감(4가)', updateDate: '20231201', clCdNm: '병원', address: '서울특별시 강남구 선릉로 604', telno: '02-888-9999' },
        { ...baseInfo, ykiho: 'dummy10', hospitalName: '코엑스 토스 베스트내과', price: 40000, minPrice: 40000, maxPrice: 40000, category: '독감(4가)', updateDate: '20231215', clCdNm: '의원', address: '서울특별시 강남구 봉은사로 524', telno: '02-000-1111' },
      ];
    }
  }
  return [];
};

export function usePriceList() {
  const { selectedRegion, selectedVaccine } = usePriceStore();
  const [hospitals, setHospitals] = useState<HospitalPriceInfo[]>([]);
  const [originalHospitals, setOriginalHospitals] = useState<HospitalPriceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!selectedVaccine || !selectedRegion) {
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

      // 🚩 목업 데이터 활성화 플래그 (false 시 비활성화)
      const USE_DUMMY = false;

      try {
        const searchKeyword = selectedVaccine.searchKeyword || selectedVaccine.name;

        // [초기화] 플래그가 true일 때만 더미 데이터 주입
        const uniqueItems = new Map<string, HospitalPriceInfo>();
        
        if (USE_DUMMY) {
          const dummies = getDummyData(selectedRegion.sidoCode, selectedRegion.sggCode, selectedVaccine.name);
          dummies.forEach(d => uniqueItems.set(`${d.ykiho}-${d.category}`, d));

          if (dummies.length > 0) {
            const currentList = Array.from(uniqueItems.values());
            setHospitals(currentList);
            setOriginalHospitals(currentList);
          }
        }

        const targetCodes = await hiraApi.fetchCodesForKeyword(searchKeyword, selectedVaccine.name);

        if (targetCodes.length === 0) {
          if (isMounted) setIsLoading(false);
          return;
        }

        for (const code of targetCodes) {
          if (!isMounted) break;

          const batch = await hiraApi.fetchHospitalPricesByCode(
            SERVICE_KEY,
            code,
            selectedRegion.sidoCode,
            selectedRegion.sggCode,
            selectedVaccine.name
          );

          if (batch.length > 0 && isMounted) {
            batch.forEach(item => {
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
  }, [selectedRegion, selectedVaccine]);

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
