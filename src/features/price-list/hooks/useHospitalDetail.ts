import { useState, useEffect } from 'react';
import type { HospitalPriceInfo } from '../../../types';
import { hiraApi } from '../../../api/hiraApi';
import { usePriceStore } from '../../../store/usePriceStore';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

/**
 * 특정 병원의 상세 정보(가격, 주소, 전화번호 등)를 가져오는 커스텀 훅입니다.
 */
export function useHospitalDetail(initialHospital: HospitalPriceInfo, isOpen: boolean) {
  const [detail, setDetail] = useState<HospitalPriceInfo>(initialHospital);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedRegion } = usePriceStore();

  useEffect(() => {
    // 더미 데이터가 아니고, 필수 정보가 있을 때만 API 호출
    if (isOpen && initialHospital.ykiho && !initialHospital.ykiho.startsWith('dummy')) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // 가격은 이미 있으므로 병원 정보 서비스(Basis)만 호출
          const basis = await hiraApi.fetchHospitalBasis(
            SERVICE_KEY, 
            initialHospital.ykiho, 
            initialHospital.hospitalName,
            selectedRegion?.sidoCode,
            selectedRegion?.sggCode
          );
          
          if (basis) {
            setDetail(prev => ({
              ...prev,
              address: basis.addr,
              telno: basis.telno,
              urlAddr: basis.hospUrl || prev.urlAddr,
              xPos: basis.XPos,
              yPos: basis.YPos,
              clCdNm: basis.clCdNm || prev.clCdNm,
            }));
          }
        } catch (e) {
          console.error('병원 정보 로드 실패:', e);
          setError('병원 정보를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else if (!isOpen) {
      // 바텀시트가 닫힐 때 초기값으로 리셋 (선택사항)
      // setDetail(initialHospital);
    }
  }, [isOpen, initialHospital.ykiho, initialHospital.npayCd, initialHospital.hospitalName, selectedRegion]);

  const formattedUpdateDate = detail.updateDate
    ? detail.updateDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일')
    : '-';

  return {
    detail,
    isLoading,
    error,
    formattedUpdateDate
  };
}
