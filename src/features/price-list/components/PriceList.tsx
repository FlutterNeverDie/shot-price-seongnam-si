import React from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, MapPin } from 'lucide-react';
import { usePriceList } from '../hooks/usePriceList';
import { PriceCard } from './PriceCard';
import './PriceList.css';

export const PriceList: React.FC = () => {
  const { hospitals, isLoading, isComplete, error, sortHospitalsByPrice, sortOrder } = usePriceList();

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
      <div className="price-list-status empty-state">
        <div className="empty-icon-box">
          <div className="pin-circle">
            <MapPin size={32} fill="#3182f6" stroke="white" />
          </div>
        </div>
        <p className="empty-main-text">성남시에 해당 항목의<br />검색 결과가 없습니다.</p>
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
        {hospitals.map((hospital, index) => (
          <PriceCard key={`${hospital.ykiho}-${index}`} hospital={hospital} />
        ))}
      </div>
    </div>
  );
};
