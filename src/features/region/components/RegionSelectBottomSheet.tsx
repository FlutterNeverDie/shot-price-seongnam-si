import React, { useState } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { useRegionData } from '../hooks/useRegionData';
import { usePriceStore } from '../../../store/usePriceStore';
import { useTossAds } from '../../ads/hooks/useTossAds';
import { useAdFrequency } from '../../ads/hooks/useAdFrequency';
import './RegionSelectBottomSheet.css';

interface RegionSelectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegionSelectBottomSheet: React.FC<RegionSelectBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { sidoList, getSggList, isLoading } = useRegionData();
  const { selectedRegion, setSelectedRegion } = usePriceStore();
  const { loadRewardAd, showRewardAd } = useTossAds();
  const { incrementSearchAndCheck } = useAdFrequency();
  
  const [tempSido, setTempSido] = useState<{ code: string; name: string }>({
    code: '',
    name: '',
  });

  // 열릴 때 초기값 설정 (선택된 지역이 없으면 서울 자동 선택)
  React.useEffect(() => {
    if (isOpen && sidoList.length > 0) {
      if (selectedRegion) {
        setTempSido({ 
          code: selectedRegion.sidoCode, 
          name: selectedRegion.sidoName 
        });
      } else {
        // 서울 코드(110000) 우선 검색, 없으면 첫 번째 항목
        const seoul = sidoList.find((s: { code: string; name: string }) => s.name.includes('서울')) || sidoList[0];
        setTempSido({ code: seoul.code, name: seoul.name });
      }
    }
  }, [isOpen, selectedRegion, sidoList]);

  // 바텀시트가 열릴 때 광고 미리 로드
  React.useEffect(() => {
    if (isOpen) {
      loadRewardAd();
    }
  }, [isOpen, loadRewardAd]);

  const handleSidoSelect = (code: string, name: string) => {
    setTempSido({ code, name });
  };

  const handleSggSelect = (code: string, name: string) => {
    setSelectedRegion({
      sidoCode: tempSido.code,
      sidoName: tempSido.name,
      sggCode: code,
      sggName: name,
    });
    onClose();
    
    // 지역 선택 완료 후 5회 마다 한 번씩 리워드 광고 노출
    if (incrementSearchAndCheck()) {
      showRewardAd();
    }
  };

  if (isLoading) return null;

  const currentSggList = tempSido.code ? getSggList(tempSido.code, tempSido.name) : [];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="지역 선택">
      <div className="region-select-container">
        {/* 시도 리스트 */}
        <div className="region-column sido-column">
          {sidoList.map((sido: { code: string; name: string }) => (
            <button
              key={sido.code}
              className={`region-item ${tempSido.code === sido.code ? 'active' : ''}`}
              onClick={() => handleSidoSelect(sido.code, sido.name)}
            >
              {sido.name}
            </button>
          ))}
        </div>

        {/* 시군구 리스트 */}
        <div className="region-column sgg-column">
          {currentSggList.map((sgg: { code: string; name: string }) => (
            <button
              key={sgg.code}
              className={`region-item ${selectedRegion?.sggCode === sgg.code ? 'selected' : ''}`}
              onClick={() => handleSggSelect(sgg.code, sgg.name)}
            >
              {sgg.name}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};
