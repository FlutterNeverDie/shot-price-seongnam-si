import React from 'react';
import { usePriceStore, SEONGNAM_DISTRICTS } from '../../../store/usePriceStore';
import './DistrictTabs.css';

export const DistrictTabs: React.FC = () => {
  const { selectedDistrict, setSelectedDistrict } = usePriceStore();

  return (
    <div className="district-tabs-container">
      <div className="district-tabs-list">
        <button
          className={`district-tab-item ${selectedDistrict === null ? 'active' : ''}`}
          onClick={() => setSelectedDistrict(null)}
        >
          전체
        </button>
        {SEONGNAM_DISTRICTS.map((district) => (
          <button
            key={district.sggCode}
            className={`district-tab-item ${
              selectedDistrict?.sggCode === district.sggCode ? 'active' : ''
            }`}
            onClick={() => setSelectedDistrict(district)}
          >
            {district.name}
          </button>
        ))}
      </div>
    </div>
  );
};
