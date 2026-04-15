import React from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, MapPin } from 'lucide-react';
import { useOverlay } from '@toss/use-overlay';
import { RegionSelectBottomSheet } from '../../region/components/RegionSelectBottomSheet';
import { usePriceList } from '../hooks/usePriceList';
import { PriceCard } from './PriceCard';
import { usePriceStore } from '../../../store/usePriceStore';
import { TossBannerAd } from '../../ads/components/TossBannerAd';
import { AD_CONFIG } from '../../ads/adConfig';
import { useTossAds } from '../../ads/hooks/useTossAds';
import './PriceList.css';

export const PriceList: React.FC = () => {
  const { selectedRegion } = usePriceStore();
  const overlay = useOverlay();
  const { hospitals, isLoading, isComplete, error, sortHospitalsByPrice, sortOrder } = usePriceList();
  const { loadRewardAd } = useTossAds();

  // 리스트가 로드되면 리워드 광고 미리 로드
  React.useEffect(() => {
    if (hospitals.length > 0) {
      loadRewardAd();
    }
  }, [hospitals.length, loadRewardAd]);

  const handleOpenRegionSelect = () => {
    overlay.open(({ isOpen, close }) => (
      <RegionSelectBottomSheet isOpen={isOpen} onClose={close} />
    ));
  };

  if (!selectedRegion) {
    return (
      <div className="price-list-status empty-state">
        <div className="empty-icon-box">
          <div className="pin-circle">
            <MapPin size={32} fill="#3182f6" stroke="white" />
          </div>
        </div>
        <p className="empty-main-text">동네 병원 정보를 찾으려면<br />먼저 지역을 선택해주세요.</p>
        <button className="btn-select-region" onClick={handleOpenRegionSelect}>
          지역 선택하기
        </button>
      </div>
    );
  }

  // 데이터가 아예 없고 로딩 중인 경우에만 전체 화면 로딩
  if (isLoading && hospitals.length === 0) {
    return (
      <div className="price-list-status">
        <div className="loading-spinner" />
        <p>최저가 정보를 찾는 중...</p>
      </div>
    );
  }

  if (error && hospitals.length === 0) {
    return (
      <div className="price-list-status empty-state">
        <div className="empty-icon-box">
          <div className="pin-circle" style={{ backgroundColor: '#ffeee8' }}>
            <span style={{ fontSize: '24px', lineHeight: '24px' }}>⚠️</span>
          </div>
        </div>
        <p className="empty-main-text">현재 심사평가원 서버가 불안정합니다.<br />잠시 후 다시 시도해주세요.</p>
        <span className="error-detail" style={{ marginTop: '8px', fontSize: '12px', color: '#8b95a1' }}>
          에러 원인: 데이터베이스 접속 지연 (공공 API)
        </span>
      </div>
    );
  }

  if (hospitals.length === 0 && isComplete) {
    return (
      <div className="price-list-status empty">
        <p>해당 지역에 검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="price-list-container fade-in">
      <div className="list-header">
        <div className="header-left">
          {!isLoading && (
            <>총 <span className="count">{hospitals.length}개</span>의 병원</>
          )}
        </div>
        <div className="header-right">
          {isLoading ? (
            <button className="btn-sort-loading" disabled>
              <div className="dot-pulse" />
              불러오는 중
            </button>
          ) : (
            hospitals.length > 0 && (
              <button
                className={`btn-sort ${sortOrder ? 'active' : ''}`}
                onClick={sortHospitalsByPrice}
              >
                {sortOrder === 'desc' ? (
                  <ArrowUpWideNarrow size={14} />
                ) : (
                  <ArrowDownWideNarrow size={14} />
                )}
                {sortOrder === 'desc' ? '비싼순' : sortOrder === 'asc' ? '기본순' : '금액순'}
              </button>
            )
          )}
        </div>
      </div>
      <div className="price-list-content">
        {hospitals.map((hospital, index) => {
          const adInterval = AD_CONFIG.POLICY.HOSPITAL_LIST_AD_INTERVAL;
          const maxAds = AD_CONFIG.POLICY.MAX_INLINE_ADS_PER_LIST;

          // 광고 삽입 조건: (index + 1) % interval === 0
          // 예: index 2, 5, 8 ... (3번째, 6번째 ...)
          const isAdRequired = (index + 1) % adInterval === 0 && (index + 1) / adInterval <= maxAds;

          return (
            <React.Fragment key={`${hospital.ykiho}-${index}`}>
              <PriceCard hospital={hospital} />
              {isAdRequired && (
                <TossBannerAd
                  adGroupId={AD_CONFIG.UNIT_ID.BANNER_IMAGE}
                  variant="card"
                  height="180px"
                  className="list-inline-ad"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
