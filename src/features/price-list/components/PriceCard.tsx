import type { HospitalPriceInfo } from '../../../types';
import { ChevronRight } from 'lucide-react';
import { useOverlay } from '@toss/use-overlay';
import { HospitalDetailBottomSheet } from './HospitalDetailBottomSheet';
import './PriceCard.css';

interface PriceCardProps {
  hospital: HospitalPriceInfo;
}

export const PriceCard: React.FC<PriceCardProps> = ({ hospital }) => {
  const overlay = useOverlay();
  const formattedPrice = hospital.price.toLocaleString();

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🏥 병원 상세 데이터 (Raw):', hospital);
    overlay.open(({ isOpen, close }) => (
      <HospitalDetailBottomSheet
        hospital={hospital}
        isOpen={isOpen}
        onClose={close}
      />
    ));
  };

  return (
    <div className="price-card-container premium-card" onClick={handleOpenDetail}>
      <div className="hospital-info-row">
        <div className="hospital-main">
          <div className="hospital-badge-row">
            <span className="category-badge">
              {hospital.clCdNm === '병원' ? '일반 병원' : hospital.clCdNm}
            </span>
          </div>
          <h3 className="hospital-name">{hospital.hospitalName}</h3>
        </div>
        <div className="price-info">
          <span className="price-value">{formattedPrice}</span>
          <span className="price-unit">원</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="update-date">
          업데이트: {hospital.updateDate
            ? hospital.updateDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
            : '-'}
        </div>
        <button className="btn-detail" onClick={handleOpenDetail}>
          상세보기 <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
