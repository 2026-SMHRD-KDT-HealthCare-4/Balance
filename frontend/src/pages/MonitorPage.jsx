import React, { useRef } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import WebcamView from '../components/WebcamView';

const MonitorPage = () => {
  const videoRef = useRef(null);
  
  // isActive 상태를 추가로 받아옵니다.
  const { angle, status, isActive } = usePoseDetection(videoRef);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>자세 모니터링 시스템</h2>
      
      {isActive ? (
        <div>
          <div style={{ color: 'blue', fontWeight: 'bold', marginBottom: '10px' }}>
            🔵 현재 자세 검사 중입니다... (1분간 진행)
          </div>
          <WebcamView videoRef={videoRef} />
          
          <div style={{ marginTop: '20px' }}>
            <p>📐 현재 각도: {angle}°</p>
            <p>상태: <strong>{status}</strong></p>
          </div>
        </div>
      ) : (
        <div style={{ 
          height: '480px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            🔒 현재는 모니터링 휴식 시간입니다.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>
            다음 검사 시간에 자동으로 웹캠이 켜집니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default MonitorPage;