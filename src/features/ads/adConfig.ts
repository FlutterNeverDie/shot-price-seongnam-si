/**
 * 광고 관련 설정값 및 노출 정책을 관리합니다.
 */
export const AD_CONFIG = {
  // 상용(Live) 광고 그룹 ID
  UNIT_ID: {
    REWARD: 'ait.v2.live.366e7dee081c49e9', // 기존 보상형 광고 (현재 미사용)
    FULLSCREEN: 'ait.v2.live.b4a38e5cbf074896', // 전면 광고 (New)
    BANNER_TEXT: 'ait.v2.live.861e5d28cb7145f1', // 문구 강조형 (하단 띠 배너)
    BANNER_IMAGE: 'ait.v2.live.230f536ff0d44e56', // 이미지 강조형 (리스트 사이 배너)

    // [테스트용 ID] 심사나 개발 테스트 시 아래 주석을 풀고 사용하세요.
    // REWARD: 'ait-ad-test-rewarded-id',
    // FULLSCREEN: 'ait-ad-test-fullscreen-id',
    // BANNER_TEXT: 'ait-ad-test-banner-id',
    // BANNER_IMAGE: 'ait-ad-test-native-image-id',
  },

  // 노출 정책
  POLICY: {
    HOSPITAL_LIST_AD_INTERVAL: 3, // 3개 병원마다 광고 삽입
    MAX_INLINE_ADS_PER_LIST: 2,   // 리스트당 최대 이미지 배너 노출 수
    DETAILS_AD_FREQUENCY: 5,     // 상세 정보 5회 조회 시 전면 광고 노출
  }
};
