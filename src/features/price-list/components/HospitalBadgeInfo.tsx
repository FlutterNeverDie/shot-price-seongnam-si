import React from 'react';
import './HospitalBadgeInfo.css';

interface HospitalBadgeInfoProps {
  clCdNm?: string;
  category: string;
}

/**
 * 🏥 병원 종류(종별) 및 백신 카테고리를 현대적인 Toss 스타일로 시각화하는 컴포넌트
 */
export const HospitalBadgeInfo: React.FC<HospitalBadgeInfoProps> = ({ clCdNm, category }) => {
  // "병원"인 경우 "일반 병원"으로 치환 (정확히 두 글자일 때만)
  const displayClCdNm = clCdNm === '병원' ? '일반 병원' : clCdNm;

  return (
    <div className="hospital-badge-info">
      {displayClCdNm && (
        <div className="badge-item clcd-badge">
          <span className="badge-label">병원 종류</span>
          <span className="badge-value">{displayClCdNm}</span>
        </div>
      )}
      <div className="badge-item category-badge">
        <span className="badge-label">접종 항목</span>
        <span className="badge-value">{category}</span>
      </div>
    </div>
  );
};
