import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as FaIcons from "react-icons/fa"; // FaIcons로 통합 관리
import './Diagnosis.css'; 

export default function Diagnosis() {
  const navigate = useNavigate();
  const [step, setStep] = useState('guide');

  const handleBack = () => {
    if (step === 'measuring') {
      if (window.confirm("지금 나가시면 진단 데이터가 삭제됩니다. 중단하시겠습니까?")) {
        navigate('/');
      }
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
          {/* 1단계: 가이드 */}
          {step === 'guide' && (
            <>
              <div className="hero-visual">
                <div className="base-blob"></div>
                {/* 1. 이미지를 public/images/posture_guide.png 경로에 저장했다면 아래 코드를 사용 */}
                <img 
                    src="/images/posture_guide.png" 
                    alt="거북목 측정 가이드" 
                    className="guide-img" 
                />
                </div>
                <h2 className="title">내 목 상태, 측정할까요?</h2>
                <p className="desc">
                그림처럼 <strong>옆모습</strong>이 잘 보이도록 앉아주세요.<br />
                AI가 당신의 경추 각도를 분석합니다.
                </p>
                <button className="main-btn" onClick={() => setStep('measuring')}>
                준비됐어요!
                </button>
            </>
          )}

          {/* 2단계: 측정 중 (에러 수정됨) */}
          {step === 'measuring' && (
            <> {/* Fragment 추가: 여러 요소를 하나로 감쌈 */}
              <div className="webcam-box">
                <FaIcons.FaCamera style={{ fontSize: '2rem', marginBottom: '10px' }} />
                <span>AI 분석 중...</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '35%' }}></div>
              </div>
              <p className="desc" style={{ fontSize: '0.9rem', marginTop: '15px' }}>
                측정이 진행 중입니다 (35%)<br />
                움직임을 최소화하고 정면을 유지하세요.
              </p>
              <button 
                onClick={() => setStep('result')} 
                style={{marginTop: '40px', opacity: 0.2, cursor: 'pointer', border: 'none', background: 'none'}}
              >
                [테스트] 결과 보기
              </button>
            </>
          )}

          {/* 3단계: 결과 */}
          {step === 'result' && (
            <>
              <div className="hero-visual">
                <div className="base-blob" style={{ background: '#FFEDED' }}></div>
                <div style={{ fontSize: '4rem', zIndex: 1 }}>⚠️</div>
              </div>
              <h2 className="title" style={{ color: '#E53E3E' }}>거북목 '위험' 단계</h2>
              <p className="desc">
                당신의 목 각도는 정상 범위보다 <strong>15도</strong> 앞서 있습니다.<br />
                이대로 방치하면 목 디스크로 이어질 수 있습니다.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '20px' }}>
                <button className="main-btn" onClick={() => navigate('/login')}>
                  결과 저장하고 맞춤 케어 받기
                </button>
                <button 
                  className="main-btn" 
                  style={{ background: 'none', color: '#9CA3AF', boxShadow: 'none', border: '1px solid #E5E7EB' }}
                  onClick={() => navigate('/')}
                >
                  나중에 하기
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}