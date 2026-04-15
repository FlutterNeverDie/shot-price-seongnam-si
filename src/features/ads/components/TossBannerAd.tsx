import React, { useEffect, useRef, useState } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';

interface Props {
  adGroupId: string;    // 토스 콘솔에서 발급받은 ID
  height?: string;      // 배너 높이 (문구형: 96px, 이미지형: 410px 권장)
  variant?: 'card' | 'expanded'; // 'card'는 그림자와 테두리, 'expanded'는 꽉 찬 형태
  className?: string;   // 추가 스타일링용 클래스명
}

/**
 * 토스 인앱 광고 2.0 배너 컴포넌트 (ver2 요약 반영)
 * 라이브러리 지원 버전에 맞게 초기화 및 부착 로직을 수행합니다.
 */
export const TossBannerAd: React.FC<Props> = ({ 
  adGroupId, 
  height = '96px', 
  variant = 'expanded', // 기본값을 expanded로 설정 (가이드 준수)
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 가이드라인에 따른 정규표현식 적용
  const isTossApp = /TossApp/i.test(navigator.userAgent);

  useEffect(() => {
    // 1. SDK 초기화 (앱 실행 시 한 번만 권장되나, 컴포넌트 내에서도 지원 여부 확인 후 처리)
    if (!isTossApp) return;

    if (TossAds.initialize.isSupported()) {
      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            setIsInitialized(true);
          },
          onInitializationFailed: (error) => {
            console.error('Toss Ads SDK initialization failed:', error);
          },
        },
      });
    }
  }, [isTossApp]);

  useEffect(() => {
    // 2. 초기화 완료 및 컨테이너 존재 시 배너 부착
    if (!isTossApp || !isInitialized || !containerRef.current) return;

    let banner: { destroy: () => void } | undefined;

    try {
      // API 시그니처: (adGroupId, target, options)
      banner = TossAds.attachBanner(adGroupId, containerRef.current, {
        variant,
        theme: 'auto',
        tone: 'blackAndWhite',
      });
    } catch (error) {
      console.error('Toss Banner Ad Attachment Error:', error);
    }

    // 3. 컴포넌트 소멸 시 광고 객체 파괴 (메모리 관리 필수)
    return () => {
      if (banner && typeof banner.destroy === 'function') {
        banner.destroy();
      }
    };
  }, [adGroupId, variant, isInitialized, isTossApp]);

  return (
    <div 
      className={`toss-banner-ad-wrapper ${className}`}
      style={{ 
        width: '100%', 
        minHeight: height, // 중요: 높이가 0이면 광고가 그려지지 않음
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div ref={containerRef} style={{ width: '100%' }} />
      {!isTossApp && (
        <div 
          className="mock-ad-ui"
          style={{
            width: '100%',
            height: height,
            border: '2px dashed #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ccc',
            fontSize: '12px'
          }}
        >
          [Toss Ad: {adGroupId}]
        </div>
      )}
    </div>
  );
};
