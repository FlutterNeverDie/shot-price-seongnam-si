/**
 * 병원정보서비스 v2 (getHospBasisList) 관련 DTO
 */
export interface HospitalInfoResponse<T> {
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

export interface HospitalBasisRequest {
  serviceKey: string;
  ykiho?: string;
  pageNo?: string;
  numOfRows?: string;
  sidoCd?: string;
  sgguCd?: string;
  emdongNm?: string;
  yadmNm?: string;
  zipCd?: string;
  clCd?: string;
  dgsbjtCd?: string;
  xPos?: string;
  yPos?: string;
  radius?: string;
  _type?: 'json';
}

export interface HospitalBasisItem {
  ykiho: string;
  yadmNm: string;
  clCd: string;
  clCdNm: string;
  sidoCd: number;
  sidoCdNm: string;
  sgguCd: number;
  sgguCdNm: string;
  emdongNm: string;
  postNo: string;
  addr: string;
  telno: string;
  hospUrl?: string;
  XPos: string;
  YPos: string;
  distance?: string;
  drTotCnt?: string;
  mdeptSdrCnt?: string;
  // ... 기타 인력 정보들 필요 시 추가
}
