import { useState, useEffect } from 'react';
import type { HospitalPriceInfo } from '../../../types';
import { hiraApi } from '../../../api/hiraApi';
import { SEONGNAM_DISTRICTS } from '../../../store/usePriceStore';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

export function useHospitalDetail(initialHospital: HospitalPriceInfo, isOpen: boolean) {
  const [detail, setDetail] = useState<HospitalPriceInfo>(initialHospital);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialHospital.ykiho) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const basis = await hiraApi.fetchHospitalBasis(
            SERVICE_KEY,
            initialHospital.ykiho,
            initialHospital.hospitalName,
            SEONGNAM_DISTRICTS[0].sidoCode,
            undefined  // 병원 기본정보는 시도코드만으로 조회
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
    }
  }, [isOpen, initialHospital.ykiho, initialHospital.npayCd, initialHospital.hospitalName]);

  const formattedUpdateDate = detail.updateDate
    ? detail.updateDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일')
    : '-';

  return { detail, isLoading, error, formattedUpdateDate };
}
