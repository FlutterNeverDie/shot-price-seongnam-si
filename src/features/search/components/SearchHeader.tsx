import React from 'react';
import { useOverlay } from '@toss/use-overlay';
import { usePriceStore } from '../../../store/usePriceStore';
import { RegionSelectBottomSheet } from '../../region/components/RegionSelectBottomSheet';
import { MapPin, ChevronDown } from 'lucide-react';
import './SearchHeader.css';

export const SearchHeader: React.FC = () => {
  const overlay = useOverlay();
  const { selectedRegion } = usePriceStore();

  const handleOpenRegionSelect = () => {
    overlay.open(({ isOpen, close }) => (
      <RegionSelectBottomSheet isOpen={isOpen} onClose={close} />
    ));
  };

  return (
    <header className="search-header glass-effect">
      <div className="search-header-inner">
        <h1 className="main-title">동네 최저가 주사 찾기</h1>
        <div className="location-selector" onClick={handleOpenRegionSelect}>
          <MapPin size={16} strokeWidth={2.5} className="icon-pin" />
          <span className={`location-text ${!selectedRegion ? 'placeholder' : ''}`}>
            {selectedRegion
              ? `${selectedRegion.sidoName} ${selectedRegion.sggName}`
              : '지역을 선택해주세요'}
          </span>
          <ChevronDown size={14} strokeWidth={2.5} className="icon-down" />
        </div>
      </div>
    </header>
  );
};
