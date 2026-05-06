import { useState, useEffect } from 'react';
import type { HospitalPriceInfo } from '../../../types';
import { hiraApi } from '../../../api/hiraApi';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

import { detailCacheUtil } from '../../../api/detailCache';

export function useHospitalDetail(initialHospital: HospitalPriceInfo, isOpen: boolean) {
  const [detail, setDetail] = useState<HospitalPriceInfo>(initialHospital);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialHospital.ykiho) {
      const cachedData = detailCacheUtil.get(initialHospital.ykiho, initialHospital.npayCd || '');
      
      if (cachedData) {
        setDetail(cachedData);
        return;
      }

      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fullDetail = await hiraApi.fetchHospitalItemDetail(
            SERVICE_KEY,
            initialHospital.ykiho,
            initialHospital.npayCd || '',
            initialHospital.hospitalName
          );

          if (fullDetail) {
            const updatedDetail = {
              ...initialHospital,
              ...fullDetail,
            };
            detailCacheUtil.set(initialHospital.ykiho, initialHospital.npayCd || '', updatedDetail);
            setDetail(updatedDetail);
          }
        } catch (e) {
          console.error('병원 상세 정보 로드 실패:', e);
          setError('병원 정보를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, initialHospital.ykiho, initialHospital.npayCd, initialHospital.hospitalName]);

  const formattedUpdateDate = detail.updateDate
    ? String(detail.updateDate).replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일')
    : '-';

  return { detail, isLoading, error, formattedUpdateDate };
}
