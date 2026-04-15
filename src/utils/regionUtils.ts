/**
 * @file regionUtils.ts
 * @description CSV 데이터를 기반으로 지역 코드를 파싱하고 지역명으로 코드를 찾는 유틸리티 함수입니다.
 */

export interface RegionData {
  sidoCode: string;
  sidoName: string;
  sggCode: string;
  sggName: string;
}

/**
 * 정제된 지역 CSV 전체 데이터를 파싱하여 리스트로 반환합니다.
 * 형식: sidoCode,sidoName,sggCode,sggName
 */
export function parseRegionCsv(csvContent: string): RegionData[] {
  return csvContent
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(1) // 헤더 제외
    .map(row => {
      const [sidoCode, sidoName, sggCode, sggName] = row.split(',').map(v => v.trim());
      return { sidoCode, sidoName, sggCode, sggName };
    });
}

/**
 * 시도 코드를 API 규격(6자리)에 맞게 포맷팅합니다.
 * @param sidoCd 2자리 시도 코드 (예: "11")
 * @returns 6자리 시도 코드 (예: "110000")
 */
export function formatSidoCode(sidoCd: string): string {
  if (sidoCd.length === 2) {
    return `${sidoCd}0000`;
  }
  return sidoCd;
}
