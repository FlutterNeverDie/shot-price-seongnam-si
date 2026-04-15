import type {
  HiraApiResponse,
  HospDtlListRequest,
  HospDtlListItem,
  NpayCodeItem,
  HospSummaryListItem
} from './hiraDto';

const BASE_URL = 'https://apis.data.go.kr/B551182';

export class HiraRepository {
  private serviceKey: string;

  constructor(serviceKey: string) {
    this.serviceKey = serviceKey;
  }

  /**
   * 1. 비급여 항목 병원 목록 요약 (getNonPaymentItemHospList2)
   * 병원별 최저/최고 가격 정보를 요약하여 가져옵니다.
   */
  async getNonPaymentItemHospList2(params: { itemCd: string; sidoCd?: string; sgguCd?: string }): Promise<HospSummaryListItem[]> {
    const rawUrl = `${BASE_URL}/nonPaymentDamtInfoService/getNonPaymentItemHospList2?serviceKey=${this.serviceKey}&_type=json&numOfRows=100&itemCd=${params.itemCd}&sidoCd=${params.sidoCd || ''}&sgguCd=${params.sgguCd || ''}`;

    console.log('HIRA Request (SummaryList):', rawUrl);
    const response = await fetch(rawUrl);
    const data: HiraApiResponse<HospSummaryListItem> = await response.json();

    if (data.response.header.resultCode !== '00') {
      throw new Error(data.response.header.resultMsg);
    }

    const items = data.response.body.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }

  /**
   * 2. 비급여 항목 병원 목록 상세 (getNonPaymentItemHospDtlList)
   */
  async getNonPaymentItemHospDtlList(params: Omit<HospDtlListRequest, 'serviceKey' | '_type'>): Promise<HospDtlListItem[]> {
    // 1. 서버 사이드 필터링(코드 + 이름)을 동시에 활용하여 성능과 정확도를 모두 잡습니다.
    const rawUrl = `${BASE_URL}/nonPaymentDamtInfoService/getNonPaymentItemHospDtlList?serviceKey=${this.serviceKey}&_type=json&numOfRows=100&sidoCd=${params.sidoCd || ''}&sgguCd=${params.sgguCd || ''}&ykiho=${params.ykiho || ''}&npayCd=${params.npayCd || ''}&npayKorNm=${encodeURIComponent(params.npayKorNm || '')}&yadmNm=${encodeURIComponent(params.yadmNm || '')}`;

    console.log('HIRA Request (DtlList):', rawUrl);
    const response = await fetch(rawUrl);
    const data: HiraApiResponse<HospDtlListItem> = await response.json();
    console.log('HIRA Response JSON:', data);

    if (data.response.header.resultCode !== '00') {
      throw new Error(data.response.header.resultMsg);
    }

    const items = data.response.body.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }


  /**
   * 3. 비급여 항목 코드 조회
   * @param npayKorNm 
   */
  async getNonPaymentItemCodeList(npayKorNm: string): Promise<NpayCodeItem[]> {
    const rawUrl = `${BASE_URL}/nonPaymentDamtInfoService/getNonPaymentItemCodeList2?serviceKey=${this.serviceKey}&npayKorNm=${encodeURIComponent(npayKorNm)}&_type=json`;

    console.log('HIRA API Request (CodeList):', rawUrl);
    const response = await fetch(rawUrl);
    const data: HiraApiResponse<NpayCodeItem> = await response.json();
    console.log('HIRA API Response (CodeList):', data);

    if (data.response.header.resultCode !== '00') {
      throw new Error(data.response.header.resultMsg);
    }

    const items = data.response.body.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }
}
