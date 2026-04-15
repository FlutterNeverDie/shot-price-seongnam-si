import React from 'react';
import { usePriceStore } from '../../../store/usePriceStore';
import { useTossAds } from '../../ads/hooks/useTossAds';
import { useAdFrequency } from '../../ads/hooks/useAdFrequency';
import './VaccineTabs.css';

const VACCINES = [
  { id: '1', name: '가다실', searchKeyword: '가다실' },
  { id: '2', name: '독감', searchKeyword: '독감' },
  { id: '3', name: '폐렴', searchKeyword: '폐렴' },
  { id: '4', name: '간염', searchKeyword: '간염' },
  { id: '5', name: '대상포진', searchKeyword: '대상포진' },
  { id: '6', name: '일본뇌염', searchKeyword: '일본뇌염' },
  { id: '7', name: '파상풍', searchKeyword: 'Td' },
];

export const VaccineTabs: React.FC = () => {
  const { selectedVaccine, setSelectedVaccine } = usePriceStore();
  const { showRewardAd } = useTossAds();
  const { incrementSearchAndCheck } = useAdFrequency();

  // 초기값 설정
  React.useEffect(() => {
    if (!selectedVaccine) {
      setSelectedVaccine(VACCINES[0]);
    }
  }, [selectedVaccine, setSelectedVaccine]);

  const handleTabClick = (vaccine: typeof VACCINES[0]) => {
    if (selectedVaccine?.id === vaccine.id) return;
    
    setSelectedVaccine(vaccine);
    
    // 탭 변경 시에도 5회당 한 번 리워드 광고 노출
    if (incrementSearchAndCheck()) {
      showRewardAd();
    }
  };

  return (
    <div className="vaccine-tabs-container">
      <div className="vaccine-tabs-scroll">
        {VACCINES.map((vaccine) => (
          <button
            key={vaccine.id}
            className={`vaccine-tab-item ${
              selectedVaccine?.id === vaccine.id ? 'active' : ''
            }`}
            onClick={() => handleTabClick(vaccine)}
          >
            <span className="tab-name">{vaccine.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
