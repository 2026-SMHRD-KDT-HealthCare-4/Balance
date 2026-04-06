import React, { useState, useRef, useEffect } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection'; 
import StretchPage from './StretchPage';

const MonitorPage = () => {
  const videoRef = useRef(null);
  const [isStretchMode, setIsStretchMode] = useState(false);
  
  // 1. 커스텀 훅을 통해 실시간 자세 데이터 가져오기
  // (여기에는 의성님의 분석 결과 + Ye-hoon님의 평균 데이터가 모두 들어있음)
  const postureData = usePoseDetection(videoRef);

  // 2. 특정 각도 이하(거북목 심화)일 때 스트레칭 모드 전환
  useEffect(() => {
    // 0도보다 크고 45도 미만일 때 (0도는 감지 안 된 상태 방지)
    if (postureData.angle > 0 && postureData.angle < 45) {
      setIsStretchMode(true);
    }
  }, [postureData.angle]);

  return (
    <div style={{ 
      width: '100vw', height: '100vh', 
      backgroundColor: '#020617', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* --- 1. 모니터링 모드 (거북목 감시 중) --- */}
      {!isStretchMode && (
        <div style={{ 
          position: 'relative', 
          width: '90%', 
          height: '90%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* 비디오 컨테이너 */}
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative'
          }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{
                width: 'auto',
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '100vh',
                objectFit: 'contain', 
                transform: 'scaleX(-1)', // 거울 모드
                borderRadius: '30px', 
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                backgroundColor: '#000'
              }}
            />

            {/* 안내 문구: 비디오 하단에 오버레이 */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fbbf24',
              padding: '10px 20px',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: '600',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              zIndex: 10
            }}>
              ⚠️ 어깨가 보이도록 뒤로 조금 물러나 주세요
            </div>
          </div>

          {/* 좌측 상단 실시간 상태 표시 UI */}
          <div style={{ 
            position: 'absolute', top: '20px', left: '20px', 
            color: 'white', background: 'rgba(15, 23, 42, 0.9)', 
            padding: '15px 25px', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 20
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
              상태: <span style={{ color: postureData.status === '정상' ? '#10b981' : '#f43f5e' }}>{postureData.status}</span>
            </p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>목 각도: {postureData.angle}°</p>
          </div>
        </div>
      )}

      {/* --- 2. 스트레칭 모드 (거북목 감지되어 가이드 출력 중) --- */}
      {isStretchMode && (
        <StretchPage 
          landmarks={postureData.landmarks} 
          currentData={postureData} // ⭐ 핵심: 평균값(avgNoseY, avgWidth)이 포함된 데이터를 넘겨줌
          onFinish={() => setIsStretchMode(false)} 
        />
      )}
    </div>
  );
};

export default MonitorPage;