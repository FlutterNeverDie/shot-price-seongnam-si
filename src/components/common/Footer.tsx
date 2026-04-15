import React from 'react';
import './Footer.css';
import licenseImg from '../../assets/license.png';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="license-info">
          <img src={licenseImg} alt="공공누리 제1유형: 출처표시" className="license-image" />
          <p className="license-text">
            본 저작물은 <strong>'건강보험심사평가원'</strong>에서 <strong>'{currentYear}년'</strong> 작성하여 공공누리
            <strong> 제1유형</strong>으로 개방한 <strong>'비급여 진료비 정보'</strong>를 이용하였으며, 해당 저작물은
            <a href="https://www.hira.or.kr" target="_blank" rel="noopener noreferrer"> '건강보험심사평가원(www.hira.or.kr)'</a>
            에서 무료로 다운받으실 수 있습니다.
          </p>
        </div>
      </div>
    </footer>
  );
};
