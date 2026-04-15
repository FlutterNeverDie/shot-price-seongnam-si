import type { HospitalInfoResponse, HospitalBasisRequest, HospitalBasisItem } from './hospitalInfoDto';

const BASE_URL = 'https://apis.data.go.kr/B551182/hospInfoServicev2';

export class HospitalInfoRepository {
  private serviceKey: string;

  constructor(serviceKey: string) {
    this.serviceKey = serviceKey;
  }

  /**
   * 병원 기본 정보 조회 (주소, 전화번호, 좌표 등)
   * getHospBasisList
   */
  async getHospBasisList(params: Partial<HospitalBasisRequest>): Promise<HospitalBasisItem[]> {
    const queryParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
      ) as Record<string, string>
    );

    // serviceKey가 이미 인코딩되어 있으므로 URLSearchParams를 쓰지 않고 직접 붙여서 이중 인코딩 방지
    const rawUrl = `${BASE_URL}/getHospBasisList?serviceKey=${this.serviceKey}&_type=json&${queryParams.toString()}`;

    try {
      console.log('Hospital Info Request:', rawUrl);
      const response = await fetch(rawUrl);
      
      // 403 Forbidden 등 에러 처리
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
      }

      const data: HospitalInfoResponse<HospitalBasisItem> = await response.json();

      if (data.response.header.resultCode !== '00') {
        throw new Error(data.response.header.resultMsg);
      }

      const items = data.response.body.items?.item;
      if (!items) return [];
      
      return Array.isArray(items) ? items : [items];
    } catch (error) {
      console.error('getHospBasisList 에러:', error);
      throw error;
    }
  }
}
