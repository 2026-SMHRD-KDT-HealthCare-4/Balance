import React, { useRef, useEffect, useState } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import WebcamView from '../components/WebcamView';

const MonitorPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const pipVideoRef = useRef(document.createElement('video')); // Ref로 관리하여 초기화 방지
  
  const savedBaseline = JSON.parse(localStorage.getItem('user_baseline') || 'null');
  const { angle, status, isActive } = usePoseDetection(videoRef, savedBaseline);

  // 최신 데이터 참조용 Ref
  const statusRef = useRef(status);
  const angleRef = useRef(angle);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    statusRef.current = status;
    angleRef.current = angle;
    isActiveRef.current = isActive;
  }, [status, angle, isActive]);

  /**
   * [최종 해결책] PIP 실행 함수
   */
  const handleTextPIP = async () => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pipVideo = pipVideoRef.current;

      canvas.width = 300;
      canvas.height = 160;

      // 1. 캔버스 그리기 함수
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
          ctx.fillStyle = curStatus === '위험' ? '#ff4757' : (curStatus === '주의' ? '#ffa502' : '#2ed573');
          ctx.font = 'bold 36px Arial';
          ctx.fillText(`${curStatus}`, canvas.width / 2, 95);
          
          ctx.fillStyle = '#555';
          ctx.font = 'bold 20px Arial';
          ctx.fillText(`${angleRef.current}°`, canvas.width / 2, 135);
        } else {
          ctx.fillStyle = '#7f8c8d';
          ctx.font = 'bold 28px Arial';
          ctx.fillText("🔒 휴식 시간", canvas.width / 2, canvas.height / 2);
        }
      };

      // 2. 이미 PIP 중이면 종료
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      // 3. 스트림 연결 및 강제 재생
      // 중요: 클릭 이벤트 직후에 바로 실행되어야 함
      drawFrame(); // 첫 프레임 미리 그리기
      
      if (!pipVideo.srcObject) {
        pipVideo.srcObject = canvas.captureStream(10);
        pipVideo.muted = true;
      }

      await pipVideo.play();

      // 4. 브라우저가 스트림을 인식할 수 있도록 아주 짧은 대기 후 PIP 요청
      setTimeout(async () => {
        try {
          await pipVideo.requestPictureInPicture();
          
          // PIP 성공 후 업데이트 인터벌 시작
          const interval = setInterval(() => {
            if (!document.pictureInPictureElement) {
              clearInterval(interval);
              return;
            }
            drawFrame();
          }, 250);
        } catch (e) {
          console.error("PIP 요청 단계 오류:", e);
          alert("PIP 요청이 거절되었습니다. 다시 클릭해주세요.");
        }
      }, 100);

    } catch (error) {
      console.error("전체 프로세스 오류:", error);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>자세 모니터링</h1>
      
      <button 
        onClick={handleTextPIP}
        style={{
          marginBottom: '30px',
          padding: '12px 30px',
          backgroundColor: '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        📺 PIP 알림창 실행
      </button>

      {isActive ? (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <WebcamView videoRef={videoRef} />
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '10px' }}>
            <p>📐 각도: <strong>{angle}°</strong> | 상태: <strong>{status}</strong></p>
          </div>
        </div>
      ) : (
        <div style={{ height: '300px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px' }}>
          <p>🔒 현재는 휴식 시간입니다.</p>
        </div>
      )}
    </div>
  );
};

export default MonitorPage;