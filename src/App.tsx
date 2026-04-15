import { SearchHeader } from './features/search/components/SearchHeader'
import { VaccineTabs } from './features/search/components/VaccineTabs'
import { PriceList } from './features/price-list/components/PriceList'
import { Footer } from './components/common/Footer'
import { TossBannerAd } from './features/ads/components/TossBannerAd'
import { AD_CONFIG } from './features/ads/adConfig'
import { TossAds } from '@apps-in-toss/web-framework'
import { useEffect } from 'react'
import './App.css'

function App() {
  useEffect(() => {
    // navigator.userAgent를 통해 토스 앱 환경인지 먼저 확인
    const isTossApp = /TossApp/i.test(navigator.userAgent);
    if (!isTossApp) return;

    // 토스 앱 환경인 경우에만 .isSupported() 체크 및 초기화 진행
    try {
      if (TossAds.initialize.isSupported()) {
        TossAds.initialize({
          callbacks: {
            onInitialized: () => console.log('Toss Ads SDK Initialized'),
            onInitializationFailed: (err) => console.error('Toss Ads SDK Init Failed', err)
          }
        });
      }
    } catch (e) {
      console.warn('TossAds initialization check failed', e);
    }
  }, []);

  return (
    <div className="app-container">
      {/* 헤더: 지역 선택 및 타이틀 */}
      <SearchHeader />

      {/* 백신 카테고리 탭 */}
      <VaccineTabs />

      {/* 최저가 리스트 */}
      <main className="content-area">
        <PriceList />
      </main>

      {/* 하단 푸터: 저작권 및 출처 표기 */}
      <Footer />

      {/* 하단 고정 띠 배너 */}
      <TossBannerAd 
        adGroupId={AD_CONFIG.UNIT_ID.BANNER_TEXT}
        variant="expanded"
        height="60px"
        className="bottom-fixed-ad"
      />
    </div>
  )
}

export default App
