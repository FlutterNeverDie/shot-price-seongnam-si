export interface VaccineItem {
  id: string;
  name: string;
  code?: string; // npayCd (선택적)
  searchKeyword?: string;
}

export interface HospitalPriceInfo {
  ykiho: string;       // 요양기관기호 (고유 ID)
  hospitalName: string; // yadmNm
  address: string;      // addr
  telno: string;
  price: number;        // curAmt
  minPrice: number;     // minAmt
  maxPrice: number;     // maxAmt
  updateDate: string;   // lastUpdtDt
  category: string;     // npayKorNm
  isUnlocked: boolean;
  clCdNm: string;       // 종별 (의원, 병원 등)
  urlAddr?: string;     // 홈페이지
  hospitalNote?: string; // 기관별 상세 설명 (yadmnpayCdNm)
  npayCd?: string;      // 비급여 코드
  xPos?: string;        // x좌표 (경도)
  yPos?: string;        // y좌표 (위도)
}

export interface ApiResponse<T> {
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

export interface RegionState {
  sidoCode: string;
  sidoName: string;
  sggCode: string;
  sggName: string;
}
