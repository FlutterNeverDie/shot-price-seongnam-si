import { useCallback } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import { useOverlay } from '@toss/use-overlay';
import { useAdFrequency } from './useAdFrequency';
import { AD_CONFIG } from '../adConfig';

/**
 * 리워드 광고(Rewarded) 로드 및 노출을 관리하는 훅입니다.
 */
export function useTossAds() {
  const isTossApp = /TossApp/i.test(navigator.userAgent);
  const overlay = useOverlay();
  const { isRewardAdLoaded, setRewardAdLoaded } = useAdFrequency();

  /**
   * 리워드 광고를 미리 로드합니다.
   */
  const loadRewardAd = useCallback(() => {
    if (!isTossApp) {
      console.log('[Mock Ad] Reward Ad Pre-loading...');
      setRewardAdLoaded(true); // 로컬에선 항상 로드된 것으로 간주
      return;
    }

    try {
      if (GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
        const unregister = GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: AD_CONFIG.UNIT_ID.FULLSCREEN, // 전면 광고로 변경
          },
          onEvent: (event: any) => {
            if (event.type === 'loaded') {
              console.log('Reward Ad Loaded');
              setRewardAdLoaded(true);
              unregister();
            }
          },
          onError: (error: any) => {
            console.error('Failed to load reward ad:', error);
            setRewardAdLoaded(false);
            unregister();
          },
        });
      }
    } catch (error) {
      console.error('Failed to load reward ad check:', error);
    }
  }, [isTossApp, setRewardAdLoaded]);

  /**
   * 로드된 리워드 광고를 노출합니다.
   */
  const showRewardAd = useCallback((onComplete?: () => void) => {
    if (!isTossApp) {
      console.log('[Mock Ad] Reward Ad Shown!');
      
      // 로컬/웹 환경에서도 광고가 뜨는 것을 시각적으로 확인하기 위해 모킹 UI 노출
      overlay.open(({ close }) => (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '24px',
            color: '#191f28',
            maxWidth: '320px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>[전면 광고 스킵 테스트]</h2>
            <p style={{ fontSize: '15px', color: '#4e5968', marginBottom: '32px', lineHeight: '1.5' }}>
              전면 광고가 노출되었습니다.
            </p>
            <button 
              onClick={() => { close(); onComplete?.(); }}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#3182f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              닫고 계속하기
            </button>
          </div>
        </div>
      ));
      return;
    }

    if (!isRewardAdLoaded) {
      console.warn('Reward ad not loaded yet. Skipping show.');
      onComplete?.();
      return;
    }

    // 바텀시트 등이 올라온 상태에서 스택 겹침을 방지하기 위한 안전 지연
    setTimeout(() => {
      try {
        if (GoogleAdMob.showAppsInTossAdMob.isSupported()) {
          const unregister = GoogleAdMob.showAppsInTossAdMob({
            options: {
              adGroupId: AD_CONFIG.UNIT_ID.FULLSCREEN, // 전면 광고 ID 사용
            },
            onEvent: (event: any) => {
              // 💡 전면 광고(Interstitial) 로직: 닫히거나 예외가 발생하면 즉시 통과시킴
              if (event.type === 'dismissed' || event.type === 'adClosed' || event.type === 'failedToShow' || event.type === 'adFailedToShow') {
                setRewardAdLoaded(false); // 사용 후 상태 초기화
                onComplete?.();
                unregister();
              }
            },
            onError: (error: any) => {
              console.error('Failed to show reward ad:', error);
              onComplete?.();
              unregister();
            },
          });
        } else {
          onComplete?.();
        }
      } catch (error) {
        console.error('Failed to show reward ad check:', error);
        onComplete?.();
      }
    }, 150);
  }, [isTossApp, isRewardAdLoaded, setRewardAdLoaded, overlay]);

  return {
    loadRewardAd,
    showRewardAd,
    isRewardAdLoaded
  };
}
