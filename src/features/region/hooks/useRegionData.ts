import { useState, useEffect, useMemo, useCallback } from 'react';
import { type RegionData, parseRegionCsv } from '../../../utils/regionUtils';

/**
 * 지역 데이터 CSV를 불러오고 관리하는 커스텀 훅입니다.
 */
export function useRegionData() {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        const response = await fetch('/region_codes.csv');
        const csvText = await response.text();
        const parsed = parseRegionCsv(csvText);
        setRegions(parsed);
      } catch (error) {
        console.error('지역 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegions();
  }, []);

  // 시도 목록 추출 (중복 제거)
  const sidoList = useMemo(() => {
    return Array.from(
      new Map(regions.map((r) => [r.sidoCode, { code: r.sidoCode, name: r.sidoName }])).values()
    );
  }, [regions]);
  
  /**
   * 선택된 시도 코드의 하위 시군구 목록을 반환합니다.
   */
  const getSggList = useCallback((sidoCode: string, sidoName: string) => {
    return regions
      .filter((r) => r.sidoCode === sidoCode)
      .map((r) => {
        let cleanName = r.sggName;
        // 시군구 이름에서 시도 이름이 앞에 붙어있으면 제거 (예: 부산남구 -> 남구)
        if (sidoName !== '세종' && r.sggName.startsWith(sidoName)) {
          cleanName = r.sggName.replace(sidoName, '').trim();
        }
        return { code: r.sggCode, name: cleanName };
      });
  }, [regions]);

  return {
    regions,
    sidoList,
    getSggList,
    isLoading
  };
}
