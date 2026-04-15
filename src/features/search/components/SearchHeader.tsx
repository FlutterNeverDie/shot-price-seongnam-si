import React from 'react';
import { MapPin } from 'lucide-react';
import './SearchHeader.css';

export const SearchHeader: React.FC = () => {
  return (
    <header className="search-header glass-effect">
      <div className="search-header-inner">
        <h1 className="main-title">성남시 최저가 주사 찾기</h1>
        <div className="location-selector">
          <MapPin size={16} strokeWidth={2.5} className="icon-pin" />
          <span className="location-text">경기도 성남시</span>
        </div>
      </div>
    </header>
  );
};
