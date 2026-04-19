import React, { useRef, useEffect, useState } from 'react';
import { useScheduledPose } from '../hooks/useScheduledPose';
import WebcamView from '../components/WebcamView';
import axios from 'axios';

const TeamMonitorPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  const sessionIdRef = useRef(null);       // 세션 ID 저장
  const sessionStartedRef = useRef(false); // ✅ 세션 중복 생성 방지

  useEffect(() => {
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    if (!pipVideoRef.current) pipVideoRef.current = document.createElement('video');

    // ✅ 이미 시작된 경우 재실행 방지
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    // 세션 시작
    const startSession = async () => {
      try {
        const res = await axios.post('/api/sessions/start', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        sessionIdRef.current = res.data.session_id;
        console.log('✅ 세션 시작:', res.data.session_id);
      } catch (e) {
        console.error('❌ 세션 시작 실패:', e);
      }
    };
    startSession();

    // 페이지 이탈 시 세션 종료
    return () => {
      if (sessionIdRef.current) {
        axios.patch(`/api/sessions/${sessionIdRef.current}/end`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(e => console.error('❌ 세션 종료 실패:', e));
      }
    };
  }, []);

  const { status, isActive, currentData } = useScheduledPose(videoRef);

  const statusRef = useRef(status);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    statusRef.current = status;
    isActiveRef.current = isActive;
  }, [status, isActive]);

  const handleTextPIP = async () => {
    try {
      if (!canvasRef.current || !pipVideoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pipVideo = pipVideoRef.current;
      canvas.width = 300; canvas.height = 160;

      const drawFrame = () => {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (isActiveRef.current) {
          ctx.fillStyle = '#2C3E50'; ctx.font = 'bold 20px Arial';
          ctx.fillText("🔍 Re:balance 모니터링", 150, 45);
          const curStatus = statusRef.current || '분석 중';
          ctx.fillStyle = curStatus === '주의' ? '#E67E22' : '#27AE60';
          ctx.font = 'bold 40px Arial'; ctx.fillText(curStatus, 150, 95);
        } else {
          ctx.fillStyle = '#7F8C8D'; ctx.font = 'bold 25px Arial';
          ctx.fillText("🔒 휴식 시간", 150, 80);
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
      await pipVideo.requestPictureInPicture();

      const interval = setInterval(() => {
        if (!document.pictureInPictureElement) { clearInterval(interval); return; }
        drawFrame();
      }, 500);
    } catch (e) { console.error("PIP 오류:", e); }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <h1 style={{ color: '#2C3E50', fontSize: '1.3rem', marginBottom: '20px' }}>실시간 자세 모니터링</h1>
      <button onClick={handleTextPIP} style={btnStyle}>📺 PIP 알림창 실행</button>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ 
          position: 'relative', borderRadius: '20px', overflow: 'hidden', 
          border: status === '주의' ? '5px solid #E67E22' : '5px solid #27AE60',
          backgroundColor: '#000', aspectRatio: '4/3'
        }}>
          <WebcamView videoRef={videoRef} />
          {status === '주의' && <div style={warningOverlayStyle}>⚠️ 자세를 바로잡으세요!</div>}
        </div>

        <div style={infoBoxStyle}>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            상태: <span style={{ color: status === '주의' ? '#E67E22' : '#27AE60' }}>{status}</span>
          </p>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '5px' }}>
            어깨: {currentData?.sw} | 목: {currentData?.nvd}
          </p>
        </div>
      </div>
    </div>
  );
};

const btnStyle = { marginBottom: '20px', padding: '10px 20px', backgroundColor: '#2C3E50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const warningOverlayStyle = { position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#E67E22', color: 'white', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' };
const infoBoxStyle = { marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };

export default TeamMonitorPage;
