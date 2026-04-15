/**
 * HIRA API 공통 응답 구조 (DTO)
 */
export interface HiraApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 1. 비급여 항목 병원 목록 상세 (getNonPaymentItemHospDtlList)
 * 요청 및 응답 DTO
 */
export interface HospDtlListRequest {
  serviceKey: string;
  sidoCd?: string;
  sgguCd?: string;
  ykiho?: string;
  npayCd?: string;
  npayKorNm?: string;
  yadmNm?: string;
  numOfRows?: number;
  pageNo?: number;
  _type?: 'json';
}

export interface HospDtlListItem {
  ykiho: string;
  yadmNm: string;
  clCd: string;
  clCdNm: string;
  sidoCdNm: string;
  sgguCdNm: string;
  urlAddr?: string;
  npayCd: string;
  npayKorNm: string;
  yadmnpayCdNm: string; // 이미지의 '요양기관비급여코드명'
  curAmt: string;
  minAmt: string;
  maxAmt: string;
  lastUpdtDt: string;
  adtFrDd: string;
  adtEndDd: string;
}

/**
 * 2. 병원 기본 정보 조회 (getHospBasisList)
 * 요청 및 응답 DTO
 */
export interface HospBasisRequest {
  serviceKey: string;
  ykiho: string;
  _type?: 'json';
}

export interface HospBasisItem {
  ykiho: string;
  yadmNm: string;
  clCd: string;
  clCdNm: string;
  addr: string;
  telno: string;
  XPos: string;
  YPos: string;
  hospUrl?: string;
}

/**
 * 3. 비급여 항목 코드 조회 (getNonPaymentItemCodeList2)
 */
export interface NpayCodeRequest {
  serviceKey: string;
  npayCd?: string;
  npayKorNm?: string;
  _type?: 'json';
}

export interface NpayCodeItem {
  npayCd: string;
  npayKorNm: string;
  npayLcd: string;
  npayLcdNm: string;
  npayMcd: string;
  npayMcdNm: string;
}

/**
 * 4. 비급여 항목 병원 목록 요약 (getNonPaymentItemHospList2)
 */
export interface HospSummaryListRequest {
  serviceKey: string;
  itemCd: string; // 이것이 npayCd 역할
  sidoCd?: string;
  sgguCd?: string;
  _type?: 'json';
  numOfRows?: number;
  pageNo?: number;
}

export interface HospSummaryListItem {
  ykiho: string;
  yadmNm: string;
  clCd: string;
  clCdNm: string;
  itemCd: string;
  itemNm: string;
  minPrc: string; // 최저 가격
  maxPrc: string; // 최고 가격
  adtFrDd: string;
}

/**
 * 5. 비급여 항목 상세 내역 조회 (getNonPaymentItemDtlList)
 */
export interface HospDtlInfoRequest {
  serviceKey: string;
  ykiho: string;
  itemCd: string;
  _type?: 'json';
}

export interface HospDtlInfoItem {
  ykiho: string;
  yadmNm: string;
  npayCd: string;
  npayKorNm: string;
  curAmt: string;
  adtFrDd: string;
}
