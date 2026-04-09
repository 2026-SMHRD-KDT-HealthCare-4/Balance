import React, { useRef, useEffect, useState } from 'react';
import { useScheduledPose } from '../hooks/useScheduledPose';
import WebcamView from '../components/WebcamView';

const MonitorPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const pipVideoRef = useRef(document.createElement('video'));
  
  // 훅에서 데이터 가져오기 (currentData 추가)
  const { status, isActive, currentData } = useScheduledPose(videoRef);

  const statusRef = useRef(status);
  const dataRef = useRef(currentData);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    statusRef.current = status;
    dataRef.current = currentData;
    isActiveRef.current = isActive;
  }, [status, currentData, isActive]);

  const handleTextPIP = async () => {
    try {
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
          // 색상 결정 (주의는 주황색)
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
        } catch (e) { console.error(e); }
      }, 100);
    } catch (error) { console.error(error); }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>실시간 자세 모니터링</h1>
      
      <button onClick={handleTextPIP} style={btnStyle}>📺 PIP 알림창 실행</button>

      {isActive ? (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <WebcamView videoRef={videoRef} />
          <div style={infoBoxStyle}>
            <p>상태: <strong style={{color: status === '주의' ? 'orange' : 'green'}}>{status}</strong></p>
            <p style={{fontSize: '0.8rem', color: '#666'}}>
              (어깨 너비: {currentData.sw} | 목 수직: {currentData.nvd})
            </p>
          </div>
        </div>
      ) : (
        <div style={breakBoxStyle}><p>🔒 현재는 휴식 시간입니다.</p></div>
      )}
    </div>
  );
};

// 스타일 (생략 가능)
const btnStyle = { marginBottom: '30px', padding: '12px 30px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' };
const infoBoxStyle = { marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '10px' };
const breakBoxStyle = { height: '300px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px' };

export default MonitorPage;