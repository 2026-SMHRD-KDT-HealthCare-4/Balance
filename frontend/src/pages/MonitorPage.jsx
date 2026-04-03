import React, { useRef, useEffect } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';

const MonitorPage = () => {
  const videoRef = useRef(null);
  
  // 정면 분석용 데이터 꺼내기
  const { angle, shoulderDiff, forwardRatio, status } = usePoseDetection(videoRef);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("웹캠 에러:", error);
      }
    };
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>정면 자세 모니터링</h2>
      
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* 거울처럼 보이도록 transform scaleX(-1) 적용 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '640px',
            height: '480px',
            borderRadius: '10px',
            backgroundColor: '#000',
            objectFit: 'cover',
            transform: 'scaleX(-1)' 
          }}
        />
      </div>

      <div style={{ 
        marginTop: '20px', 
        fontSize: '1.1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        alignItems: 'center'
      }}>
        <p>📐 <strong>목 꺾임 각도:</strong> {angle}° (좌우)</p>
        <p>⚖️ <strong>어깨 비대칭도:</strong> {shoulderDiff} (높낮이 차이)</p>
        <p>🐢 <strong>전진(거북목) 지수:</strong> {forwardRatio} (Z축 깊이)</p>
        
        <div style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          borderRadius: '8px',
          backgroundColor: status === '위험' ? '#ffebee' : status === '주의' ? '#fff8e1' : '#e8f5e9'
        }}>
          <strong>종합 상태: </strong> 
          <span style={{ 
            color: status === '위험' ? '#d32f2f' : status === '주의' ? '#f57c00' : '#388e3c',
            fontWeight: 'bold',
            fontSize: '1.3rem'
          }}>
            {status}
          </span>
        </div>
      </div>
      
      <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '15px' }}>
        * 카메라를 정면으로 바라보고 평소처럼 모니터를 보듯 앉아주세요.
      </div>
    </div>
  );
};

export default MonitorPage;