import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import './Diagnosis.css';

export default function Diagnosis() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState('guide');
  const [measureData, setMeasureData] = useState(null);

  // 팩트: SideCapturePage에서 결과를 들고 navigate('/diagnosis', { state: { result } })로 돌아올 때 감지
  useEffect(() => {
    if (location.state && location.state.result) {
      setMeasureData(location.state.result);
      setStep('result');
    }
  }, [location]);

  // 페이지 이동 함수 (핸들스타트)
  const handleStartMeasurement = () => {
    // 냉정한 판단: 부모 컨테이너의 CSS 간섭을 피하기 위해 아예 독립 페이지로 이동합니다.
    navigate('/side-capture');
  };

  const handleBack = () => {
    if (step === 'result') {
      setStep('guide');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="diagnosis-page">
      <div className="app-container">
        <header className="app-header">
          <button onClick={handleBack} className="back-btn">
            <FaIcons.FaChevronLeft />
          </button>
          <span style={{ fontWeight: 800 }}>AI 정밀 진단</span>
          <div style={{ width: '24px' }}></div>
        </header>

        <main id="center">
          {step === 'guide' && (
            <>
              <div className="hero-visual">
                <div className="base-blob"></div>
                <img 
                    src="/images/posture_guide.png" 
                    alt="거북목 측정 가이드" 
                    className="guide-img" 
                />
              </div>
              <h2 className="title">내 목 상태, 측정할까요?</h2>
              <p className="desc">
                옆모습이 잘 보이도록 앉아주세요.<br />
                AI가 당신의 경추 각도를 분석합니다.
              </p>
              
              {/* 수정된 부분: handleStartMeasurement 함수 호출 */}
              <button className="main-btn" onClick={()=> navigate('/side-capture')}>
                준비됐어요!
              </button>
            </>
          )}


{step === 'result' && (
  <div className="result-container" style={{ padding: '0 20px' }}>
    <div className="result-card" style={{
      backgroundColor: '#fff', borderRadius: '24px', padding: '30px 20px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.05)', textAlign: 'center', marginTop: '20px'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
        {measureData?.status === '위험' || measureData?.status === '심각' ? '⚠️' : '✅'}
      </div>
      <h2 style={{ color: measureData?.color, fontSize: '1.4rem', marginBottom: '8px' }}>
        거북목 '{measureData?.status}' 단계
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '15px' }}>
        목 각도: <span style={{ fontWeight: '800' }}>{measureData?.angle}°</span>
      </p>
      <div style={{ 
        backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px', 
        fontSize: '0.95rem', color: '#666', lineHeight: '1.5' 
      }}>
        {measureData?.comment}
      </div>
    </div>

    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button className="main-btn" onClick={() => navigate('/login')}>결과 저장하고 관리 시작</button>
      <button className="sub-btn" onClick={() => navigate('/')} style={{
        background: 'none', color: '#9CA3AF', border: 'none', padding: '10px'
      }}>홈으로 이동</button>
    </div>
  </div>
)}
          
        </main>
      </div>
    </div>
  );
}