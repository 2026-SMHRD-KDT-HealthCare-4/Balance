import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 이동을 위해 추가
import { useScheduledPose } from '../hooks/useScheduledPose';
import WebcamView from '../components/WebcamView';

const TeamMonitorPage = () => {
  const navigate = useNavigate(); // 👈 URL 이동 함수
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  
  const { status, isActive, currentData } = useScheduledPose(videoRef);

  const statusRef = useRef(status);
  const dataRef = useRef(currentData);
  const isActiveRef = useRef(isActive);

  // 🔄 [연동 로직] 거북목 감지 시 예훈님의 스트레칭 페이지로 이동 제안
  useEffect(() => {
    statusRef.current = status;
    dataRef.current = currentData;
    isActiveRef.current = isActive;

    // 상태가 '주의'이거나 '위험'일 때 알림창 띄우기
    if (isActive && status === '주의') {
      // confirm 창은 예시이며, 실제 프로젝트에서는 팀원의 Notification UI를 사용하면 더 좋습니다.
      const confirmStretch = window.confirm(
        "거북목이 감지되었습니다! 스트레칭 가이드 페이지로 이동하시겠습니까?"
      );
      
      if (confirmStretch) {
        navigate('/monitor'); // 👈 예훈님의 MonitorPage_Stretch 경로로 이동
      }
    }
  }, [status, currentData, isActive, navigate]);

  useEffect(() => {
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    if (!pipVideoRef.current) pipVideoRef.current = document.createElement('video');
  }, []);

  const handleTextPIP = async () => {
    try {
      if (!canvasRef.current || !pipVideoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pipVideo = pipVideoRef.current;

      canvas.width = 300;
      canvas.height = 160;

      const drawFrame = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isActiveRef.current) {
          ctx.fillStyle = '#1e90ff';
          ctx.font = 'bold 22px Arial';
          ctx.fillText("🔵 실시간 감시 중", canvas.width / 2, 45);

          const curStatus = statusRef.current;
          ctx.fillStyle = curStatus === '주의' ? '#ffa502' : (curStatus === '정상' ? '#2ed573' : '#ff4757');
          ctx.font = 'bold 40px Arial';
          ctx.fillText(`${curStatus}`, canvas.width / 2, 95);
          
          ctx.fillStyle = '#777';
          ctx.font = '16px Arial';
          ctx.fillText(`거리 변화 감지 중`, canvas.width / 2, 135);
        } else {
          ctx.fillStyle = '#7f8c8d';
          ctx.font = 'bold 28px Arial';
          ctx.fillText("🔒 휴식 시간", canvas.width / 2, canvas.height / 2);
        }
      };

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      drawFrame();
      if (!pipVideo.srcObject) {
        pipVideo.srcObject = canvas.captureStream(10);
        pipVideo.muted = true;
      }
      await pipVideo.play();

      setTimeout(async () => {
        try {
          await pipVideo.requestPictureInPicture();
          const interval = setInterval(() => {
            if (!document.pictureInPictureElement) {
              clearInterval(interval);
              return;
            }
            drawFrame();
          }, 250);
        } catch (e) { console.error("PIP 요청 실패:", e); }
      }, 100);
    } catch (error) { console.error("PIP 오류:", error); }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#2c3e50' }}>실시간 자세 모니터링</h1>
      
      <button onClick={handleTextPIP} style={btnStyle}>📺 PIP 알림창 실행</button>

      {isActive ? (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <WebcamView videoRef={videoRef} />
          <div style={infoBoxStyle}>
            <p style={{ fontSize: '1.2rem' }}>
              현재 상태: <strong style={{color: status === '주의' ? '#ffa502' : '#2ed573'}}>{status}</strong>
            </p>
            <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>
              (어깨 너비: {currentData.sw} | 목 수직 거리: {currentData.nvd})
            </p>
          </div>
        </div>
      ) : (
        <div style={breakBoxStyle}>
          <p style={{ fontSize: '1.5rem', color: '#7f8c8d' }}>🔒 현재는 휴식 시간입니다.</p>
        </div>
      )}
    </div>
  );
};

// 스타일 설정 (기존 유지)
const btnStyle = { 
  marginBottom: '30px', 
  padding: '12px 30px', 
  backgroundColor: '#2c3e50', 
  color: 'white', 
  border: 'none', 
  borderRadius: '30px', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  transition: 'background 0.3s ease'
};

const infoBoxStyle = { 
  marginTop: '20px', 
  padding: '20px', 
  backgroundColor: '#f8f9fa', 
  borderRadius: '15px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const breakBoxStyle = { 
  height: '400px', 
  backgroundColor: '#f1f2f6', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  borderRadius: '20px' 
};

export default TeamMonitorPage;