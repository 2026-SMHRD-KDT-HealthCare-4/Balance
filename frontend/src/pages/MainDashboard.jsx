import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedPose } from '../hooks/useUnifiedPose';
import StretchPage from './StretchPage';

const MainDashboard = () => {
  const videoRef = useRef(null);
  const [isStretchingMode, setIsStretchingMode] = useState(false);
  
  // 통합 훅 연결
  const { postureData, rawLandmarks } = useUnifiedPose(videoRef);

  // 자동 전환 로직 (기존 유지)
  useEffect(() => {
    if (postureData.status === '위험' && !isStretchingMode) {
      console.log("자동 감지: 스트레칭 시작");
      setIsStretchingMode(true);
    }
  }, [postureData.status, isStretchingMode]);

  const getStatusColor = () => {
    switch(postureData.status) {
      case '위험': return '#ef4444';
      case '주의': return '#f59e0b';
      case '정상': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      {isStretchingMode ? (
        <StretchPage 
          landmarks={rawLandmarks} 
          onFinish={() => setIsStretchingMode(false)} 
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <header style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2>실시간 자세 모니터링 (의성 & 사용자 통합)</h2>
            <p style={{ color: getStatusColor(), fontWeight: 'bold', fontSize: '1.2rem' }}>
              현재 상태: {postureData.status}
            </p>
          </header>

          <div style={{ 
            position: 'relative', 
            width: '640px', 
            height: '480px', 
            borderRadius: '20px', 
            border: `5px solid ${getStatusColor()}`,
            overflow: 'hidden',
            backgroundColor: '#000'
          }}>
            <video 
              ref={videoRef} 
              id="shared-video"
              autoPlay 
              playsInline
              muted
              style={{ width: '100%', height: '100%', transform: 'rotateY(180deg)', objectFit: 'cover' }} 
            />
            
            {/* 데이터 수치 오버레이 */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '10px', fontSize: '0.8rem' }}>
              <div>CVA: {postureData.cva}°</div>
              <div>어깨 비대칭: {postureData.shoulderDiff}%</div>
              <div>목 기울기: {postureData.angle}°</div>
            </div>
          </div>

          {/* --- 테스트용 수동 버튼 영역 --- */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => setIsStretchingMode(true)}
              style={{ 
                padding: '15px 30px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '1rem', 
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            >
              🚀 수동 스트레칭 테스트 시작
            </button>
            
            <button 
              onClick={() => console.log("현재 랜드마크 데이터:", rawLandmarks)}
              style={{ 
                padding: '15px 20px', 
                backgroundColor: '#4b5563', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer'
              }}
            >
              📊 로그 확인 (Console)
            </button>
          </div>
          {/* --------------------------- */}

          <p style={{ marginTop: '20px', color: '#666', fontSize: '0.9rem' }}>
            ※ '수동 스트레칭' 버튼을 누르면 즉시 StretchPage로 전환되어 분석 로직을 테스트할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;