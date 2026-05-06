import React from 'react';
import './ApiKeyNotice.css';
import { AlertCircle } from 'lucide-react';

export const ApiKeyNotice: React.FC = () => {
  return (
    <div className="api-key-notice-overlay">
      <div className="api-key-notice-card">
        <div className="notice-icon">
          <AlertCircle size={48} color="#f44336" />
        </div>
        <h1>API 키가 설정되지 않았습니다</h1>
        <p>
          공공데이터포털에서 발급받은 <strong>HIRA 서비스 키</strong>가 <code>.env</code> 파일에 설정되어 있지 않습니다.
        </p>
        <div className="notice-steps">
          <p>1. <code>.env</code> 파일을 생성하세요.</p>
          <p>2. 아래 내용을 추가하세요:</p>
          <pre>VITE_HIRA_SERVICE_KEY=YOUR_KEY_HERE</pre>
        </div>
        <p className="notice-footer">키 설정 후 앱을 다시 시작해 주세요.</p>
      </div>
    </div>
  );
};
