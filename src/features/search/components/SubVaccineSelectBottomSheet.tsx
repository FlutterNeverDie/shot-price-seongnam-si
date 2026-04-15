import React, { useEffect, useState } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { HiraRepository } from '../../../api/hiraRepository';
import { usePriceStore } from '../../../store/usePriceStore';
import type { NpayCodeItem } from '../../../api/hiraDto';
import './SubVaccineSelectBottomSheet.css';

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY as string;

interface SubVaccineSelectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mainKeyword: string;
}

export const SubVaccineSelectBottomSheet: React.FC<SubVaccineSelectBottomSheetProps> = ({
  isOpen,
  onClose,
  mainKeyword,
}) => {
  const { setSelectedSubVaccine, selectedSubVaccine } = usePriceStore();
  const [subItems, setSubItems] = useState<NpayCodeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSubItems = async () => {
      setLoading(true);
      try {
        const repo = new HiraRepository(SERVICE_KEY);
        const data = await repo.getNonPaymentItemCodeList(mainKeyword);

        const filtered = data.filter(item => {
          const name = item.npayKorNm;
          const excludeKeywords = ['병실', '교육', '상담', '치료', '프로그램', '검사', '진단', '관찰'];
          if (excludeKeywords.some(key => name.includes(key))) return false;
          const includeKeywords = ['주사', '백신', '바이러스', '시린지', '테라피', '가다실', '조진', '항원', '항체'];
          return includeKeywords.some(key => name.includes(key)) || name.includes(mainKeyword);
        });

        setSubItems(filtered);
      } catch (error) {
        console.error('세부 항목 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubItems();
  }, [isOpen, mainKeyword]);

  const handleSelect = (item: NpayCodeItem) => {
    setSelectedSubVaccine(item);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`${mainKeyword} 상세 선택`}>
      <div className="sub-vaccine-container">
        {loading ? (
          <div className="sub-loading">항목을 불러오는 중...</div>
        ) : subItems.length > 0 ? (
          <div className="sub-item-list">
            <p className="sub-guide-text">비교할 구체적인 항목을 선택해주세요.</p>
            {subItems.map((item) => (
              <button
                key={`${item.npayCd}-${item.npayKorNm}`}
                className={`sub-item-button ${selectedSubVaccine?.npayCd === item.npayCd ? 'active' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <div className="sub-item-name">{item.npayKorNm}</div>
                <div className="sub-item-code">{item.npayCd}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="sub-empty">관련된 세부 항목이 없습니다.</div>
        )}
      </div>
    </BottomSheet>
  );
};
