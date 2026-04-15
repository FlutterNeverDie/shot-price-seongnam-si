import React from 'react';
import type { HospitalPriceInfo } from '../../../types';
import { useHospitalDetail } from '../hooks/useHospitalDetail';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { MapPin, Phone, Calendar, Info, Globe, FileText, ChevronRight } from 'lucide-react';
import { usePriceStore } from '../../../store/usePriceStore';
import { HospitalBadgeInfo } from './HospitalBadgeInfo';

import './HospitalDetailBottomSheet.css';

interface HospitalDetailBottomSheetProps {
  hospital: HospitalPriceInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const HospitalDetailBottomSheet: React.FC<HospitalDetailBottomSheetProps> = ({
  hospital: initialHospital,
  isOpen,
  onClose,
}) => {
  const { detail, isLoading, formattedUpdateDate } = useHospitalDetail(initialHospital, isOpen);
  const { selectedVaccine } = usePriceStore();


  const handleOpenMap = () => {
    if (!detail.address) return;
    // 상세 주소(괄호 등)를 제외하고 '도로명 주소' 위주로만 검색 쿼리 생성
    // 예: "서울특별시 강남구 역삼로 245, 지하2층..." -> "서울특별시 강남구 역삼로 245"
    const baseAddress = detail.address.split(',')[0].split('(')[0].trim();
    const url = `https://map.kakao.com/link/search/${encodeURIComponent(baseAddress)}`;
    window.open(url, '_blank');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="병원 상세 정보">
      <div className="detail-container">
        {/* 상단 헤더 정보 */}
        <section className="detail-header">
          <h2 className="detail-hospital-name">{detail.hospitalName}</h2>

          <HospitalBadgeInfo
            clCdNm={detail.clCdNm}
            category={selectedVaccine?.name || detail.category}
          />

          <div className="detail-price-box">
            <span className="price-label">예상 접종 비용</span>
            <div className="price-amount">
              <span className="value">{detail.price.toLocaleString()}</span>
              <span className="unit">원</span>
            </div>
            {detail.minPrice !== detail.maxPrice && (
              <div className="price-range">
                최저 {detail.minPrice.toLocaleString()}원 ~ 최고 {detail.maxPrice.toLocaleString()}원
              </div>
            )}
          </div>
        </section>

        {/* 상세 정보 리스트 */}
        <section className="detail-info-list">
          {/* 특이사항 (yadmnpayCdNm) - 추천 항목 */}
          {detail.hospitalNote && (
            <div className="info-item note-highlight">
              <div className="info-icon-box note-icon">
                <FileText size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">기관 상세 설명 (상담료 등)</span>
                <p className="info-value note-text">{detail.hospitalNote}</p>
              </div>
            </div>
          )}

          <div className="info-item">
            <div className="info-icon-box">
              <MapPin size={18} />
            </div>
            <div className="info-content clickable" onClick={handleOpenMap}>
              <div className="info-label-row">
                <span className="info-label">주소</span>
                <span className="map-link-text">지도 보기 <ChevronRight size={14} /></span>
              </div>
              <p className="info-value">
                {detail.address ? detail.address : (isLoading ? '주소를 불러오는 중...' : '정보 없음')}
              </p>
            </div>
          </div>

          {detail.urlAddr && (
            <div className="info-item">
              <div className="info-icon-box">
                <Globe size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">홈페이지</span>
                <a href={detail.urlAddr} target="_blank" rel="noopener noreferrer" className="info-value link">
                  병원 웹사이트 방문하기
                </a>
              </div>
            </div>
          )}

          <div className="info-item">
            <div className="info-icon-box">
              <Phone size={18} />
            </div>
            <div className="info-content">
              <span className="info-label">전화번호</span>
              {detail.telno && detail.telno !== '-' ? (
                <a href={`tel:${detail.telno}`} className="info-value link">{detail.telno}</a>
              ) : (
                <p className="info-value">{isLoading ? '전화번호를 불러오는 중...' : '정보 없음'}</p>
              )}
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon-box">
              <Calendar size={18} />
            </div>
            <div className="info-content">
              <span className="info-label">데이터 업데이트일</span>
              <p className="info-value">{formattedUpdateDate}</p>
            </div>
          </div>
        </section>



        {/* 버튼 영역 */}
        <div className="detail-actions">
          <button className="btn-confirm-primary" onClick={onClose}>
            확인
          </button>
        </div>
      </div>


      {/* 안내 문구 */}
      <section className="detail-notice">
        <div className="notice-card">
          <Info size={16} className="notice-icon" />
          <p>
            병원 사정(백신 수급 등)에 따라 가격이 변동되거나 접종이 불가능할 수 있으니, 방문 전 반드시 전화로 확인해 주세요.
          </p>
        </div>
      </section>
    </BottomSheet>
  );
};
