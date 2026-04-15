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
  fetchCodesForKeyword: async (keyword: string, tabName: string): Promise<string[]> => {
    try {
      const csvRes = await fetch('/vaccine_codes.csv');
      const csvText = await csvRes.text();
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
      const [items, basisArray] = await Promise.all([
        hiraRepository.getNonPaymentItemHospDtlList({
          ykiho: ykiho,
          yadmNm: hospitalName,
          npayCd: npayCd,
        }),
        hospitalInfoRepository.getHospBasisList({ yadmNm: hospitalName })
      ]);

      const basis = basisArray.find(item => item.ykiho === ykiho) || basisArray[0];

      // 해당 병원(ykiho)의 데이터만 필터링 (명시적으로 한번 더 확인)
      const target = items.find(item => item.ykiho === ykiho) || items[0];
      if (!target && !basis) return null;

      // 만약 상세 가격 정보(target)가 없더라도 기본 정보(basis)가 있다면 결합하여 반환
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
  fetchHospitalBasis: async (serviceKey: string, ykiho: string, hospitalName: string, sidoCd?: string, sgguCd?: string) => {
    const repository = new HospitalInfoRepository(serviceKey);
    // 2자리 시도코드 지원 (API 사양에 따라 6자리로 변경)
    const fullSidoCd = sidoCd && sidoCd.length === 2 ? `${sidoCd}0000` : sidoCd;

    // yadmNm, sidoCd, sgguCd를 조합하여 1차 목록을 가져옵니다.
    const items = await repository.getHospBasisList({ 
      yadmNm: hospitalName,
      sidoCd: fullSidoCd,
      sgguCd: sgguCd
    });
    // 가져온 목록 중 해당 병원의 고유 기호(ykiho)와 일치하는 것을 찾습니다. 
    return items.find(item => item.ykiho === ykiho) || items[0] || null;
  }
};
