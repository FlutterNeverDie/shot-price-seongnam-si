import type { HospitalPriceInfo } from '../types';
import { HiraRepository } from './hiraRepository';
import { HospitalInfoRepository } from './hospitalInfoRepository';

/**
 * 기존 API 인터페이스를 유지하면서 내부적으로 Repository를 사용하도록 래핑합니다.
 */
export const hiraApi = {
  /**
   * [1단계] 로컬 CSV에서 키워드에 해당하는 비급여 코드 목록을 추출합니다.
   */
  _csvCache: null as string | null,
  fetchCodesForKeyword: async (keyword: string, tabName: string): Promise<string[]> => {
    try {
      let csvText = hiraApi._csvCache;
      if (!csvText) {
        const csvRes = await fetch('/vaccine_codes.csv');
        csvText = await csvRes.text();
        hiraApi._csvCache = csvText;
      }
      
      const rows = csvText.split('\n').filter(r => r.trim() !== '');
      const headers = rows[0].split(',');
      
      const cdIdx = headers.indexOf('npayCd');
      const nmIdx = headers.indexOf('npayKorNm');

      const targetCodes: string[] = [];
      const excludes = ['병실', '교육', '상담', '치료', '프로그램', '검사', '진단', '관찰'];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.includes(keyword)) {
          const cols = row.split(',');
          const npayCd = cols[cdIdx];
          const npayKorNm = cols[nmIdx];

          if (!npayCd || !npayKorNm) continue;
          if (excludes.some(k => npayKorNm.includes(k))) continue;
          
          const isBroad = ['가다실', '폐렴', '간염', '독감'].includes(keyword);
          if (!isBroad) {
            const numbersInTab = tabName.match(/\d+/g) || [];
            if (numbersInTab.length > 0 && !numbersInTab.every(n => npayKorNm.includes(n))) continue;
            const numbersInName = npayKorNm.match(/\d+/g) || [];
            if (numbersInTab.length === 0 && numbersInName.length > 0 && keyword !== '독감') continue;
          }
          
          if (npayCd) targetCodes.push(npayCd);
        }
      }
      return Array.from(new Set(targetCodes));
    } catch (e) {
      console.error('fetchCodesForKeyword 오류:', e);
      return [];
    }
  },

  /**
   * [2단계] 특정 코드 하나에 대해 병원 가격 정보를 가져옵니다.
   */
  fetchHospitalPricesByCode: async (
    serviceKey: string,
    code: string,
    sidoCd: string,
    sggCd: string,
    vaccineName: string
  ): Promise<HospitalPriceInfo[]> => {
    const repository = new HiraRepository(serviceKey);
    const fullSidoCd = sidoCd.length === 2 ? `${sidoCd}0000` : sidoCd;

    try {
      const items = await repository.getNonPaymentItemHospList2({
        itemCd: code,
        sidoCd: fullSidoCd,
        sgguCd: sggCd
      });

      return items.map((raw: any) => ({
        ykiho: raw.ykiho || '',
        hospitalName: raw.yadmNm || '',
        address: '', 
        telno: '-',
        price: Number(raw.minPrc || 0),
        minPrice: Number(raw.minPrc || 0),
        maxPrice: Number(raw.maxPrc || 0),
        updateDate: String(raw.adtFrDd || ''),
        category: raw.itemNm || raw.npayKorNm || vaccineName,
        isUnlocked: false,
        clCdNm: raw.clCdNm || '',
        npayCd: code, // 코드 저장
      }));
    } catch (e) {
      console.warn(`⚠️ [${code}] 조회 실패:`, e);
      return [];
    }
  },

  /**
   * 병원 상세 정보(주소 및 세부 가격 내역)를 가져옵니다. (상세보기 클릭 시 사용)
   */
  fetchHospitalItemDetail: async (serviceKey: string, ykiho: string, npayCd: string, hospitalName: string): Promise<HospitalPriceInfo | null> => {
    const hiraRepository = new HiraRepository(serviceKey);
    const hospitalInfoRepository = new HospitalInfoRepository(serviceKey);

    try {
      // 1. 가격 상세와 병원 기본 정보를 병렬로 호출하여 속도 향상
      // ykiho가 있으면 ykiho를 우선 사용
      const [items, basisArray] = await Promise.all([
        hiraRepository.getNonPaymentItemHospDtlList({
          ykiho: ykiho,
          npayCd: npayCd,
        }),
        hospitalInfoRepository.getHospBasisList({ ykiho: ykiho })
      ]);

      const basis = basisArray.find(item => item.ykiho === ykiho) || basisArray[0];
      const target = items.find(item => item.ykiho === ykiho) || items[0];
      
      if (!target && !basis) return null;

      return {
        ykiho: ykiho,
        hospitalName: target?.yadmNm || basis?.yadmNm || hospitalName,
        address: basis?.addr || '',
        telno: basis?.telno || '-',
        price: Number(target?.curAmt || 0),
        minPrice: Number(target?.minAmt || 0),
        maxPrice: Number(target?.maxAmt || 0),
        updateDate: target?.lastUpdtDt || target?.adtFrDd || '',
        category: target?.npayKorNm || '',
        isUnlocked: true,
        clCdNm: target?.clCdNm || basis?.clCdNm || '',
        urlAddr: target?.urlAddr || basis?.hospUrl || '',
        hospitalNote: target?.yadmnpayCdNm, 
        npayCd: target?.npayCd || npayCd,
      };
    } catch (e) {
      console.error('fetchHospitalItemDetail 오류:', e);
      return null;
    }
  },

  /**
   * 병원 기본 정보 조회 (단순 주소/전화번호용)
   */
  fetchHospitalBasis: async (serviceKey: string, ykiho: string, hospitalName: string) => {
    const repository = new HospitalInfoRepository(serviceKey);
    
    // ykiho를 직접 사용하여 고유 병원을 즉시 찾습니다. (속도 향상의 핵심)
    const items = await repository.getHospBasisList({ 
      ykiho: ykiho 
    });
    
    return items.find(item => item.ykiho === ykiho) || items[0] || null;
  }
};
